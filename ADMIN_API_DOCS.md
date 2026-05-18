# Servy Admin Panel API Documentation

Base URL: `{{baseUrl}}/servy/api/v1`  
(في التطبيق: `REACT_APP_API_BASE_URL` — مثال: `https://talabat-ehpd.onrender.com/servy/api/v1`)

---

## حالة التنفيذ في لوحة الأدمن

| القسم | الحالة | ملاحظات |
|--------|--------|---------|
| **Auth** | مُنفَّذ | تسجيل الدخول، حفظ `accessToken` وتمريره في `Authorization: Bearer` |
| **Dashboard** | مُنفَّذ | إحصائيات، طلبات عبر الزمن، إيرادات، طلبات حسب الحالة، أفضل المطاعم |
| **Users** | مُنفَّذ | قائمة، تفاصيل، إنشاء، تحديث الحالة، حذف |
| **Orders** | مُنفَّذ | قائمة، تفاصيل، تحديث الحالة، تعيين سائق |
| **P2P Delivery Requests** | مُنفَّذ | قائمة، تفاصيل، تحديث الحالة، إلغاء |
| **Restaurants** | مُنفَّذ | قائمة، تفاصيل، تحديث الحالة، حذف (مع Mock عند التطوير) |
| **Categories** | مُنفَّذ | قائمة، إنشاء، تحديث، حذف، تفعيل/إيقاف (مع Mock عند التطوير) |
| **Coupons** | مُنفَّذ | قائمة، تفاصيل، إنشاء، تحديث، حذف، تفعيل/إيقاف (مع Mock عند التطوير) |

**تبديل Mock/API:** `REACT_APP_USE_MOCK_API=false` لاستخدام الـ API الحقيقي دائماً؛ إن لم يُضبط يُستخدم Mock في التطوير والـ API في الإنتاج.

---

## Authentication

All admin endpoints (except login) require:
- `Authorization: Bearer <accessToken>` (obtained from login)

---

## 1. Auth

### POST `/admin/auth/login`
No auth needed.

**Request:**
```json
{
  "email": "admin@servy.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@servy.com",
      "name": "Admin User",
      "role": "super_admin"
    },
    "accessToken": "eyJ..."
  }
}
```

**Errors:** `401` invalid credentials, `403` not admin

---

## 2. Dashboard

### GET `/admin/dashboard/statistics`
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

### GET `/admin/dashboard/orders-over-time`
Returns last 7 days.
```json
[
  { "date": "2026-03-03", "value": 45 },
  { "date": "2026-03-04", "value": 52 }
]
```

### GET `/admin/dashboard/revenue-over-time`
Returns last 7 days.
```json
[
  { "date": "2026-03-03", "value": 5200.00 },
  { "date": "2026-03-04", "value": 6100.50 }
]
```

### GET `/admin/dashboard/orders-by-status`
Returns last 30 days.
```json
[
  { "status": "pending", "count": 12 },
  { "status": "delivered", "count": 3100 },
  { "status": "cancelled", "count": 65 }
]
```

### GET `/admin/dashboard/top-restaurants`
Returns last 30 days.
```json
[
  { "name": "Pizza Palace", "orders": 320, "revenue": 15000.00 }
]
```

---

## 3. Users

### GET `/admin/users`

| Query Param | Type   | Values                                     |
|-------------|--------|--------------------------------------------|
| `userType`  | string | `customer`, `driver`, `restaurant`, `admin` |
| `status`    | string | `active`, `suspended`                      |
| `search`    | string | Search name, email, phone                  |
| `page`      | int    | Default: 1                                 |
| `limit`     | int    | Default: 10, max: 100                      |

**Response:**
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
  "pagination": { "page": 1, "limit": 10, "total": 150, "totalPages": 15 }
}
```

### GET `/admin/users/:id`
Returns single user object (same shape as list item).

### POST `/admin/users`
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "01111111111",
  "userType": "customer",
  "status": "active"
}
```
**Response (201):** `{ "message": "User created successfully", "id": "uuid" }`

### PUT `/admin/users/:id/status`
```json
{ "status": "suspended" }
```
Values: `"active"` or `"suspended"`

**Response:** `{ "message": "User status updated successfully" }`

