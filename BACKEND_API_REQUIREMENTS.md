# متطلبات الباك إند لوحة الإدارة - Servy Admin
## دليل شامل لكل الـ API المطلوبة للعمل ببيانات حقيقية

---

## 1. إعدادات الاتصال

| البند | القيمة الافتراضية |
|-------|-------------------|
| **Base URL** | `https://talabat-ehpd.onrender.com/servy/api/v1` |
| **Headers** | `Content-Type: application/json` |
| **Authorization** | `Bearer <access_token>` |
| **Timeout** | 60 ثانية |

### استجابة الـ API الموحدة
جميع الاستجابات الناجحة يُفضّل أن تتبع الشكل التالي:
```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

استجابة الخطأ:
```json
{
  "success": false,
  "message": "Error message",
  "errors": { "field": ["error1", "error2"] }
}
```

### Pagination
جميع القوائم تستخدم نفس الشكل:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 2. المصادقة (Authentication)

### 2.1 تسجيل دخول الأدمن
**يجب إضافة نوع مستخدم `admin` في الباك إند.**

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/admin/auth/login` أو تعديل `/user/signin` لدعم admin | تسجيل دخول الأدمن |

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "super_admin | admin | moderator"
    },
    "accessToken": "jwt-token-string"
  }
}
```

**ملاحظة:** التطبيق حالياً يحفظ التوكن في `localStorage` تحت مفتاح `servy_admin_auth` كـ `{ token, admin }`.

---

## 3. لوحة التحكم (Dashboard)

### 3.1 إحصائيات لوحة التحكم
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/dashboard/statistics` | إحصائيات عامة |

**Response:**
```json
{
  "totalUsers": 5000,
  "totalOrders": 25000,
  "totalRevenue": 500000,
  "activeRestaurants": 450,
  "activeDrivers": 200,
  "pendingOrders": 25
}
```

### 3.2 الطلبات عبر الزمن (آخر 7 أيام)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/dashboard/orders-over-time` | طلبات لكل يوم |

**Response:**
```json
[
  { "date": "السبت", "value": 150 },
  { "date": "الأحد", "value": 180 }
]
```

### 3.3 الإيرادات عبر الزمن
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/dashboard/revenue-over-time` | إيرادات لكل يوم |

**Response:** نفس شكل `orders-over-time`

### 3.4 الطلبات حسب الحالة
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/dashboard/orders-by-status` | عدد الطلبات لكل حالة |

**Response:**
```json
[
  { "status": "مكتملة", "count": 18500 },
  { "status": "قيد التحضير", "count": 3200 }
]
```

### 3.5 أفضل المطاعم
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/dashboard/top-restaurants` | أفضل 5-10 مطاعم |

**Response:**
```json
[
  { "name": "مطعم الشام", "orders": 1250, "revenue": 125000 }
]
```

---

## 4. المستخدمون (Users)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/users` | قائمة المستخدمين |
| GET | `/admin/users/:id` | تفاصيل مستخدم |
| POST | `/admin/users` | إنشاء مستخدم |
| PUT | `/admin/users/:id/status` | تفعيل/تعطيل |
| DELETE | `/admin/users/:id` | حذف مستخدم |

### GET /admin/users
**Query params:** `userType` (customer|driver|restaurant|all), `status` (active|suspended|all), `search`, `page`, `limit`

**Response:**
```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "userType": "customer | driver | restaurant",
      "status": "active | suspended",
      "totalOrders": 10,
      "totalSpent": 500,
      "createdAt": "ISO8601"
    }
  ],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

### PUT /admin/users/:id/status
**Body:** `{ "status": "active" | "suspended" }`

### POST /admin/users
**Body:** `{ "name", "email", "phone", "userType", "status?" }`

---

## 5. المتاجر (Restaurants / Pharmacies / Supermarkets)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/restaurants` | قائمة المتاجر |
| GET | `/admin/restaurants/:id` | تفاصيل متجر |
| POST | `/admin/restaurants` | إنشاء متجر |
| PUT | `/admin/restaurants/:id` | تحديث متجر |
| PUT | `/admin/restaurants/:id/status` | تغيير الحالة |
| PUT | `/admin/restaurants/:id/featured` | تبديل التمييز (مميز/عادي) |

