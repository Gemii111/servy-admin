# Admin P1 Endpoints — Frontend Handoff

> **Audience:** Admin dashboard frontend team
> **Status:** Implemented on backend, build green, tests pass
> **Migrations:** `000033`, `000034`, `000035`, `000036` must be applied before deploy
> **Last updated:** 2026-05-17

This document covers the **P1** batch. P0 work (order cancel/tracking, password reset, rider approve, restaurant trust) is documented in `ADMIN_P0_FRONTEND_HANDOFF.md`.

---

## 1. Common conventions

Same as P0 — admin Bearer JWT or API key, `application/json`, `{ "error": "..." }` shape on failures.

---

## 2. Reports

Aliased over the existing `/admin/analytics/*` handlers so the frontend can use the spec's path verbatim. Underlying response shapes are unchanged — these are pure path aliases.

| Spec path | Returns the same payload as |
|-----------|-----------------------------|
| `GET /admin/reports/orders?date_from=&date_to=` | `GET /admin/analytics/orders` |
| `GET /admin/reports/revenue?date_from=&date_to=` | `GET /admin/analytics/financial` |
| `GET /admin/reports/revenue-by-day?date_from=&date_to=` | `GET /admin/dashboard/revenue-over-time` (last 7 days) |
| `GET /admin/reports/drivers?date_from=&date_to=` | `GET /admin/analytics/riders` |
| `GET /admin/reports/export?type=...&format=csv&date_from=&date_to=` | `GET /admin/analytics/export` |

> The analytics endpoints already accept `date_from` / `date_to` query params. CSV export is driven by `format=csv`.

---

## 3. Menu oversight

### 3.1 List a restaurant's menu (admin)

```
GET /admin/restaurants/:id/menu
```

**Response**
```json
{
  "items": [
    {
      "id": "category-uuid",
      "name": "Burgers",
      "rank": "1",
      "image_url": "...",
      "items": [
        {
          "id": "item-uuid",
          "name": "Cheeseburger",
          "price": 70,
          "is_available": true,
          "category": "Burgers",
          ...
        }
      ]
    }
  ]
}
```

Reuses the public `GetMenu` repo under the hood, so the shape matches the customer-app menu.

### 3.2 Toggle item availability

```
PUT /admin/menu/items/:id/availability
```

**Body**
```json
{ "is_available": false }
```

**Responses**
| Status | Body |
|--------|------|
| 200 | `{ "message": "Menu item availability updated", "is_available": false }` |
| 404 | `{ "error": "menu item not found" }` |

> Admin does **not** need to know the parent restaurant id — only the item id.

---

## 4. Reviews

### 4.1 Hide / unhide a review

```
PUT /admin/reviews/:id/hide
```

**Body**
```json
{ "hidden": true }
```

**Behavior**
- Sets the `hidden` flag on the review. Hidden reviews are filtered out of public listings (`GET /restaurants/:id/reviews`, `GET /riders/:id/reviews`) **and excluded from the rating + rating_count aggregates** — the migration updates the existing DB triggers to skip hidden rows.
- Send `{ "hidden": false }` to restore.
- The existing `DELETE /admin/reviews/:id` still works for hard delete.

**Responses**
| Status | Body |
|--------|------|
| 200 | `{ "message": "Review hidden flag updated", "hidden": true }` |
| 404 | `{ "error": "review not found" }` |

---

## 5. Notifications

### 5.1 Notification history

```
GET /admin/notifications/history?targetType=user|topic&page=&limit=
```

Every notification dispatched via `POST /admin/notifications/send` or `POST /admin/notifications/send-bulk` is now persisted to `admin_notification_log` and returned here in reverse chronological order.

**Response**
```json
{
  "items": [
    {
      "id": "uuid",
      "target_type": "user",
      "target_value": "user-uuid",
      "title": "Welcome back",
      "body": "...",
      "data": "{\"type\":\"PROMO\"}",
      "sent_by_admin": "admin-jwt-sub-or-api_key",
      "success": true,
      "error_message": "",
      "created_at": "2026-05-17T13:24:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 4711, "totalPages": 236 }
}
```

> Failed dispatches are logged with `success: false` and the FCM error in `error_message`, so you can surface delivery failures in the UI.

---

## 6. Flash offers

Aliased over `/admin/campaigns`. The spec asked for `/admin/flash-offers`; flash offers are just campaigns with a discount and live timeframe, so we expose the same handlers under both paths. Pick one and stick with it.