### DELETE `/admin/users/:id`
Soft-delete (sets inactive).

**Response:** `{ "message": "User deleted successfully" }`

---

## 4. Orders

### GET `/admin/orders`

| Query Param     | Type   | Values                                                              |
|-----------------|--------|---------------------------------------------------------------------|
| `status`        | string | `pending`, `accepted`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`, `all` |
| `paymentStatus` | string | Payment status filter                                               |
| `restaurantId`  | string | Restaurant UUID                                                     |
| `orderType`     | string | `food`, `p2p`, `all`                                                |
| `search`        | string | Search by order ID, customer name/phone                             |
| `page`          | int    | Default: 1                                                          |
| `limit`         | int    | Default: 10, max: 100                                               |

**Response:**
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
  "pagination": { "page": 1, "limit": 10, "total": 3200, "totalPages": 320 }
}
```

### GET `/admin/orders/:id`
Returns single order object.

### PUT `/admin/orders/:id/status`
```json
{ "status": "accepted" }
```
**Response:** `{ "message": "Order status updated successfully" }`

### POST `/admin/orders/:id/assign-driver`
```json
{ "driverId": "rider-uuid" }
```
**Response:** `{ "message": "Driver assigned successfully" }`

---

## 5. P2P Delivery Requests

Same as orders but filtered to `order_type = 'p2p'` automatically.

### GET `/admin/delivery-requests`
Same query params as orders (except `orderType` forced to `p2p`).

### GET `/admin/delivery-requests/:id`

### PUT `/admin/delivery-requests/:id/status`
```json
{ "status": "accepted" }
```

### PUT `/admin/delivery-requests/:id/cancel`
No body needed.

**Response:** `{ "message": "Delivery request cancelled successfully" }`

---

## 6. Restaurants

### GET `/admin/restaurants`

| Query Param  | Type   | Values                                    |
|--------------|--------|-------------------------------------------|
| `status`     | string | `open`, `closed`, `pending`, `suspended`, `all` |
| `vendorType` | string | `restaurant`, `pharmacy`, `supermarket`, `all`  |
| `search`     | string | Search by name, owner email, phone        |
| `page`       | int    | Default: 1                                |
| `limit`      | int    | Default: 10, max: 100                     |

**Response:**
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "Pizza Palace",
      "ownerEmail": "owner@example.com",
      "ownerName": "Mohamed Ali",
      "phone": "01000000000",
      "cuisineType": "Italian",
      "status": "open",
      "vendorType": "restaurant",
      "totalOrders": 320,
      "totalRevenue": 15000.00,
      "rating": 4.5,
      "address": "123 Food Street",
      "description": "Best pizza in town",
      "createdAt": "2026-01-10 08:00:00"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}
```

### GET `/admin/restaurants/:id`
Returns single restaurant object (same shape as list item).

### PUT `/admin/restaurants/:id/status`
```json
{ "status": "suspended" }
```
Values: `"open"`, `"closed"`, `"pending"`, `"suspended"`

**Response:** `{ "message": "Restaurant status updated successfully" }`

### DELETE `/admin/restaurants/:id`
Soft-delete (sets status to `deleted`).

**Response:** `{ "message": "Restaurant deleted successfully" }`

---

## 7. Categories (Vendor Categories)

These are the global vendor categories (e.g., "Fast Food", "Pharmacy", "Groceries").

### GET `/admin/categories`

| Query Param | Type   | Values                        |
|-------------|--------|-------------------------------|
| `status`    | string | `active`, `inactive`, `all`   |
| `search`    | string | Search by name                |
| `page`      | int    | Default: 1                    |
| `limit`     | int    | Default: 10, max: 100         |

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Fast Food",
      "imageUrl": "https://...",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2026-01-01 00:00:00"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 8, "totalPages": 1 }
}
```

### POST `/admin/categories`
```json
{
  "name": "Healthy Food",
  "imageUrl": "https://...",
  "sortOrder": 5,
  "isActive": true
}
```
**Response (201):** Returns created category object.

### PUT `/admin/categories/:id`
All fields optional -- only send what needs updating.
```json
{
  "name": "Updated Name",
  "sortOrder": 3
}
```
**Response:** `{ "message": "Category updated successfully" }`