### GET /admin/restaurants
**Query params:** `status` (approved|pending|suspended|all), `vendorType` (restaurant|pharmacy|supermarket|all), `search`, `page`, `limit`

**Response:**
```json
{
  "restaurants": [
    {
      "id": "string",
      "name": "string",
      "ownerEmail": "string",
      "ownerName": "string",
      "phone": "string",
      "cuisineType": "string",
      "status": "approved | pending | suspended",
      "vendorType": "restaurant | pharmacy | supermarket",
      "isFeatured": true,
      "totalOrders": 100,
      "totalRevenue": 15000,
      "rating": 4.5,
      "createdAt": "ISO8601",
      "address": "string",
      "description": "string"
    }
  ],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

### PUT /admin/restaurants/:id/status
**Body:** `{ "status": "approved" | "pending" | "suspended" }`

### PUT /admin/restaurants/:id/featured
**Body:** `{ "isFeatured": true | false }`

---

## 6. الطلبات (Orders)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/orders` | قائمة الطلبات |
| GET | `/admin/orders/:id` | تفاصيل طلب |
| PUT | `/admin/orders/:id/status` | تحديث حالة الطلب |
| POST | `/admin/orders/:id/assign-driver` | تعيين سائق |

### GET /admin/orders
**Query params:** `status`, `paymentStatus`, `restaurantId`, `search`, `page`, `limit`

**Response:**
```json
{
  "orders": [
    {
      "id": "string",
      "orderNumber": "string",
      "customerId": "string",
      "customerName": "string",
      "customerPhone": "string",
      "restaurantId": "string",
      "restaurantName": "string",
      "driverId": "string | null",
      "driverName": "string | null",
      "status": "pending|accepted|confirmed|preparing|ready|heading_to_restaurant|at_restaurant|picked_up|out_for_delivery|delivering|delivered|cancelled",
      "items": [
        {
          "id": "string",
          "menuItemId": "string",
          "name": "string",
          "quantity": 1,
          "price": 50,
          "total": 50,
          "notes": "string | null"
        }
      ],
      "subtotal": 100,
      "deliveryFee": 15,
      "tax": 15,
      "total": 130,
      "paymentMethod": "cash | card | online",
      "paymentStatus": "pending | paid | failed | refunded",
      "deliveryAddress": "string",
      "notes": "string | null",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "estimatedDeliveryTime": "string | null"
    }
  ],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

### PUT /admin/orders/:id/status
**Body:** `{ "status": "accepted" }`

### POST /admin/orders/:id/assign-driver
**Body:** `{ "driverId": "string" }`

---

## 7. التصنيفات (Categories)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/categories` | قائمة التصنيفات |
| POST | `/admin/categories` | إنشاء تصنيف |
| PUT | `/admin/categories/:id` | تحديث تصنيف |
| DELETE | `/admin/categories/:id` | حذف تصنيف |
| PUT | `/admin/categories/:id/toggle` | تفعيل/إيقاف |

### GET /admin/categories
**Query params:** `status` (all|active|inactive), `search`, `page`, `limit`

**Response:**
```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "description": "string | null",
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

### POST /admin/categories
**Body:** `{ "name", "slug", "description?", "isActive?", "sortOrder?" }`

---

## 8. الكوبونات (Coupons)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/coupons` | قائمة الكوبونات |
| POST | `/admin/coupons` | إنشاء كوبون |
| PUT | `/admin/coupons/:id` | تحديث كوبون |
| DELETE | `/admin/coupons/:id` | حذف كوبون |
| PUT | `/admin/coupons/:id/toggle` | تفعيل/إيقاف |

### Coupon Object
```json
{
  "id": "string",
  "code": "string",
  "description": "string | null",
  "type": "percentage | fixed",
  "value": 20,
  "maxDiscount": 50,
  "minOrderAmount": 100,
  "usageLimit": 100,
  "usedCount": 10,
  "startDate": "ISO8601",
  "endDate": "ISO8601 | null",
  "status": "active | scheduled | expired | disabled",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

## 9. البانرات (Banners)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/banners` | قائمة البانرات |
| POST | `/admin/banners` | إنشاء بانر |
| PUT | `/admin/banners/:id` | تحديث بانر |
| DELETE | `/admin/banners/:id` | حذف بانر |

