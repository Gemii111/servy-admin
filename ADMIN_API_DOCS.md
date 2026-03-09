# Admin Panel API Documentation

Base URL: `/servy/api/v1`

## Authentication

All admin endpoints (except login) require one of:
- **JWT Bearer Token**: `Authorization: Bearer <accessToken>` (obtained from login)
- **API Key**: `X-API-Key: <key>`

---

## 1. Admin Auth

### POST `/servy/api/v1/admin/auth/login`

Login as admin. No auth header required.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "accessToken": "eyJ..."
  }
}
```

**Error Responses:**
- `401` - Invalid credentials: `{ "success": false, "message": "invalid admin credentials" }`
- `403` - Not an admin: `{ "success": false, "message": "user is not an admin" }`

---

## 2. Dashboard

All dashboard endpoints require admin auth.

### GET `/servy/api/v1/admin/dashboard/statistics`

**Response (200):**
```json
{
  "totalUsers": 1500,
  "totalOrders": 3200,
  "totalRevenue": 125000.50,
  "activeRestaurants": 45,
  "activeDrivers": 30,
  "pendingOrders": 12
}
```

### GET `/servy/api/v1/admin/dashboard/orders-over-time`

Returns daily order counts for the last 7 days.

**Response (200):**
```json
[
  { "date": "2026-02-26", "value": 45 },
  { "date": "2026-02-27", "value": 52 },
  { "date": "2026-02-28", "value": 38 }
]
```

### GET `/servy/api/v1/admin/dashboard/revenue-over-time`

Returns daily revenue for the last 7 days.

**Response (200):**
```json
[
  { "date": "2026-02-26", "value": 5200.00 },
  { "date": "2026-02-27", "value": 6100.50 },
  { "date": "2026-02-28", "value": 4800.75 }
]
```

### GET `/servy/api/v1/admin/dashboard/orders-by-status`

Returns order counts grouped by status (last 30 days).

**Response (200):**
```json
[
  { "status": "pending", "count": 12 },
  { "status": "accepted", "count": 8 },
  { "status": "preparing", "count": 5 },
  { "status": "ready", "count": 3 },
  { "status": "out_for_delivery", "count": 7 },
  { "status": "delivered", "count": 3100 },
  { "status": "cancelled", "count": 65 }
]
```

### GET `/servy/api/v1/admin/dashboard/top-restaurants`

Returns top restaurants by revenue (last 30 days).

**Response (200):**
```json
[
  { "name": "Pizza Palace", "orders": 320, "revenue": 15000.00 },
  { "name": "Burger House", "orders": 280, "revenue": 12500.00 }
]
```

---

## 3. User Management

### GET `/servy/api/v1/admin/users`

List users with filtering and pagination.

**Query Parameters:**
| Param      | Type   | Description                                         |
|------------|--------|-----------------------------------------------------|
| `userType` | string | Filter by type: `customer`, `driver`, `restaurant`, `admin` |
| `status`   | string | Filter by status: `active`, `suspended`             |
| `search`   | string | Search by name, email, or phone (ILIKE)             |
| `page`     | int    | Page number (default: 1)                            |
| `limit`    | int    | Items per page (default: 10, max: 100)              |

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "01000000000",
      "userType": "customer",
      "status": "active",
      "totalOrders": 15,
      "totalSpent": 2500.00,
      "createdAt": "2026-01-15 10:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### GET `/servy/api/v1/admin/users/:id`

Get a single user's details.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01000000000",
  "userType": "customer",
  "status": "active",
  "totalOrders": 15,
  "totalSpent": 2500.00,
  "createdAt": "2026-01-15 10:30:00"
}
```

**Error:** `404` if user not found.

### POST `/servy/api/v1/admin/users`