### DELETE `/admin/categories/:id`
Hard delete.

**Response:** `{ "message": "Category deleted successfully" }`

### PUT `/admin/categories/:id/toggle`
Toggles `isActive` between true/false. No body needed.

**Response:** `{ "message": "Category toggled successfully" }`

---

## 8. Coupons

### GET `/admin/coupons`

| Query Param | Type   | Values                                 |
|-------------|--------|----------------------------------------|
| `status`    | string | `active`, `expired`, `disabled`, `all` |
| `search`    | string | Search by code or description          |
| `page`      | int    | Default: 1                             |
| `limit`     | int    | Default: 10, max: 100                  |

**Response:**
```json
{
  "coupons": [
    {
      "id": "uuid",
      "code": "WELCOME20",
      "description": "20% off first order",
      "discount_type": "percentage",
      "discount_value": 20,
      "min_order_amount": 100,
      "max_discount": 50,
      "usage_limit": 1000,
      "usage_count": 150,
      "per_user_limit": 1,
      "valid_from": "2026-01-01T00:00:00Z",
      "valid_until": "2026-12-31T23:59:59Z",
      "is_active": true,
      "restaurant_id": null
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

### GET `/admin/coupons/:id`
Returns single coupon object.

### POST `/admin/coupons`
```json
{
  "code": "SUMMER30",
  "description": "Summer 30% off",
  "discount_type": "percentage",
  "discount_value": 30,
  "min_order_amount": 50,
  "max_discount": 100,
  "usage_limit": 500,
  "per_user_limit": 2,
  "valid_from": "2026-06-01T00:00:00Z",
  "valid_until": "2026-08-31T23:59:59Z",
  "is_active": true,
  "restaurant_id": null
}
```
`discount_type` values: `"percentage"`, `"fixed_amount"`, `"free_delivery"`

**Response (201):** `{ "data": { ...coupon object } }`

### PUT `/admin/coupons/:id`
All fields optional.
```json
{
  "discount_value": 25,
  "is_active": false
}
```
**Response:** `{ "message": "Coupon updated successfully" }`

### DELETE `/admin/coupons/:id`
Hard delete.

**Response:** `{ "message": "Coupon deleted successfully" }`

### PUT `/admin/coupons/:id/toggle`
Toggles `is_active`. No body needed.

**Response:** `{ "message": "Coupon toggled successfully" }`

---

## Common Error Responses

| Status | Description                    |
|--------|--------------------------------|
| `400`  | Bad request (invalid params)   |
| `401`  | Unauthorized (missing auth)    |
| `403`  | Forbidden (not admin)          |
| `404`  | Resource not found             |
| `409`  | Conflict (duplicate)           |
| `500`  | Internal server error          |

```json
{ "error": "error message here" }
```

---

## Dart/Flutter Integration Notes

### Base Setup
```dart
const baseUrl = 'https://your-server.com/servy/api/v1';

// After login, store token
final token = loginResponse['data']['accessToken'];

// Use for all subsequent requests
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

### Pagination Pattern
All list endpoints return the same pagination structure:
```dart
class PaginatedResponse<T> {
  final List<T> items;
  final int page;
  final int limit;
  final int total;
  final int totalPages;
}
```

### Status Values Reference
- **User status:** `active`, `suspended`
- **Order status:** `pending`, `accepted`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`
- **Restaurant status:** `open`, `closed`, `pending`, `suspended`
- **Vendor type:** `restaurant`, `pharmacy`, `supermarket`
- **Coupon discount type:** `percentage`, `fixed_amount`, `free_delivery`
- **Coupon status filter:** `active`, `expired`, `disabled`
- **Category status filter:** `active`, `inactive`

---

## Not Yet Implemented (Phase 3)

هذه الأقسام **غير موثّقة في هذا الملف** ولا توجد لها endpoints محددة أعلاه. لوحة الأدمن قد تحتوي على واجهات أو Mock لها لاحقاً:

- Rider/Driver management & ratings — إدارة السائقين وتقييماتهم
- Settings management — إعدادات النظام
- Reports & export — التقارير والتصدير
- Push notification management — إدارة الإشعارات
- Rewards/loyalty management — المكافآت والولاء