### Banner Object
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "banner_type": "restaurant_promo | platform_offer | campaign | custom",
  "image_url": "string",
  "action_url": "string | null",
  "restaurant_id": "string | null",
  "priority": 10,
  "user_segment": "new_user | loyal_user | all",
  "is_active": true,
  "start_date": "ISO8601",
  "end_date": "ISO8601",
  "created_at": "ISO8601"
}
```

**Query params للقائمة:** `is_active`, `banner_type`

---

## 10. الحملات (Campaigns)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/campaigns` | قائمة الحملات |
| POST | `/admin/campaigns` | إنشاء حملة |
| PUT | `/admin/campaigns/:id` | تحديث حملة |
| POST | `/admin/campaigns/:id/send-notification` | إرسال إشعار الحملة |

### Campaign Object
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "active | inactive | expired",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "user_segment": "new_user | loyal_user | all",
  "restaurant_id": "string | null",
  "banner_id": "string | null",
  "coupon_id": "string | null",
  "loyalty_bonus_points": 50,
  "loyalty_multiplier": 1.5,
  "notification_title": "string | null",
  "notification_body": "string | null",
  "notification_sent": false,
  "created_at": "ISO8601"
}
```

---

## 11. السائقون (Riders)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/riders` | قائمة السائقين |
| GET | `/admin/riders/:id` | تفاصيل سائق |
| PUT | `/admin/riders/:id/status` | تغيير الحالة |
| POST | `/admin/riders/:id/approve` | الموافقة على السائق |
| DELETE | `/admin/riders/:id` | رفض/حذف سائق |
| GET | `/admin/riders/:id/earnings` | أرباح السائق |
| GET | `/admin/riders/:id/reviews` | تقييمات السائق |

### Rider Object
```json
{
  "id": "string",
  "user_id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "status": "active | inactive | pending",
  "is_approved": true,
  "total_orders": 250,
  "total_earnings": 5000,
  "rating": 4.8,
  "created_at": "ISO8601"
}
```

### Rider Earnings Response
```json
{
  "today_earnings": 100,
  "week_earnings": 500,
  "month_earnings": 2000,
  "total_earnings": 5000,
  "today_deliveries": 5,
  "week_deliveries": 25,
  "month_deliveries": 100,
  "total_deliveries": 250,
  "average_earning_per_delivery": 20
}
```

### Rider Review Object
```json
{
  "id": "string",
  "user_id": "string",
  "user_name": "string",
  "driver_id": "string",
  "order_id": "string | null",
  "rating": 5,
  "comment": "string | null",
  "created_at": "ISO8601"
}
```

---

## 12. طلبات التوصيل P2P (Delivery Requests)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/delivery-requests` | قائمة الطلبات |
| GET | `/admin/delivery-requests/:id` | تفاصيل طلب |
| PUT | `/admin/delivery-requests/:id/status` | تحديث الحالة |
| PUT | `/admin/delivery-requests/:id/cancel` | إلغاء |

### DeliveryRequest Object
```json
{
  "id": "string",
  "user_id": "string",
  "pickup_address": {
    "label": "string",
    "address_line": "string",
    "city": "string",
    "latitude": 30.0,
    "longitude": 31.0
  },
  "delivery_address": { "same structure" },
  "receiver_name": "string",
  "receiver_phone": "string",
  "item_description": "string",
  "payment_method": "cash | card | wallet",
  "status": "pending | accepted | picked_up | delivering | delivered | cancelled",
  "fee": 35,
  "notes": "string | null",
  "created_at": "ISO8601"
}
```

**Query params:** `status`

---

## 13. الإعدادات (Settings)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/settings` | جلب كل الإعدادات |
| PUT | `/admin/settings/:section` | تحديث قسم معين |

### Sections
- `general`: appName, defaultLanguage, timezone, currency, taxRate, deliveryFee, minOrderAmount
- `payment`: paymentMethods, commissionRate, payoutSchedule, autoPayout
- `notifications`: emailEnabled, smsEnabled, pushEnabled, orderNotifications, marketingNotifications
- `delivery`: maxDeliveryDistance, estimatedDeliveryTime, driverAssignment, deliveryBaseFee, deliveryFreeKm, deliveryPricePerKm
- `restaurant`: autoApprove, commissionRate, minRating
- `support`: supportEmail, supportPhone1, supportPhone2, supportAddress, privacyPolicyUrl, termsOfServiceUrl

