# Servy Admin Panel API - Phase 3

Base URL: `{{baseUrl}}/servy/api/v1`

All endpoints require `Authorization: Bearer <accessToken>` (admin JWT from login).

---

## 1. Riders

### GET `/admin/riders`

| Query Param   | Type   | Values                                                                  |
|---------------|--------|-------------------------------------------------------------------------|
| `status`      | string | `available`, `heading_to_restaurant`, `at_restaurant`, `delivering`, `offline`, `all` |
| `vehicleType` | string | `motorcycle`, `car`, `bike`, `all`                                      |
| `isActive`    | string | `true`, `false` (omit for all)                                          |
| `search`      | string | Search by name, phone, email                                            |
| `page`        | int    | Default: 1                                                              |
| `limit`       | int    | Default: 10, max: 100                                                   |

**Response:**
```json
{
  "riders": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Ahmed Ali",
      "phone": "01000000000",
      "email": "ahmed@example.com",
      "vehicleType": "motorcycle",
      "vehiclePlate": "ABC 123",
      "status": "available",
      "isActive": true,
      "totalDeliveries": 150,
      "rating": 4.8,
      "ratingCount": 120,
      "createdAt": "2026-01-15 10:30:00"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 30, "totalPages": 3 }
}
```

### GET `/admin/riders/stats`

**Response:**
```json
{
  "data": {
    "totalRiders": 50,
    "activeRiders": 45,
    "onlineRiders": 20,
    "totalDeliveries": 5000,
    "averageRating": 4.6,
    "byStatus": [
      { "status": "available", "count": 15 },
      { "status": "delivering", "count": 5 },
      { "status": "offline", "count": 30 }
    ],
    "byVehicle": [
      { "vehicleType": "motorcycle", "count": 35 },
      { "vehicleType": "car", "count": 10 },
      { "vehicleType": "bike", "count": 5 }
    ]
  }
}
```

### GET `/admin/riders/:id`

Returns full rider object with location data, current orders, etc.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "rider_name": "Ahmed Ali",
    "phone": "01000000000",
    "vehicle_type": "motorcycle",
    "vehicle_plate": "ABC 123",
    "status": "available",
    "current_location": { "latitude": 30.0444, "longitude": 31.2357 },
    "current_order_count": 0,
    "total_deliveries": 150,
    "rating": 4.8,
    "rating_count": 120,
    "is_active": true,
    "last_location_update": "2026-03-12T10:30:00Z",
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

### PUT `/admin/riders/:id/status`

**Request (toggle active):**
```json
{ "isActive": false }
```

**Request (change operational status):**
```json
{ "status": "offline" }
```

Both fields are optional -- send one or both.

**Response:** `{ "message": "Rider status updated successfully" }`

---

## 2. Reviews

### GET `/admin/reviews`

| Query Param  | Type   | Values                            |
|--------------|--------|-----------------------------------|
| `targetType` | string | `restaurant`, `rider`, `all`      |
| `rating`     | int    | `1`-`5` (exact match, 0 for all)  |
| `search`     | string | Search by user name or comment    |
| `page`       | int    | Default: 1                        |
| `limit`      | int    | Default: 10, max: 100             |