| Spec path | Equivalent campaigns path |
|-----------|---------------------------|
| `GET /admin/flash-offers` | `GET /admin/campaigns?status=active` (with discount field set) |
| `POST /admin/flash-offers` | `POST /admin/campaigns` |
| `PUT /admin/flash-offers/:id` | `PUT /admin/campaigns/:id` |
| `DELETE /admin/flash-offers/:id` | `DELETE /admin/campaigns/:id` |

The public Flutter endpoint `GET /campaigns/flash-offers` is unchanged.

---

## 7. Audit log

Every mutating admin request (POST/PUT/PATCH/DELETE returning 2xx/3xx) is now automatically recorded.

### 7.1 Query

```
GET /admin/audit-logs?actionType=&entityType=&entityId=&adminId=&dateFrom=&dateTo=&page=&limit=
```

| Query param | Type | Notes |
|-------------|------|-------|
| `actionType` | `create` \| `update` \| `delete` \| `approve` \| `other` | Inferred from HTTP method + path |
| `entityType` | `order` \| `restaurant` \| `user` \| `rider` \| `coupon` \| `review` \| `settings` \| `banner` \| `campaign` \| `notification` \| `category` \| `menu_item` \| ... | Inferred from `/admin/<resource>/...` |
| `entityId` | string | The `:id` route param at audit time |
| `adminId` | string | JWT `sub` of the admin, or the literal `api_key` when API-key auth was used |
| `dateFrom`, `dateTo` | `YYYY-MM-DD` | Inclusive bounds; backend handles the +1-day offset for `dateTo` |
| `page`, `limit` | int | Default `page=1`, `limit=20`, max `limit=200` |

### 7.2 Response

```json
{
  "logs": [
    {
      "id": "uuid",
      "adminId": "jwt-sub-or-api_key",
      "adminName": "",
      "actionType": "update",
      "entityType": "order",
      "entityId": "order-uuid",
      "method": "POST",
      "path": "/servy/api/v1/admin/orders/:id/cancel",
      "statusCode": 200,
      "description": "POST /servy/api/v1/admin/orders/:id/cancel (order-uuid)",
      "ipAddress": "1.2.3.4",
      "userAgent": "Mozilla/5.0 ...",
      "createdAt": "2026-05-17T13:24:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 124, "totalPages": 7 }
}
```

### 7.3 What gets recorded

- **All** `POST` / `PUT` / `PATCH` / `DELETE` under `/admin/*` that return a 2xx/3xx response.
- 4xx and 5xx responses are skipped — no real state change happened.
- `GET` requests are **not** audited.
- The `description` is auto-generated from method + path + entity id; if you want richer descriptions per endpoint we can enhance per-route in a follow-up.

### 7.4 Audit identity

- When auth is a JWT, `adminId` = the `sub` claim (set by middleware as `admin_id`).
- When auth is an API key, `adminId` = the literal string `api_key`. Use this to distinguish service automation from human admins.
- `adminName` is currently empty — populated later when the admin user model adds a name field.

---

## 8. Migrations required before deploy

Run them in order:

| Migration | What it does |
|-----------|--------------|
| `000033_add_restaurant_trust_elements` | Adds Trust columns (was already required for P0) |
| `000034_add_review_hidden` | Adds `hidden` column to `reviews` + updates rating triggers to skip hidden rows |
| `000035_add_admin_notification_log` | Creates `admin_notification_log` table |
| `000036_add_audit_log` | Creates `admin_audit_log` table + indexes |

All migrations are forward-only safe; down migrations are included for emergency rollback.

---

## 9. Suggested UI patterns

| Endpoint | UI hook |
|----------|---------|
| `GET /admin/reports/*` | Reuse existing analytics screens — paths are interchangeable |
| `GET /admin/restaurants/:id/menu` | Inline menu drawer on the restaurant detail page |
| `PUT /admin/menu/items/:id/availability` | Toggle switch on each menu item row |
| `PUT /admin/reviews/:id/hide` | Eye icon next to the trash icon — hidden reviews show greyed out in the list |
| `GET /admin/notifications/history` | Tab on the notifications page next to "Send" and "Stats" |
| `GET /admin/audit-logs` | New top-level "Audit" page in the admin nav. Default to the last 7 days, support filters by `entityType`/`actionType`/`adminId`. Show a search bar that filters by `entityId` |

---

## 10. What's still pending after P1

These items remain unimplemented and are P2 in the spec:

- WebSocket for admin order list + driver-location streams
- Geofence settings (`/admin/settings/geofence`)
- RBAC (per-role admin permissions)
- Rewards admin endpoints
- Per-route audit descriptions (current implementation uses auto-generated path-based summaries)
- `adminName` lookup in audit rows (requires linking admin user IDs to a display-name source)