### Response Structure
```json
{
  "general": { ... },
  "payment": { ... },
  "notifications": { ... },
  "delivery": {
    "maxDeliveryDistance": 10,
    "estimatedDeliveryTime": 45,
    "driverAssignment": "auto",
    "deliveryBaseFee": 20,
    "deliveryFreeKm": 2,
    "deliveryPricePerKm": 10
  },
  "restaurant": { ... },
  "support": {
    "supportEmail": "string",
    "supportPhone1": "string",
    "supportPhone2": "string",
    "supportAddress": "string",
    "privacyPolicyUrl": "string",
    "termsOfServiceUrl": "string"
  }
}
```

---

## 14. التقارير (Reports)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/reports/sales` | تقرير المبيعات |
| GET | `/admin/reports/restaurants` | تقرير المطاعم |
| GET | `/admin/reports/drivers` | تقرير السائقين |
| GET | `/admin/reports/revenue-by-day` | الإيرادات يومياً |
| GET | `/admin/reports/revenue-by-restaurant` | الإيرادات حسب المطعم |

**Query params:** `startDate`, `endDate`, `restaurantId`, `status`

### Sales Report
```json
{
  "totalOrders": 5000,
  "totalRevenue": 500000,
  "averageOrderValue": 100,
  "totalDeliveryFees": 75000,
  "totalTax": 75000,
  "netRevenue": 350000,
  "ordersByStatus": [
    { "status": "مكتملة", "count": 3750, "revenue": 375000 }
  ]
}
```

### Restaurant Report
```json
[
  {
    "restaurantId": "string",
    "restaurantName": "string",
    "totalOrders": 100,
    "totalRevenue": 15000,
    "averageOrderValue": 150,
    "completionRate": 0.9
  }
]
```

### Driver Report
```json
[
  {
    "driverId": "string",
    "driverName": "string",
    "totalDeliveries": 100,
    "completedDeliveries": 95,
    "averageDeliveryTime": 35,
    "totalEarnings": 1500,
    "rating": 4.5
  }
]
```

---

## 15. الإشعارات (Notifications)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/admin/notifications/send` | إرسال إشعار |
| GET | `/admin/notifications` | قائمة الإشعارات |
| GET | `/admin/notifications/:id` | تفاصيل إشعار |
| POST | `/admin/notifications/:id/resend` | إعادة إرسال |
| DELETE | `/admin/notifications/:id` | حذف |
| GET | `/admin/notifications/templates` | قوالب الإشعارات |
| POST | `/admin/notifications/templates` | إنشاء قالب |
| PUT | `/admin/notifications/templates/:id` | تحديث قالب |
| DELETE | `/admin/notifications/templates/:id` | حذف قالب |
| GET | `/admin/notifications/statistics` | إحصائيات |

### Send Notification Request
```json
{
  "title": "string",
  "message": "string",
  "notificationType": "info | warning | success | error | promotion",
  "priority": "low | medium | high",
  "targetAudience": "all | customers | drivers | restaurants | specific",
  "userIds": ["id1", "id2"],
  "scheduledAt": "ISO8601",
  "sendNow": true
}
```

---

## 16. المكافآت (Rewards)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/rewards` | قائمة المكافآت |
| GET | `/admin/rewards/:id` | تفاصيل مكافأة |
| POST | `/admin/rewards` | إنشاء مكافأة |
| PUT | `/admin/rewards/:id` | تحديث مكافأة |
| DELETE | `/admin/rewards/:id` | حذف مكافأة |
| POST | `/admin/rewards/assign` | تعيين مكافأة لمستخدمين |
| POST | `/admin/rewards/assign-by-criteria` | تعيين حسب معايير |
| GET | `/admin/rewards/history` | سجل التعيينات |
| PUT | `/admin/rewards/history/:id/revoke` | إلغاء تعيين |
| PUT | `/admin/rewards/history/:id/extend` | تمديد صلاحية |
| GET | `/admin/rewards/statistics` | إحصائيات |

### Reward Types
`discount_coupon` | `free_delivery` | `cash_credit` | `free_item` | `points` | `custom`

### Assign Request
```json
{
  "rewardId": "string",
  "userIds": ["id1", "id2"],
  "sendNotification": true,
  "notes": "string"
}
```

