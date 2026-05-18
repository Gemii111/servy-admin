# Admin P0 Endpoints — Frontend Handoff

> **Audience:** Admin dashboard frontend team
> **Status:** Implemented on backend, build green, tests pass
> **Migration:** `000033_add_restaurant_trust_elements` must be applied before deploy
> **Last updated:** 2026-05-17

---

## 1. Common conventions

| Item | Value |
|------|-------|
| Base URL | `https://souq-917s.onrender.com/servy/api/v1` |
| Auth | `Authorization: Bearer {adminAccessToken}` **or** admin API key (header `X-API-Key`) |
| Content-Type | `application/json` |
| Error shape | `{ "error": "human-readable message" }` |
| Success shape (mutations) | `{ "message": "..." }` (plus extra fields where noted) |

All endpoints below sit behind the admin middleware stack (`adminRateLimit` + `AdminAPIKeyAuth`).

---

## 2. Orders

### 2.1 Cancel any order (admin)

```
POST /admin/orders/:id/cancel
```

**Body** (optional):
```json
{ "reason": "Customer called and asked to cancel" }
```

**Behavior**
- Works for any non-terminal order — vendor or P2P.
- Refunds non-cash payments via Paymob automatically.
- Sends cancellation notifications to customer, restaurant, and rider (whichever are attached) with the reason text.
- Rejects orders already in `cancelled` or `delivered` with `409 Conflict`.

**Responses**
| Status | Body |
|--------|------|
| 200 | `{ "message": "Order cancelled successfully" }` |
| 404 | `{ "error": "order not found" }` |
| 409 | `{ "error": "order cannot be cancelled: delivered" }` |
| 500 | `{ "error": "..." }` |

---

### 2.2 Order tracking (admin view)

```
GET /admin/orders/:id/tracking
```

Same response shape as the existing customer endpoint `/user/orders/:id/tracking`, but admins can view any order regardless of owner.

**Sample response**
```json
{
  "order_id": "uuid",
  "status": "out_for_delivery",
  "estimated_time": {
    "min_minutes": 12,
    "max_minutes": 18,
    "is_delayed": false
  },
  "status_timeline": [
    { "status": "pending", "label": "...", "timestamp": "ISO8601" }
  ],
  "rider_info": {
    "rider_id": "uuid",
    "name": "Ahmed M.",
    "phone": "+20...",
    "vehicle": "motorcycle",
    "latitude": 30.05,
    "longitude": 31.23
  },
  "delivery_address": {
    "address_line": "...",
    "latitude": 30.05,
    "longitude": 31.23
  }
}
```

**Notes**
- `rider_info` is `null` if no rider is assigned.
- `contact_options` is **not** populated for the admin endpoint (intentional — admin contacts customer directly, not through templated copy).

---

## 3. Users

### 3.1 Reset user password (admin)

```
POST /admin/users/:id/reset-password
```

**Body** (optional):
```json
{ "new_password": "Optional explicit password" }
```

**Behavior**
- If `new_password` is provided, it's set verbatim. Must be **≥ 8 characters**.
- If omitted, the backend generates a random 12-character alphanumeric password and returns it once — display it to the admin so they can share it with the user.

**Responses**
| Status | Body |
|--------|------|
| 200 (with new_password supplied) | `{ "message": "Password reset successfully" }` |
| 200 (generated) | `{ "message": "Password reset successfully", "temporary_password": "Kx7nP2qR4mZw" }` |
| 400 | `{ "error": "new_password must be at least 8 characters" }` |
| 404 | `{ "error": "user not found" }` |

> ⚠️ The generated password is shown **only in this response**. The admin UI should surface it clearly and copy-to-clipboard it; the backend cannot retrieve it again.

---

## 4. Riders

### 4.1 Approve a rider

```
PUT /admin/riders/:id/approve
```

**Body:** none.

**Behavior**
- Sets `is_active = true` and `status = "available"` so the rider can immediately start receiving order proposals.

**Responses**
| Status | Body |
|--------|------|
| 200 | `{ "message": "Rider approved" }` |
| 400 | `{ "error": "rider ID is required" }` |
| 500 | `{ "error": "..." }` |

The existing `PUT /admin/riders/:id/status` endpoint still exists for finer-grained control (e.g., setting offline, suspended).

---

## 5. Restaurants — Trust + Create/Update

A migration adds six new columns on `restaurants`. They show up in `GET /restaurants/:id` (customer app) **and** are editable via the admin endpoints below.

### 5.1 New Trust fields

| Field | Type | Description |
|-------|------|-------------|
| `is_verified_seller` | bool | Show "Verified" badge on the customer app |
| `return_policy_summary` | string | Short description for PDP |
| `return_policy_url` | string | Link to full policy |
| `supports_secure_payment` | bool | Drives the "Secure Payment" icon row |
| `delivery_badge_label` | string | E.g., "Fast Delivery", "Free Delivery" |
| `delivery_guarantee` | string | E.g., "On-time guarantee", "30-min or free" |
| `accepted_payment_methods` | string[] | Existing field — now editable from admin |

### 5.2 Toggle "verified seller"

```
PUT /admin/restaurants/:id/verified
```

**Body:**
```json
{ "is_verified_seller": true }
```

