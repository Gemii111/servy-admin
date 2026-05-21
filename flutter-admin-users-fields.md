# Admin Users API — New Response Fields

Base URL: `{HOST}/servy/api/v1`

Affected endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/admin/users` | Paginated list of users (admin) |
| `GET` | `/admin/users/:id` | Single user detail (admin) |

Both endpoints already existed; this change **only widens the response payload**. No request shape or query params changed. Existing fields keep their names and types — nothing is renamed or removed.

---

## What's new

Seven fields added to each user object:

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `first_name` | `string` | no | Raw first name from DB |
| `last_name` | `string` | no | Raw last name from DB. Can be empty string for social-signin users who never set one |
| `image_url` | `string \| null` | yes | Profile picture URL. `null` if the user never uploaded one |
| `is_email_verified` | `bool` | no | Email-verification flag. **Not** the same thing as driver KYC verification (drivers are verified manually by admins via `PUT /admin/users/:id/verify`) |
| `last_login_at` | `string \| null` | yes | ISO timestamp of last successful login. `null` for users who never logged in (e.g. seeded accounts) |
| `last_seen_at` | `string \| null` | yes | ISO timestamp of last activity. **See caveat below** |
| `restaurant_id` | `string \| null` | yes | Restaurant UUID owned by this user. Only populated for users where `userType == "restaurant"`; `null` for everyone else |

The pre-existing `name` field (concatenation of first + last) is still returned for backwards compatibility — feel free to switch to `first_name` / `last_name` whenever convenient.

---

## Full example response

`GET /admin/users/:id`

```json
{
  "id": "8c3e1d62-…",
  "name": "Omar Khaled",
  "first_name": "Omar",
  "last_name": "Khaled",
  "email": "omar@example.com",
  "phone": "01000000000",
  "userType": "customer",
  "status": "active",
  "image_url": "https://cdn.example.com/u/8c3e.jpg",
  "is_email_verified": true,
  "last_login_at": "2026-05-20 14:22:01",
  "last_seen_at": "2026-05-21 09:10:44",
  "restaurant_id": null,
  "totalOrders": 12,
  "totalSpent": 1450.75,
  "createdAt": "2025-11-03 18:00:00"
}
```

`GET /admin/users` returns the same object shape inside `users: [...]`, alongside the existing `pagination` block.

---

## Caveats to be aware of in the UI

### `last_seen_at` is not real-time

Backed by `users.last_activity` which **is only refreshed when the user updates their profile**, not on every authenticated request. So:

- For an active user who hasn't touched their profile recently, `last_seen_at` will look stale.
- Don't render it as a literal "online now" indicator. Either:
  - Show it as "last profile activity" / "last update", **or**
  - Leave it hidden until a future iteration lands real presence tracking.

A proper presence/online signal is planned but not in this change.

### `is_email_verified` ≠ driver verification

Driver onboarding verification is done **manually by admins** through `PUT /admin/users/:id/verify`. The `is_email_verified` flag is unrelated to that flow — it only tells you whether the user confirmed their email address. Don't gate driver-related UI on it.

### `restaurant_id` is only meaningful for restaurant users

It's `null` for customers, drivers, and admins. Don't render it on those user types. For `userType == "restaurant"` it points to the restaurant record this user operates.

### Nullable handling

Four of the new fields can be `null` (`image_url`, `last_login_at`, `last_seen_at`, `restaurant_id`). Make sure your model uses nullable types (`String?` / `DateTime?` in Dart). The existing fields keep their old non-null shape.

---

## Suggested Dart model diff

```dart
class AdminUser {
  final String id;
  final String name;
  final String firstName;     // new
  final String lastName;      // new
  final String email;
  final String phone;
  final String userType;
  final String status;
  final String? imageUrl;     // new, nullable
  final bool isEmailVerified; // new
  final DateTime? lastLoginAt; // new, nullable
  final DateTime? lastSeenAt;  // new, nullable
  final String? restaurantId;  // new, nullable
  final int totalOrders;
  final double totalSpent;
  final DateTime createdAt;
}
```

No breaking changes — adding the new fields to your existing model and ignoring them at first is safe.
