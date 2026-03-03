# متطلبات تطبيق الأدمن – Admin Application Requirements

> هذا الملف يوثق كل ما يحتاجه تطبيق الأدمن لإدارة المنصة بناءً على تحليل تطبيق SouqCustomer والـ API المشترك.

---

## الفهرس

1. [الإعدادات العامة](#1-الإعدادات-العامة)
2. [إدارة المستخدمين](#2-إدارة-المستخدمين)
3. [إدارة المطاعم والبائعين](#3-إدارة-المطاعم-والبائعين)
4. [إدارة الطلبات](#4-إدارة-الطلبات)
5. [القائمة والأصناف](#5-القائمة-والأصناف)
6. [البانرات والحملات](#6-البانرات-والحملات)
7. [الكوبونات](#7-الكوبونات)
8. [نظام الولاء](#8-نظام-الولاء)
9. [التقييمات والمراجعات](#9-التقييمات-والمراجعات)
10. [الرiders والسائقين](#10-الriders-والسائقين)
11. [الإشعارات](#11-الإشعارات)
12. [الإحصائيات والتقارير](#12-الإحصائيات-والتقارير)
13. [طلبات التوصيل P2P وطلبات التوصيل المباشرة](#13-طلبات-التوصيل)
14. [رفع الصور](#14-رفع-الصور)
15. [WebSocket للتحديثات الحية](#15-websocket)

---

## 1. الإعدادات العامة

### Base URL و API

| الإعداد | القيمة | ملاحظات |
|---------|--------|---------|
| Base URL | `https://talabat-ehpd.onrender.com` | أو أي سيرفر production |
| API Path | `/servy` | بادئة المسارات |
| API Version | `v1` | المسار الكامل: `{baseUrl}/servy/api/v1` |
| Timeouts | 60 ثانية | للتوصيل من Render أو سيرفرات بطيئة |

### أنواع المستخدمين (User Types)

| النوع | القيمة | الاستخدام |
|-------|--------|----------|
| عميل | `customer` | تطبيق العملاء |
| مطعم/بائع | `restaurant` أو `vendor` | لوحة المطعم |
| صيدلية | `pharmacy` | نفس لوحة المطعم مع نوع مختلف |
| سوبرماركت | `supermarket` | نفس لوحة المطعم |
| سائق | `driver` أو rider | تطبيق التوصيل |

### أنواع الدفع (Payment Methods)

| القيمة | المعنى |
|--------|--------|
| `cash` | كاش عند الاستلام |
| `card` | بطاقة ائتمان |
| `wallet` | المحفظة |

### إعدادات التوصيل (للأدمن – ضبط الرسوم)

| الإعداد | القيمة الافتراضية | الوصف |
|---------|-------------------|-------|
| deliveryBaseFee | 20 EGP | الرسوم الأساسية |
| deliveryFreeKm | 2 km | كم متر مجاني |
| deliveryPricePerKm | 10 EGP | السعر لكل كم إضافي |

---

## 2. إدارة المستخدمين

### Endpoints المستخدمة من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/user/signin` | POST | تسجيل دخول |
| `/user/signup` | POST | تسجيل مستخدم جديد |
| `/user/profile` | GET | جلب البروفايل |
| `/user/profile` | PUT | تحديث البروفايل |
| `/user/profile` | DELETE | حذف الحساب |
| `/user/logout` | POST | تسجيل الخروج (إبطال التوكن) |
| `/user/forgot-password` | POST | نسيت كلمة المرور |
| `/user/verify-reset-code` | POST | التحقق من كود إعادة التعيين |
| `/user/reset-password` | POST | تعيين كلمة مرور جديدة |
| `/user/update-password` | PUT | تغيير كلمة المرور (مستخدم مسجل دخوله) |

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة المستخدمين | عرض كل المستخدمين مع فلترة (نوع، حالة) | `GET /admin/users?page=&page_size=&user_type=&search=` |
| تفاصيل مستخدم | عرض بيانات كاملة | `GET /admin/users/:id` |
| تفعيل/تعطيل مستخدم | تفعيل أو تعطيل الحساب | `PUT /admin/users/:id/status` |
| إنشاء مستخدم | إنشاء حساب من الأدمن | `POST /admin/users` |
| حذف مستخدم | حذف نهائي | `DELETE /admin/users/:id` |
| إعادة تعيين كلمة المرور | للأدمن بدون معرفة الكلمة الحالية | `POST /admin/users/:id/reset-password` |

### نموذج المستخدم (User Model)

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "أحمد",
  "last_name": "محمد",
  "phone": "+201091717188",
  "user_type": "customer",
  "image_url": "https://...",
  "is_email_verified": true,
  "restaurant_id": "uuid أو null",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## 3. إدارة المطاعم والبائعين

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/restaurants` | GET | قائمة المطاعم (للعملاء) |
| `/restaurants/:id` | GET | تفاصيل مطعم |
| `/restaurants/:id/menu` | GET | قائمة المطعم |
| `/restaurants/featured` | GET | المطاعم المميزة |
| `/restaurants/nearby` | GET | المطاعم القريبة |
| `/restaurants/search` | GET | البحث |
| `/user/restaurants` | GET | مطاعم المستخدم (للمالك) |
| `/restaurants/:id/status` | PUT | تحديث الحالة |
| `/restaurants/:id/online-status` | PUT | تحديث حالة الاتصال |
| `/restaurants/:id/statistics` | GET | إحصائيات المطعم |
| `/restaurants/:id/reviews` | GET | مراجعات المطعم |

### نموذج المطعم (Restaurant Model)

```json
{
  "id": "uuid",
  "restaurant_name": "اسم المطعم",
  "name": "اسم المطعم",
  "description": "الوصف",
  "image_url": "https://...",
  "rating": 4.5,
  "review_count": 120,
  "cuisine_type": "مصري",
  "cuisine_type_id": "uuid",
  "delivery_time": 30,
  "delivery_fee": 20,
  "min_order_amount": 50,
  "status": "open",
  "is_open": true,
  "is_online": true,
  "address": "العنوان",
  "latitude": 30.0,
  "longitude": 31.0,
  "vendor_type": "restaurant",
  "is_featured": false
}
```

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة المطاعم | عرض كل المطاعم مع فلترة | `GET /admin/restaurants?status=&vendor_type=&search=` |
| الموافقة على مطعم | قبول/رفض طلبات الانضمام | `PUT /admin/restaurants/:id/approve` |
| تفعيل/تعطيل مطعم | فتح/إغلاق المطعم | `PUT /admin/restaurants/:id/status` |
| إنشاء مطعم | إضافة مطعم جديد | `POST /admin/restaurants` |
| تعديل مطعم | تعديل بيانات المطعم | `PUT /admin/restaurants/:id` |
| حذف مطعم | حذف (أو تعطيل) | `DELETE /admin/restaurants/:id` |

### أنواع البائعين (Vendor Type)

- `restaurant`
- `pharmacy`
- `supermarket`

---

## 4. إدارة الطلبات

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/orders` | GET | قائمة الطلبات |
| `/orders/:id` | GET | تفاصيل طلب |
| `/user/orders/:id` | GET | طلب المستخدم |
| `/user/orders/:id/tracking` | GET | تتبع الطلب |
| `/order/checkout` | POST | إنشاء طلب (مطعم) |
| `/order/p2p/checkout` | POST | إنشاء طلب P2P |
| `/order/p2p/estimate` | POST | تقدير رسوم P2P |
| `/order/cancel/:id` | POST | إلغاء الطلب |
| `/orders/:id/status` | PUT | تحديث حالة الطلب |
| `/restaurant/orders` | GET | طلبات المطعم |

### حالات الطلب (Order Status)

| القيمة | المعنى |
|--------|--------|
| `pending` | قيد الانتظار |
| `accepted` | مقبول |
| `preparing` | قيد التحضير |
| `ready` | جاهز للاستلام |
| `heading_to_restaurant` | السائق متجه للمطعم |
| `at_restaurant` | السائق في المطعم |
| `delivering` | قيد التوصيل |
| `delivered` | تم التسليم |
| `cancelled` | ملغي |

### نموذج الطلب (Order Request – Checkout)

```json
{
  "restaurant_id": "uuid",
  "items": [
    {
      "menu_item_id": "uuid",
      "quantity": 2,
      "notes": "بدون بصل"
    }
  ],
  "delivery_address": {
    "label": "المنزل",
    "address_line": "العنوان",
    "city": "القاهرة",
    "latitude": 30.0,
    "longitude": 31.0
  },
  "payment_method": "cash",
  "notes": "ملاحظات إضافية",
  "coupon_code": "PROMO10",
  "points_to_redeem": 100,
  "delivery_fee": 20
}
```

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة الطلبات | كل الطلبات مع فلترة | `GET /admin/orders?status=&restaurant_id=&from=&to=` |
| تفاصيل طلب | عرض الطلب كاملاً | `GET /admin/orders/:id` |
| تعديل حالة طلب | تحديث الحالة يدوياً | `PUT /admin/orders/:id/status` |
| إلغاء طلب | إلغاء من الأدمن | `POST /admin/orders/:id/cancel` |
| إحصائيات الطلبات | إجمالي الطلبات والإيرادات | `GET /admin/orders/statistics` |

---

## 5. القائمة والأصناف

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/restaurant/categories` | GET | تصنيفات القائمة (للمطعم) |
| `/restaurant/categories/:id` | GET | تصنيف واحد |
| `/restaurant/menu/items` | GET | أصناف المطعم |
| `/restaurants/menu/items/:id` | GET | صنف واحد (للعميل) |
| `/restaurants/:id/menu` | GET | قائمة المطعم بالكامل |
| `/categories` | GET | التصنيفات العامة |

### نموذج صنف القائمة (MenuItem)

```json
{
  "id": "uuid",
  "name": "شاورما",
  "description": "وصف",
  "price": 75,
  "price_before_discount": 90,
  "price_after_discount": 75,
  "image_url": "https://...",
  "is_available": true,
  "category": "وجبات سريعة",
  "category_id": "uuid",
  "is_popular": true,
  "extras": [],
  "sizes": []
}
```

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| التصنيفات العامة | قائمة التصنيفات | `GET /admin/categories` |
| إنشاء/تعديل تصنيف | إدارة تصنيفات النظام | `POST/PUT /admin/categories` |
| إدارة أصناف المطعم | عرض/تعديل/حذف أصناف | `GET/PUT/DELETE /admin/restaurants/:id/menu/items` |

---

## 6. البانرات والحملات

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/banners` | GET | البانرات |
| `/banners/click` | POST | تتبع الضغط على البانر |
| `/campaigns/active` | GET | الحملات النشطة |

### نموذج البانر (Banner)

```json
{
  "id": "uuid",
  "title": "خصم 50%",
  "description": "على أول طلب",
  "banner_type": "platform_offer",
  "image_url": "https://...",
  "action_url": "souq://promo/first-order",
  "restaurant_id": "uuid أو null",
  "priority": 10,
  "user_segment": "new_user",
  "is_active": true,
  "start_date": "2026-02-01T00:00:00Z",
  "end_date": "2026-03-01T00:00:00Z",
  "created_at": "2026-02-01T10:00:00Z"
}
```

### أنواع البانر (banner_type)

- `restaurant_promo` – عرض مطعم
- `platform_offer` – عرض المنصة
- `campaign` – حملة
- `custom` – مخصص

### شريحة المستخدم (user_segment)

- `new_user` – مستخدم جديد
- `loyal_user` – عميل مخلص
- `all` – الكل

### نموذج الحملة (Campaign)

```json
{
  "id": "uuid",
  "name": "اسم الحملة",
  "description": "وصف",
  "status": "active",
  "start_date": "2026-02-01",
  "end_date": "2026-03-01",
  "user_segment": "all",
  "restaurant_id": null,
  "banner_id": "uuid",
  "coupon_id": "uuid",
  "loyalty_bonus_points": 50,
  "loyalty_multiplier": 1.5,
  "notification_title": "عنوان",
  "notification_body": "محتوى",
  "notification_sent": false
}
```

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة البانرات | عرض كل البانرات | `GET /admin/banners` |
| إنشاء/تعديل بانر | إدارة البانرات | `POST/PUT /admin/banners` |
| حذف بانر | إزالة بانر | `DELETE /admin/banners/:id` |
| قائمة الحملات | عرض الحملات | `GET /admin/campaigns` |
| إنشاء/تعديل حملة | إدارة الحملات | `POST/PUT /admin/campaigns` |
| إرسال إشعار حملة | إرسال إشعار للحملة | `POST /admin/campaigns/:id/send-notification` |

---

## 7. الكوبونات

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/coupons/validate` | POST | التحقق من الكوبون |

### Body للتحقق من الكوبون

```json
{
  "code": "PROMO10",
  "order_amount": 150,
  "restaurant_id": "uuid",
  "delivery_fee": 20
}
```

### نموذج الكوبون (من Campaign)

```json
{
  "id": "uuid",
  "code": "PROMO10",
  "description": "وصف",
  "discount_type": "percentage",
  "discount_value": 10,
  "min_order_amount": 50,
  "max_discount": 30,
  "usage_limit": 100,
  "usage_count": 25,
  "per_user_limit": 1,
  "valid_from": "2026-02-01",
  "valid_until": "2026-03-01",
  "is_active": true,
  "restaurant_id": "uuid أو null"
}
```

### أنواع الخصم (discount_type)

- `percentage` – نسبة مئوية
- `fixed_amount` – مبلغ ثابت
- `free_delivery` – توصيل مجاني

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة الكوبونات | عرض الكوبونات | `GET /admin/coupons` |
| إنشاء كوبون | إضافة كوبون | `POST /admin/coupons` |
| تعديل كوبون | تعديل بيانات الكوبون | `PUT /admin/coupons/:id` |
| تفعيل/تعطيل | تفعيل أو تعطيل | `PUT /admin/coupons/:id/status` |
| إحصائيات الاستخدام | عدد مرات الاستخدام | ضمن `GET /admin/coupons/:id` |

---

## 8. نظام الولاء

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/user/loyalty` | GET | رصيد نقاط العميل |
| `/user/loyalty/history` | GET | سجل المعاملات |
| `/loyalty/redeem/preview` | POST | معاينة الخصم قبل الاستبدال |

### نموذج حساب الولاء (LoyaltyAccount)

```json
{
  "current_balance": 500,
  "lifetime_earned": 1200,
  "redeemable_value": 25
}
```

### نموذج معاملة الولاء (LoyaltyTransaction)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "order_id": "uuid",
  "tx_type": "earned",
  "points": 50,
  "balance_after": 500,
  "description": "طلب #123",
  "created_at": "2026-02-01T10:00:00Z",
  "expires_at": "2026-08-01T10:00:00Z"
}
```

### أنواع المعاملات (tx_type)

- `earned` – اكتساب
- `redeemed` – استبدال
- `expired` – انتهاء
- `adjustment` – تعديل يدوي

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| معاينة رصيد عميل | عرض النقاط | `GET /admin/users/:id/loyalty` |
| تعديل النقاط | إضافة/خصم نقاط | `POST /admin/loyalty/adjust` |
| قواعد الولاء | ضبط نقاط للطلب، قيمة النقطة | `GET/PUT /admin/loyalty/rules` |
| تقرير الولاء | إحصائيات الاستخدام | `GET /admin/loyalty/report` |

---

## 9. التقييمات والمراجعات

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/reviews/restaurant` | POST | مراجعة مطعم |
| `/reviews/rider` | POST | مراجعة سائق |
| `/restaurants/:id/reviews` | GET | مراجعات المطعم |
| `/riders/:id/reviews` | GET | مراجعات السائق |
| `/orders/:id/can-review` | GET | هل يمكن التقييم؟ |

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة المراجعات | كل المراجعات | `GET /admin/reviews?type=&target_id=` |
| حذف مراجعة | إزالة مراجعة مسيئة | `DELETE /admin/reviews/:id` |
| إخفاء مراجعة | إخفاء دون حذف | `PUT /admin/reviews/:id/hide` |
| إحصائيات التقييم | متوسط التقييمات | ضمن `GET /admin/restaurants/:id` |

---

## 10. الـ Riders والسائقين

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/riders` | POST | إنشاء rider للمستخدم |
| `/riders/me` | GET | بروفايل الـ rider |
| `/riders/me/orders` | GET | طلبات الـ rider |
| `/riders/me/available-orders` | GET | الطلبات المتاحة |
| `/riders/me/orders/:id` | GET | طلب واحد |
| `/riders/me/orders/:id/status` | PUT | تحديث حالة الطلب |
| `/riders/me/respond-proposal` | POST | الرد على اقتراح طلب |
| `/riders/me/earnings` | GET | الأرباح |
| `/riders/me/status` | PUT | تحديث الحالة (online/offline) |
| `/rider/location` | POST | تحديث الموقع |

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة السائقين | عرض كل الـ riders | `GET /admin/riders` |
| تفاصيل سائق | عرض بروفايل وأرباح | `GET /admin/riders/:id` |
| تفعيل/تعطيل سائق | تفعيل أو تعطيل | `PUT /admin/riders/:id/status` |
| الموافقة على سائق | قبول/رفض طلبات الانضمام | `PUT /admin/riders/:id/approve` |
| توزيع الطلبات | عرض طلبات متاحة/مُسندة | استخدام `/riders/me/available-orders` |

---

## 11. الإشعارات

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/notifications` | GET | قائمة الإشعارات |
| `/notifications/:id` | GET | إشعار واحد |
| `/notifications/read-all` | POST | تعليم الكل كمقروء |
| `/notifications/:id/read` | POST | تعليم كمقروء |
| `/notifications/register-token` | POST | تسجيل FCM token |

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| إرسال إشعار عام | لكل المستخدمين أو شريحة | `POST /admin/notifications/send` |
| إرسال لمستخدم | إشعار لمستخدم محدد | `POST /admin/notifications/send-to-user` |
| جدولة إشعار | إرسال في وقت لاحق | `POST /admin/notifications/schedule` |
| قائمة الإشعارات المرسلة | سجل الإشعارات | `GET /admin/notifications` |

---

## 12. الإحصائيات والتقارير

### نموذج إحصائيات المطعم (RestaurantStatistics)

```json
{
  "today_orders": 25,
  "today_revenue": 3500,
  "pending_orders": 5,
  "active_orders": 3,
  "average_order_value": 140,
  "weekly_orders": 150,
  "weekly_revenue": 21000,
  "monthly_orders": 600,
  "monthly_revenue": 84000
}
```

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| لوحة التحكم الرئيسية | إجماليات اليوم/الأسبوع/الشهر | `GET /admin/dashboard` |
| تقرير الطلبات | طلبات مع فلترة زمنية | `GET /admin/reports/orders` |
| تقرير الإيرادات | إيرادات حسب المطاعم | `GET /admin/reports/revenue` |
| تقرير المستخدمين | إحصائيات التسجيل والنشاط | `GET /admin/reports/users` |
| تقرير السائقين | عدد الطلبات والأرباح | `GET /admin/reports/riders` |

### مقترح استجابة Dashboard

```json
{
  "total_users": 5000,
  "total_restaurants": 120,
  "total_riders": 50,
  "today_orders": 150,
  "today_revenue": 25000,
  "pending_orders": 20,
  "weekly_orders": 900,
  "monthly_orders": 3500
}
```

---

## 13. طلبات التوصيل

### طلبات التوصيل المباشرة (Delivery Requests)

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/delivery-requests` | POST | إنشاء طلب توصيل |
| `/delivery-requests/:id` | GET | تفاصيل طلب |
| `/user/delivery-requests` | GET | طلبات المستخدم |

### Body لإنشاء طلب توصيل P2P

```json
{
  "pickup_address": {
    "label": "Pickup",
    "address_line": "العنوان",
    "city": "القاهرة",
    "latitude": 30.0,
    "longitude": 31.0
  },
  "delivery_address": {
    "label": "Delivery",
    "address_line": "العنوان",
    "city": "القاهرة",
    "latitude": 30.1,
    "longitude": 31.1
  },
  "receiver_name": "أحمد",
  "receiver_phone": "+201012345678",
  "item_description": "مستندات",
  "payment_method": "cash",
  "notes": "ملاحظات"
}
```

### ما يحتاجه الأدمن

| الميزة | الوصف | Endpoints مُقترحة |
|--------|-------|-------------------|
| قائمة طلبات التوصيل | عرض طلبات P2P | `GET /admin/delivery-requests` |
| تفاصيل طلب | عرض بيانات كاملة | `GET /admin/delivery-requests/:id` |
| إلغاء طلب | إلغاء من الأدمن | `PUT /admin/delivery-requests/:id/cancel` |

---

## 14. رفع الصور

### Endpoints من التطبيق

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/uploads/presigned-url` | POST | طلب Presigned URL (Cloudflare R2) |
| `/restaurants/:id/image` | PUT | تحديث صورة المطعم |
| `/restaurants/menu/items/:id/image` | PUT | تحديث صورة صنف |
| `/restaurants/menu/categories/:id/image` | PUT | تحديث صورة تصنيف |

### ما يحتاجه الأدمن

- استخدام نفس آلية Presigned URL للرفع
- أو توفير واجهة رفع مباشر للأدمن مع صلاحيات خاصة

---

## 15. WebSocket

### Endpoints للتحديثات الحية

| المسار | الوظيفة |
|--------|---------|
| `wss://{host}/servy/api/v1/ws/order/{order_id}` | تتبع الطلب |
| `/ws/orders` | الطلبات |
| `/ws/restaurant/orders` | طلبات المطعم |
| `/ws/driver-location` | موقع السائق |

### ما يحتاجه تطبيق الأدمن

- الاستماع لتحديثات الطلبات
- تحديث لوحة التحكم عند تغيّر الحالات

---

## 16. العناوين والعناصر الإضافية

### عناوين المستخدم (Addresses)

| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| `/user/addresses` | GET | قائمة العناوين |
| `/user/addresses` | POST | إضافة عنوان |
| `/user/addresses/:id` | GET/PUT/DELETE | جلب/تعديل/حذف عنوان |

### نموذج العنوان

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "label": "المنزل",
  "address_line": "العنوان",
  "address_line1": "العنوان",
  "city": "القاهرة",
  "latitude": 30.0,
  "longitude": 31.0,
  "is_default": true
}
```

---

## 17. مصادقة الأدمن

### مقترح

- endpoint منفصل للوجن: `POST /admin/signin`
- صلاحية خاصة: `user_type: admin` أو role `admin`
- صلاحيات فرعية: `view`, `edit`, `delete`, `manage_users`, `manage_orders`, إلخ

---

## 18. ملخص Endpoints الأدمن المُقترحة

| القسم | Endpoints |
|-------|-----------|
| Users | `GET/POST/PUT/DELETE /admin/users`, `POST /admin/users/:id/reset-password` |
| Restaurants | `GET/POST/PUT/DELETE /admin/restaurants`, `PUT /admin/restaurants/:id/approve` |
| Orders | `GET /admin/orders`, `PUT /admin/orders/:id/status`, `POST /admin/orders/:id/cancel` |
| Banners | `GET/POST/PUT/DELETE /admin/banners` |
| Campaigns | `GET/POST/PUT /admin/campaigns`, `POST /admin/campaigns/:id/send-notification` |
| Coupons | `GET/POST/PUT /admin/coupons` |
| Loyalty | `GET /admin/users/:id/loyalty`, `POST /admin/loyalty/adjust` |
| Reviews | `GET /admin/reviews`, `DELETE /admin/reviews/:id` |
| Riders | `GET/PUT /admin/riders`, `PUT /admin/riders/:id/approve` |
| Notifications | `POST /admin/notifications/send`, `GET /admin/notifications` |
| Dashboard | `GET /admin/dashboard` |
| Reports | `GET /admin/reports/orders`, `GET /admin/reports/revenue` |

---

## 19. روابط الدعم والتواصل (من التطبيق)

| الإعداد | القيمة |
|---------|--------|
| supportEmail | support@souqegy.net |
| supportPhone1 | +201091717188 |
| supportPhone2 | +201000431699 |
| privacyPolicyUrl | https://www.souqegy.net/privacy |
| termsOfServiceUrl | https://www.souqegy.net/terms |

---

هذا الملف يغطي المتطلبات الرئيسية لتطبيق الأدمن. قد تحتاج بعض الـ endpoints للتعديل حسب الباكند الفعلي، لكن الهيكل يمكن استخدامه كمرجع أساسي أثناء التطوير.