**Response:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "targetType": "restaurant",
      "targetId": "uuid",
      "targetName": "Pizza Palace",
      "rating": 5,
      "comment": "Great food!",
      "createdAt": "2026-03-01 14:30:00"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 200, "totalPages": 20 }
}
```

### DELETE `/admin/reviews/:id`

Deletes a review (moderation). The database trigger will automatically recalculate the target's average rating.

**Response:** `{ "message": "Review deleted successfully" }`

**Errors:** `404` review not found

---

## 3. Notifications

### POST `/admin/notifications/send`

Send notification to a specific user.

**Request:**
```json
{
  "user_id": "uuid",
  "title": "Special Offer!",
  "body": "Get 20% off your next order",
  "data": {
    "type": "PROMO",
    "screen": "offers"
  }
}
```

`data` is optional -- key-value pairs for client-side handling.

**Response:** `{ "message": "Notification sent successfully" }`

### POST `/admin/notifications/send-bulk`

Broadcast notification to all users via FCM topic.

**Request:**
```json
{
  "title": "App Update",
  "body": "New features are available!",
  "topic": "all",
  "data": {
    "type": "ANNOUNCEMENT"
  }
}
```

`topic` defaults to `"all"` if omitted. Other values: `"customers"`, `"drivers"`.

**Response:** `{ "message": "Bulk notification sent successfully" }`

### GET `/admin/notifications/stats`

**Response:**
```json
{
  "data": {
    "totalTokens": 1200,
    "byPlatform": [
      { "platform": "android", "count": 800 },
      { "platform": "ios", "count": 350 },
      { "platform": "web", "count": 50 }
    ]
  }
}
```

---

## 4. Loyalty

### GET `/admin/loyalty/accounts`

| Query Param | Type   | Values                    |
|-------------|--------|---------------------------|
| `search`    | string | Search by name or email   |
| `page`      | int    | Default: 1                |
| `limit`     | int    | Default: 10, max: 100     |

**Response:**
```json
{
  "accounts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "email": "john@example.com",
      "currentBalance": 500,
      "lifetimeEarned": 1200,
      "createdAt": "2026-01-15 10:30:00"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 800, "totalPages": 80 }
}
```

### GET `/admin/loyalty/accounts/:userId`

Returns a user's loyalty account details + recent transaction history.

**Response:**
```json
{
  "data": {
    "account": {
      "current_balance": 500,
      "lifetime_earned": 1200,
      "redeemable_value": 50.0
    },
    "transactions": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "order_id": "uuid",
        "tx_type": "earned",
        "points": 50,
        "balance_after": 500,
        "description": "Earned 50 points from order",
        "expires_at": "2026-06-15T10:30:00Z",
        "created_at": "2026-03-15T10:30:00Z"
      }
    ],
    "totalCount": 25
  }
}
```

**Transaction types:** `earned`, `redeemed`, `expired`, `adjustment`

### GET `/admin/loyalty/stats`

**Response:**
```json
{
  "data": {
    "totalAccounts": 800,
    "totalPointsBalance": 150000,
    "totalLifetimeEarned": 500000,
    "totalPointsRedeemed": 120000
  }
}
```

### POST `/admin/loyalty/adjust`

Manually add or remove points for a user.

**Request:**
```json
{
  "user_id": "uuid",
  "points": 100,
  "description": "Compensation for delayed order"
}
```

Use negative `points` to deduct (e.g., `-50`).

**Response:** `{ "message": "Points adjusted successfully" }`

**Errors:** `404` user not found

---

## 5. Settings

### GET `/admin/settings`

Returns all configurable app settings.

**Response:**
```json
{
  "data": [
    {
      "key": "delivery_base_fee",
      "value": "10",
      "description": "Base delivery fee in EGP",
      "updatedAt": "2026-01-01 00:00:00"
    },
    {
      "key": "delivery_price_per_km",
      "value": "5",
      "description": "Price per km for delivery",
      "updatedAt": "2026-01-01 00:00:00"
    },
    {
      "key": "loyalty_earn_rate",
      "value": "1",
      "description": "Points earned per EGP spent",
      "updatedAt": "2026-01-01 00:00:00"
    },
    {
      "key": "maintenance_mode",
      "value": "false",
      "description": "Enable maintenance mode",
      "updatedAt": "2026-01-01 00:00:00"
    }
  ]
}
```

**Default settings keys:**

| Key                        | Default | Description                      |
|----------------------------|---------|----------------------------------|
| `delivery_base_fee`        | `10`    | Base delivery fee in EGP         |
| `delivery_price_per_km`    | `5`     | Price per km for delivery        |
| `delivery_free_km`         | `2`     | Free km included in base fee     |
| `loyalty_earn_rate`        | `1`     | Points earned per EGP spent      |
| `loyalty_redeem_rate`      | `0.1`   | EGP value per loyalty point      |
| `loyalty_expiry_days`      | `90`    | Days before points expire        |
| `maintenance_mode`         | `false` | Enable maintenance mode          |
| `min_order_amount`         | `50`    | Minimum order amount in EGP      |
| `max_delivery_distance_km` | `20`    | Maximum delivery distance        |

### PUT `/admin/settings`

Bulk update settings. Only send the keys you want to change.

**Request:**
```json
{
  "settings": {
    "delivery_base_fee": "15",
    "min_order_amount": "60",
    "maintenance_mode": "true"
  }
}
```

All values are strings (stored as text in DB).

**Response:** `{ "message": "Settings updated successfully" }`

---

## Dart/Flutter Integration Notes

### New Endpoints Summary

```dart
// Riders
GET    /admin/riders                       // list with filters
GET    /admin/riders/stats                  // fleet stats
GET    /admin/riders/:id                    // rider detail
PUT    /admin/riders/:id/status             // update status

// Reviews
GET    /admin/reviews                       // list with filters
DELETE /admin/reviews/:id                   // delete review

// Notifications
POST   /admin/notifications/send            // send to user
POST   /admin/notifications/send-bulk       // broadcast
GET    /admin/notifications/stats           // token stats

// Loyalty
GET    /admin/loyalty/accounts              // list accounts
GET    /admin/loyalty/accounts/:userId      // user detail
GET    /admin/loyalty/stats                 // aggregate stats
POST   /admin/loyalty/adjust                // adjust points

// Settings
GET    /admin/settings                      // get all
PUT    /admin/settings                      // bulk update
```

### Status Values Reference

- **Rider status:** `available`, `heading_to_restaurant`, `at_restaurant`, `delivering`, `offline`
- **Rider vehicle type:** `motorcycle`, `car`, `bike`
- **Review target type:** `restaurant`, `rider`
- **Loyalty tx type:** `earned`, `redeemed`, `expired`, `adjustment`
- **Settings values:** all stored as strings, parse on client side (`"true"` / `"false"` for booleans, `"10"` for numbers)

### Pagination Pattern

Same pattern as Phase 1-2:
```dart
class PaginatedResponse<T> {
  final List<T> items;
  final int page;
  final int limit;
  final int total;
  final int totalPages;
}
```

### Common Error Format
```json
{ "error": "error message here" }
```

| Status | Description                  |
|--------|------------------------------|
| `400`  | Bad request / invalid params |
| `401`  | Unauthorized                 |
| `403`  | Forbidden (not admin)        |
| `404`  | Resource not found           |
| `500`  | Internal server error        |
| `503`  | Service unavailable (e.g., notifications disabled) |