### Assign By Criteria
```json
{
  "rewardId": "string",
  "criteria": {
    "type": "top_customers | order_count | total_spent | new_users | all_users | all_customers | all_drivers | all_restaurants",
    "value": 100,
    "minOrders": 10,
    "minSpent": 500
  },
  "sendNotification": true
}
```

---

## 17. تقييمات السائقين (Driver Ratings)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/admin/driver-ratings` | قائمة التقييمات |
| GET | `/admin/driver-ratings/:id` | تفاصيل تقييم |
| GET | `/admin/driver-ratings/statistics` | إحصائيات |
| GET | `/admin/driver-ratings/driver/:driverId/average` | متوسط تقييم سائق |
| PUT | `/admin/driver-ratings/:id/hide` | إخفاء/إظهار تقييم |
| DELETE | `/admin/driver-ratings/:id` | حذف (soft delete) |

**Query params للقائمة:** `driverId`, `customerId`, `orderId`, `minRating`, `maxRating`, `dateFrom`, `dateTo`, `isHidden`, `page`, `limit`, `sortBy`, `sortOrder`

---

## 18. رفع الملفات (Uploads)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/uploads/presigned-url` | الحصول على رابط رفع (R2/S3) |

---

## 19. ملخص الـ Endpoints المطلوب إضافتها

جميع الـ endpoints التالية تحت بادئة `/admin/` وتتطلب مصادقة Bearer:

| المجال | Endpoints |
|--------|-----------|
| Auth | `POST /admin/auth/login` |
| Dashboard | `GET /admin/dashboard/statistics`, `orders-over-time`, `revenue-over-time`, `orders-by-status`, `top-restaurants` |
| Users | `GET/POST /admin/users`, `GET/PUT/DELETE /admin/users/:id` |
| Restaurants | `GET/POST /admin/restaurants`, `GET/PUT /admin/restaurants/:id`, `PUT .../status`, `PUT .../featured` |
| Orders | `GET /admin/orders`, `GET /admin/orders/:id`, `PUT .../status`, `POST .../assign-driver` |
| Categories | `GET/POST /admin/categories`, `PUT/DELETE /admin/categories/:id`, `PUT .../toggle` |
| Coupons | `GET/POST /admin/coupons`, `PUT/DELETE /admin/coupons/:id`, `PUT .../toggle` |
| Banners | `GET/POST /admin/banners`, `PUT/DELETE /admin/banners/:id` |
| Campaigns | `GET/POST /admin/campaigns`, `PUT /admin/campaigns/:id`, `POST .../send-notification` |
| Riders | `GET /admin/riders`, `GET /admin/riders/:id`, `PUT .../status`, `POST .../approve`, `DELETE`, `GET .../earnings`, `GET .../reviews` |
| Delivery Requests | `GET /admin/delivery-requests`, `GET /admin/delivery-requests/:id`, `PUT .../status`, `PUT .../cancel` |
| Settings | `GET /admin/settings`, `PUT /admin/settings/:section` |
| Reports | `GET /admin/reports/sales`, `restaurants`, `drivers`, `revenue-by-day`, `revenue-by-restaurant` |
| Notifications | `POST /admin/notifications/send`, `GET /admin/notifications`, `GET/POST/PUT/DELETE templates`, `GET statistics` |
| Rewards | `GET/POST/PUT/DELETE /admin/rewards`, `POST assign`, `POST assign-by-criteria`, `GET history`, `GET statistics` |
| Driver Ratings | `GET /admin/driver-ratings`, `GET /admin/driver-ratings/:id`, `GET statistics`, `PUT hide`, `DELETE` |

---

## 20. تشغيل الفرونت إند ببيانات حقيقية

لتفعيل الاتصال بالباك إند بدلاً من الـ Mock:

1. تأكد من وجود الـ endpoints أعلاه في الباك إند.
2. في ملف `.env` اضف أو عدّل:
   ```
   REACT_APP_USE_MOCK_API=false
   REACT_APP_API_BASE_URL=https://your-api.com/servy/api/v1
   ```
3. سيحتاج تعديل ملفات الـ services في `web/src/services/api/` لاستخدام `apiClient` بدلاً من دوال الـ mock عند `REACT_APP_USE_MOCK_API=false`.

---

*آخر تحديث: مارس 2026*
