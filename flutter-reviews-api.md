# Reviews API — Flutter Integration Guide

Base URL: `{HOST}/servy/api/v1`

All "protected" endpoints require `Authorization: Bearer <jwt>`.

---

## TL;DR

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/orders/{orderId}/can-review` | required | Check what the user can review for an order |
| `POST` | `/reviews/restaurant` | required | Submit a restaurant review |
| `POST` | `/reviews/rider` | required | Submit a rider review |
| `GET` | `/restaurants/{id}/reviews` | public | Paginated restaurant reviews |
| `GET` | `/riders/{id}/reviews` | required | Paginated rider reviews |

Note: only **delivered** orders are reviewable, and each `(order, target_type)` pair can be reviewed once.

---

## 1. Can-Review check (call this before showing the review UI)

`GET /orders/{orderId}/can-review`

**Response 200**
```json
{
  "data": {
    "can_review_restaurant": true,
    "can_review_rider": false,
    "restaurant_id": "uuid",
    "rider_id": "uuid"
  }
}
```

- `can_review_*` is `true` only if the order is delivered AND the user hasn't already submitted that review.
- If the order has no rider (e.g. self-pickup), `rider_id` is omitted and `can_review_rider` is `false`.

**Errors**
- `401` — missing/invalid token
- `404` — order not found or not owned by user

---

## 2. Submit a restaurant review

`POST /reviews/restaurant`

**Body**
```json
{
  "order_id": "uuid",
  "rating": 5,
  "comment": "Great food, fast delivery"
}
```

- `rating` is required, integer 1–5.
- `comment` is optional (string).

**Response 201**
```json
{
  "message": "Review created successfully",
  "data": {
    "id": "uuid",
    "order_id": "uuid",
    "user_id": "uuid",
    "user_name": "Ahmed K",
    "user_image": "https://...",
    "target_type": "restaurant",
    "target_id": "uuid",
    "rating": 5,
    "comment": "Great food, fast delivery",
    "created_at": "2026-05-21T10:32:14Z"
  }
}
```

**Errors**
- `400` — invalid rating, order not delivered, order has no restaurant, already reviewed, validation failure
- `401` — missing/invalid token
- `404` — order not found or not owned by user

The server enforces the "delivered + not already reviewed" rule, so the UI should still call `can-review` first to avoid showing a button that will 400.

---

## 3. Submit a rider review

`POST /reviews/rider`

Same body shape as the restaurant endpoint.

```json
{
  "order_id": "uuid",
  "rating": 4,
  "comment": "Polite rider, smooth handoff"
}
```

**Response 201** — same shape as restaurant review, with `"target_type": "rider"`.

**Errors** — same as restaurant, plus `400 order has no rider` for pickup orders.

---

## 4. List restaurant reviews

`GET /restaurants/{id}/reviews?page=1&page_size=10`

Public endpoint — no auth needed.

- `page` defaults to `1`
- `page_size` defaults to `10`, max `50`
- Hidden (moderated) reviews are excluded.

**Response 200**
```json
{
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "user_id": "uuid",
        "user_name": "Ahmed K",
        "user_image": "https://...",
        "target_type": "restaurant",
        "target_id": "uuid",
        "rating": 5,
        "comment": "Great food",
        "created_at": "2026-05-21T10:32:14Z"
      }
    ],
    "total_count": 42,
    "page": 1,
    "page_size": 10
  }
}
```

---

## 5. List rider reviews

`GET /riders/{id}/reviews?page=1&page_size=10`

Protected. Same response shape as restaurant reviews but with `"target_type": "rider"`.

---

## Field naming reminder

Customer-facing endpoints (sections 1–5 above) use **snake_case** JSON keys: `user_name`, `target_type`, `created_at`, `order_id`, etc.

The admin endpoints use camelCase, but Flutter does not call those.

---

## Suggested Flutter flow

1. On the order details screen for a delivered order, call `GET /orders/{orderId}/can-review`.
2. Show two buttons (Rate restaurant / Rate rider) based on the boolean flags.
3. On submit, `POST` to the matching endpoint with `{ order_id, rating, comment }`.
4. On `201`, hide the corresponding button (or re-check `can-review`).
5. On `400` with `"error": "already reviewed"` or similar, treat it as success and hide the button — most likely a stale UI.

---

## Error response shape

All errors are JSON:
```json
{ "error": "human-readable reason" }
```

Map common reasons:

| HTTP | Likely cause | UX |
|------|--------------|----|
| 400 | invalid rating / not delivered / no restaurant or rider on order / already reviewed | Show inline error, refresh `can-review` |
| 401 | token expired | Force re-login |
| 404 | order not found | Pop back to order list |
| 500 | server bug | Show "Something went wrong, try again" |

---

## Recent backend fix (2026-05-21)

`GET /admin/reviews` (admin web panel only) was returning 500 due to a bad SQL column reference. This did **not** affect the Flutter endpoints above — only the admin dashboard. No Flutter code changes are required for that fix.
