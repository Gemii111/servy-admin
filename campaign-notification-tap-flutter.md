# Campaign Push Notifications — Flutter Integration

**Audience:** Flutter app developer
**Backend contract version:** 2026-05-19
**Related endpoints:** `POST /notifications/register-token`, `GET /campaigns/active`, `GET /banners`, `POST /coupons/validate`

This doc explains exactly what the backend sends when an admin fires a campaign push, and what the app must do when the user taps the notification.

---

## 1. The FCM payload you will receive

When an admin calls `POST /admin/campaigns/:id/notify` (or its alias `/send-notification`), the backend sends an FCM message shaped like this:

```json
{
  "notification": {
    "title": "<campaign.notification_title or campaign.name>",
    "body":  "<campaign.notification_body  or campaign.description>"
  },
  "data": {
    "type":          "campaign",
    "campaign_id":   "<uuid>",
    "banner_id":     "<uuid>",        // optional — present only if the campaign has a banner
    "coupon_id":     "<uuid>",        // optional — present only if the campaign has a coupon
    "restaurant_id": "<uuid>"         // optional — present only if the campaign targets a restaurant
  }
}
```

Notes:
- `type` is **lowercase** `"campaign"`. Match against that exact string.
- The optional IDs are only present when the campaign has them linked. Treat their absence as "not applicable" — never assume an empty string or `null`.
- Title/body come from the campaign record; the backend falls back to `name`/`description` if the dedicated notification fields are empty, so you can rely on them being non-empty.

The message is sent to one of three FCM topics depending on the campaign segment:
- `campaigns_all`
- `campaigns_new_user`
- `campaigns_loyal_user`

**Action required on your side:** subscribe the user to the topic(s) that match their segment after login. Without subscription, the push will never arrive.

```dart
await FirebaseMessaging.instance.subscribeToTopic('campaigns_all');
if (user.isNewUser)   await FirebaseMessaging.instance.subscribeToTopic('campaigns_new_user');
if (user.isLoyal)     await FirebaseMessaging.instance.subscribeToTopic('campaigns_loyal_user');
```

---

## 2. Tap handling — routing rules

When the user taps the notification, the app opens and you receive the `data` map. Decide where to navigate using this priority order:

```
if type != "campaign"  -> not a campaign push, ignore (let your other handlers take it)

else if coupon_id     present -> open cart/offers screen with coupon hint pre-filled
else if restaurant_id present -> open restaurant detail screen
else if banner_id     present -> open the banner's action_url (deep link) or home
else                          -> open campaign details screen (fetch via campaign_id)
```

Rationale: the most actionable link wins. A coupon means "go redeem this," a restaurant means "go browse this place," a banner is a generic landing, and `campaign_id` alone means "show the offer details."

Skeleton:

```dart
void handleNotificationTap(RemoteMessage message) {
  final data = message.data;
  if (data['type'] != 'campaign') return;

  final campaignId   = data['campaign_id'];
  final couponId     = data['coupon_id'];
  final restaurantId = data['restaurant_id'];
  final bannerId     = data['banner_id'];

  if (couponId != null && couponId.isNotEmpty) {
    navigator.pushNamed('/cart', arguments: {'couponId': couponId, 'campaignId': campaignId});
    return;
  }
  if (restaurantId != null && restaurantId.isNotEmpty) {
    navigator.pushNamed('/restaurant', arguments: {'restaurantId': restaurantId, 'campaignId': campaignId});
    return;
  }
  if (bannerId != null && bannerId.isNotEmpty) {
    // Optionally fetch the banner to read its action_url, or just open home.
    navigator.pushNamed('/home', arguments: {'bannerId': bannerId});
    return;
  }
  navigator.pushNamed('/campaigns/details', arguments: {'campaignId': campaignId});
}
```

Wire this into all three lifecycle paths:

| State when push arrives | Where to register the handler |
|---|---|
| App in foreground | `FirebaseMessaging.onMessage` — show in-app notification, route on user tap |
| App in background (user taps push) | `FirebaseMessaging.onMessageOpenedApp` |
| App terminated (user taps push, app cold-starts) | `FirebaseMessaging.instance.getInitialMessage()` on app start |

Use `data` (not `notification`) for routing — on Android background, only `data` is delivered to your handler reliably.

---

## 3. Token registration (prerequisite)

Without a registered FCM token, the user cannot be addressed. Call this after login and on every token refresh:

```
POST /servy/api/v1/notifications/register-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token":    "<fcm_token>",
  "platform": "android" | "ios"
}
```

Re-call it on `FirebaseMessaging.instance.onTokenRefresh` — tokens rotate.

---

## 4. Endpoints you'll call from the tap routes

| Route | Endpoint | Use |
|---|---|---|
| `/campaigns/details` | `GET /campaigns/active?segment=<segment>` | Find the campaign by `campaign_id` from the returned list (or call campaign detail if added later) |
| `/restaurant` | existing restaurant detail endpoint | Pass `campaign_id` so you can show "Active offer: …" header |
| `/cart` | `POST /coupons/validate` when the user is ready to apply the coupon | Use `coupon_id` to look up the coupon code; do **not** apply discount client-side |
| `/home` | `GET /banners` | Banner with `id == banner_id` will be in the list; use its `action_url` if present |

`GET /campaigns/active` returns only campaigns where `status=active`, today is within `start_date`/`end_date`, and `user_segment` matches. If the user taps an older push for an expired campaign, `campaign_id` may not be in the list — fall back to home with a toast.

---

## 5. What the backend does NOT do (yet)

- **No per-user delivery or open tracking.** The backend currently sends to a topic and does not record which users received or tapped the notification. If product asks "who opened the push," we need a follow-up change to switch to token-based sending and add a tap-tracking endpoint. Don't build app-side logic that assumes the backend knows.
- **No campaign-detail endpoint.** Currently you fetch the active list and find your `campaign_id` in it. If you need a direct `GET /campaigns/:id` for clients, ask backend to add it.

---

## 6. Quick test checklist

- [ ] Token registered after login (`POST /notifications/register-token` returns 200)
- [ ] Subscribed to `campaigns_all` (and `_new_user` / `_loyal_user` if applicable)
- [ ] Admin sends a campaign push — title/body appear on the lock screen
- [ ] Tap in **foreground**: routes correctly (try each combination: coupon-only, restaurant-only, banner-only, none)
- [ ] Tap in **background**: routes correctly
- [ ] Tap from **terminated**: routes correctly (`getInitialMessage` path)
- [ ] Expired-campaign push gracefully falls back to home

---

## 7. Contract changes that would break the app

Tell backend if any of these change so we keep contract in sync:
- `data.type` value or casing
- Key names in `data` (`campaign_id`, `coupon_id`, `restaurant_id`, `banner_id`)
- Topic names (`campaigns_all`, `campaigns_new_user`, `campaigns_loyal_user`)
- FCM data.type for campaign push (POST /admin/campaigns/:id/notify): canonical value is "campaign" (lowercase). Compare case-insensitively; do not rely on "CAMPAIGN".
Current behavior is locked to the values above. Any drift in either direction silently breaks notification routing.