**Responses**
| Status | Body |
|--------|------|
| 200 | `{ "message": "Restaurant verified flag updated", "is_verified_seller": true }` |
| 404 | `{ "error": "restaurant not found" }` |

---

### 5.3 Update restaurant (partial)

```
PUT /admin/restaurants/:id
```

**Body** — every field is optional; only the keys you send are updated. Send nothing and the call is a no-op.

```json
{
  "restaurant_name": "...",
  "description": "...",
  "category": "...",
  "address": "...",
  "city": "...",
  "phone": "...",
  "image_url": "https://...",
  "latitude": 30.05,
  "longitude": 31.23,
  "min_order_amount": 50,
  "delivery_fee": 15,
  "delivery_time": 25,
  "vendor_type": "restaurant",

  "is_verified_seller": true,
  "return_policy_summary": "Free returns within 24h",
  "return_policy_url": "https://souq.example/returns",
  "supports_secure_payment": true,
  "delivery_badge_label": "Fast Delivery",
  "delivery_guarantee": "On-time or it's free",
  "accepted_payment_methods": ["cash", "card", "wallet"]
}
```

**Behavior**
- Updates only the keys present in the JSON body.
- If both `latitude` **and** `longitude` are sent, the PostGIS `location` column is updated atomically so map queries stay in sync. Sending only one is allowed but `location` is not touched.

**Responses**
| Status | Body |
|--------|------|
| 200 | `{ "message": "Restaurant updated successfully" }` |
| 400 | `{ "error": "..." }` |
| 404 | `{ "error": "restaurant not found" }` |

---

### 5.4 Create restaurant from admin

```
POST /admin/restaurants
```

**Body:**
```json
{
  "owner_user_id": "uuid",
  "owner_email": "owner@example.com",
  "restaurant_name": "Awesome Burgers",
  "description": "...",
  "category": "...",
  "address": "...",
  "city": "...",
  "latitude": 30.05,
  "longitude": 31.23,
  "phone": "+20...",
  "min_order_amount": 50,
  "image_url": "https://...",
  "delivery_fee": 15,
  "delivery_time": 25,
  "vendor_type": "restaurant"
}
```

**Owner resolution**
- Send **either** `owner_user_id` or `owner_email` — `owner_user_id` is preferred if both are present.
- The user must already exist and be active. The endpoint does **not** create a new user account.
- One owner can own only one non-deleted restaurant (existing constraint).

**Required fields:** `restaurant_name`, `latitude`, `longitude`, and an owner identifier.

**Responses**
| Status | Body |
|--------|------|
| 201 | `{ "id": "new-restaurant-uuid", "message": "Restaurant created successfully" }` |
| 400 | `{ "error": "owner user not found" }` / `{ "error": "owner_user_id or owner_email is required" }` |
| 500 | `{ "error": "..." }` (typically `restaurant already exists for owner`) |

---

## 6. Suggested UI patterns

| Endpoint | UI hook |
|----------|---------|
| `POST /admin/orders/:id/cancel` | Add "Cancel order" button on order detail page with a confirmation modal and an optional reason textarea. Disable button when status is `cancelled` or `delivered`. |
| `GET /admin/orders/:id/tracking` | Reuse the existing tracking widget — same response shape as customer. |
| `POST /admin/users/:id/reset-password` | "Reset password" action on the user detail page. Show a modal with two paths: "Generate temp password" (no body) or "Set explicit password" (with input). After success, render the `temporary_password` in a copy-to-clipboard box. |
| `PUT /admin/riders/:id/approve` | "Approve" button on a rider's profile when their status is pending/inactive. |
| `PUT /admin/restaurants/:id/verified` | Toggle switch on restaurant detail. |
| `PUT /admin/restaurants/:id` | Dedicated form with grouped sections (Basics, Location, Pricing, **Trust Elements**). |
| `POST /admin/restaurants` | New form. Add a search-by-email field that resolves to an owner before submit. |

---

## 7. What's not in this batch (still pending on backend)

These items from the spec are **not yet implemented** — coordinate with backend before wiring UI:

- `GET /admin/orders` — `cancel` (✅ done) but `reason` is logged into `cancellation_reason`; UI can show it via the existing `GET /admin/orders/:id` once we expose that column on the response.
- Audit log (`/admin/audit-logs`) — not started.
- `PUT /admin/reviews/:id/hide` — not started (only hard delete exists).
- `GET /admin/notifications/history` — not started.
- `GET /admin/restaurants/:restaurantId/menu` + `PUT /admin/menu/items/:id/availability` — not started.
- Geofence settings — not started.
- Reports endpoints (`/admin/reports/*`) — backend currently exposes the equivalent under `/admin/analytics/*`; check if you want to alias or rename.

---

## 8. Migration / deployment checklist

- [ ] Run `migrate up` to apply `000033_add_restaurant_trust_elements`.
- [ ] Existing restaurants get `is_verified_seller = FALSE` and `supports_secure_payment = FALSE` by default. Other Trust fields are nullable and returned as `""` by the public endpoint.
- [ ] No frontend env changes required — same `REACT_APP_API_BASE_URL` works.
- [ ] Customer app (Flutter): the new Trust fields are already included in `GET /restaurants/:id`; expose them in the PDP UI once the design is ready.