Create a new user.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "01111111111",
  "userType": "customer",
  "status": "active"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "id": "uuid"
}
```

Note: Password defaults to `"password"` and the user's `name` is split into `first_name` / `last_name` on the first space.

### PUT `/servy/api/v1/admin/users/:id/status`

Update a user's status (activate or suspend).

**Request Body:**
```json
{
  "status": "suspended"
}
```

Values: `"active"` or `"suspended"`.

**Response (200):**
```json
{
  "message": "User status updated successfully"
}
```

### DELETE `/servy/api/v1/admin/users/:id`

Soft-delete a user (sets `is_active = false`).

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 4. Order Management

### GET `/servy/api/v1/admin/orders`

List all orders with filtering and pagination.

**Query Parameters:**
| Param          | Type   | Description                                                     |
|----------------|--------|-----------------------------------------------------------------|
| `status`       | string | Filter by status: `pending`, `accepted`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`, or `all` |
| `paymentStatus`| string | Filter by payment status                                        |
| `restaurantId` | string | Filter by restaurant UUID                                       |
| `orderType`    | string | Filter by order type: `food`, `p2p`, or `all`                   |
| `search`       | string | Search by order ID, customer name, or customer phone            |
| `page`         | int    | Page number (default: 1)                                        |
| `limit`        | int    | Items per page (default: 10, max: 100)                          |

**Response (200):**
```json
{
  "orders": [
    {
      "id": "uuid",
      "orderNumber": "uuid",
      "customerId": "uuid",
      "customerName": "John Doe",
      "customerPhone": "01000000000",
      "restaurantId": "uuid",
      "restaurantName": "Pizza Palace",
      "driverId": "uuid",
      "driverName": "Ahmed Ali",
      "status": "delivered",
      "subtotal": 150.00,
      "deliveryFee": 20.00,
      "discount": 10.00,
      "total": 160.00,
      "paymentMethod": "cash",
      "deliveryAddress": "123 Main St",
      "notes": "Extra napkins",
      "orderType": "food",
      "createdAt": "2026-03-01 14:30:00",
      "updatedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3200,
    "totalPages": 320
  }
}
```

### GET `/servy/api/v1/admin/orders/:id`

Get a single order's full details.

**Response (200):** Same shape as a single order object above.

**Error:** `404` if order not found.

### PUT `/servy/api/v1/admin/orders/:id/status`

Update an order's status.

**Request Body:**
```json
{
  "status": "accepted"
}
```

Valid statuses: `pending`, `accepted`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`.

Each status update also sets the corresponding timestamp column (e.g. `accepted_at`, `preparing_at`, `delivered_at`, `cancelled_at`).

**Response (200):**
```json
{
  "message": "Order status updated successfully"
}
```

### POST `/servy/api/v1/admin/orders/:id/assign-driver`

Assign a driver/rider to an order.

**Request Body:**
```json
{
  "driverId": "rider-uuid"
}
```

Note: `driverId` maps to `rider_id` in the database. Sets `assigned_at` timestamp.

**Response (200):**
```json
{
  "message": "Driver assigned successfully"
}
```

---

## 5. P2P Delivery Requests

These endpoints are identical to order management but automatically filter by `order_type = 'p2p'`.

### GET `/servy/api/v1/admin/delivery-requests`

List P2P delivery requests. Same query params as orders (except `orderType` is forced to `p2p`).

**Response (200):** Same shape as order list response.

### GET `/servy/api/v1/admin/delivery-requests/:id`

Get a single P2P delivery request detail.

**Response (200):** Same shape as single order object.

### PUT `/servy/api/v1/admin/delivery-requests/:id/status`

Update a P2P delivery request status.

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Response (200):**
```json
{
  "message": "Order status updated successfully"
}
```

### PUT `/servy/api/v1/admin/delivery-requests/:id/cancel`

Cancel a P2P delivery request (sets status to `cancelled`). No request body needed.

**Response (200):**
```json
{
  "message": "Delivery request cancelled successfully"
}
```

---

## Common Error Responses

All endpoints may return:

| Status | Description |
|--------|-------------|
| `400`  | Bad request (invalid params or body) |
| `401`  | Unauthorized (missing or invalid auth) |
| `403`  | Forbidden (not an admin) |
| `404`  | Resource not found |
| `500`  | Internal server error |

Error format:
```json
{
  "error": "error message here"
}
```

Or for auth endpoints:
```json
{
  "success": false,
  "message": "error message here"
}
```

---

## Not Yet Implemented (Phase 2 & 3)

The following admin features are planned but not yet available:
- Restaurant management (CRUD, approval, menu categories)
- Coupon management
- Rider/driver management & ratings
- Settings management
- Reports & export
- Push notification management
- Rewards/loyalty management
