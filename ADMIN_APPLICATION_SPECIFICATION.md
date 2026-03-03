# مواصفات تطبيق الإدارة (Admin Panel) - SouqDelivery / Servy

> هذا الملف يجمع كل ما يحتاجه مطوّر لوحة الإدارة (Admin App) للعمل مع نظام Servy/SouqDelivery.

---

## 1. معلومات الاتصال بالـ API

### Base Configuration
| البند | القيمة |
|-------|--------|
| **Base URL** | `https://talabat-ehpd.onrender.com` |
| **API Path** | `/servy/api/v1` |
| **Full API Base** | `https://talabat-ehpd.onrender.com/servy/api/v1` |
| **WebSocket** | `wss://api.servy.app/ws` |
| **Connect Timeout** | 60 ثانية |
| **Receive Timeout** | 60 ثانية |

### Headers المطلوبة
- `Content-Type: application/json`
- `Authorization: Bearer <access_token>` (للمسارات المحمية)

---

## 2. أنواع المستخدمين (User Types)

| النوع | الوصف | يستخدم في |
|------|-------|-----------|
| `customer` | عميل (يطلب من المطاعم/الفندقية) | تطبيق العميل |
| `driver` / `rider` | سائق التوصيل | SouqDelivery (تطبيق السائق) |
| `restaurant` / `vendor` | مطعم/متجر | تطبيق المطعم |
| `pharmacy` | صيدلية | تطبيق الصيدلية |
| `supermarket` | سوبرماركت | تطبيق السوبرماركت |
| **`admin`** | مدير النظام | **يجب إضافته في الباك إند** |

---

## 3. جميع الـ API Endpoints

### 3.1 المصادقة (Authentication)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/user/signin` | POST | تسجيل دخول | نعم |
| `/user/signup` | POST | تسجيل مستخدم جديد | نعم |
| `/user/refresh` | POST | تحديث الـ token | نعم |
| `/user/logout` | POST | تسجيل خروج | نعم |
| `/user/forgot-password` | POST | طلب إعادة تعيين كلمة المرور | لا |
| `/user/verify-reset-code` | POST | التحقق من كود إعادة التعيين | لا |
| `/user/reset-password` | POST | تعيين كلمة مرور جديدة | لا |
| `/user/update-password` | PUT | تغيير كلمة المرور (مع المصادقة) | نعم |

### 3.2 المستخدمون (Users)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/user/profile` | GET, PUT | عرض/تحديث الملف الشخصي | نعم |
| `/user/addresses` | GET, POST | عناوين المستخدم | لا |
| `/user/addresses/:id` | GET, PUT, DELETE | عنوان واحد | لا |
| `/users/me/avatar` | - | رفع صورة المستخدم | لا |
| `/users/me/favorites` | - | المفضلة | لا |
| `/user/restaurants` | GET | قائمة المطاعم (مع `type`, `owned_only`) | نعم |

> **ملاحظة للأدمن:** الباك إند قد يحتاج endpoints خاصة بالإدارة:
> - `GET /admin/users` - قائمة كل المستخدمين (مع فلترة و pagination)
> - `GET /admin/users/:id` - تفاصيل مستخدم
> - `PUT /admin/users/:id` - تحديث/تعطيل/تفعيل مستخدم
> - `GET /admin/users/stats` - إحصائيات المستخدمين

### 3.3 المطاعم والمتاجر (Restaurants)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/restaurants` | GET, POST | قائمة/إنشاء مطعم | **نعم - عرض الكل، إضافة** |
| `/restaurants/:id` | GET, PUT, DELETE | مطعم واحد | **نعم** |
| `/restaurants/:id/menu` | GET | القائمة | نعم |
| `/restaurants/:id/reviews` | GET | التقييمات | نعم |
| `/restaurants/:id/statistics` | GET | الإحصائيات | نعم |
| `/restaurants/:id/orders` | GET | طلبات المطعم | نعم |
| `/restaurants/:id/status` | PUT | فتح/إغلاق | نعم |
| `/restaurants/:id/online-status` | PUT | حالة أونلاين | نعم |
| `/restaurants/search` | GET | بحث (q, type, filters) | نعم |
| `/restaurants/featured` | - | المطاعم المميزة | نعم |
| `/restaurants/nearby` | - | القريبة | لا |

### 3.4 إدارة المطعم (Vendor - للمطعم نفسه)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/restaurant/categories` | GET, POST | أصناف القائمة |
| `/restaurant/categories/:id` | GET, PUT, DELETE | صنف واحد |
| `/restaurant/menu/items` | GET, POST | عناصر القائمة |
| `/restaurant/menu/items/:id` | GET, PUT, DELETE | عنصر واحد |
| `/restaurant/orders` | GET | طلبات المطعم |
| `/restaurant/orders/:id` | GET | طلب واحد |
| `/restaurant/orders/:id/status` | PUT | تحديث حالة الطلب |
| `/restaurant/statistics` | GET | إحصائيات المطعم |

### 3.5 الطلبات (Orders)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/orders` | GET, POST | قائمة/إنشاء طلب | **نعم - عرض الكل** |
| `/orders/:id` | GET, PUT | طلب واحد | **نعم** |
| `/user/orders/:id` | GET | طلب العميل | نعم |
| `/orders/:id/track` | - | تتبع الطلب | نعم |
| `/orders/:id/cancel` | - | إلغاء الطلب | **نعم** |
| `/orders/:id/status` | PUT | تحديث حالة الطلب | **نعم** |
| `/orders/:id/rate` | - | تقييم | لا |
| `/order/checkout` | POST | إتمام طلب مطعم | لا |
| `/order/p2p/checkout` | POST | إتمام طلب P2P | لا |

### 3.6 طلبات التوصيل P2P (Delivery Requests)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/delivery-requests` | POST | إنشاء طلب توصيل | لا |
| `/delivery-requests/:id` | GET | طلب توصيل واحد | **نعم** |
| `/user/delivery-requests` | GET | طلبات المستخدم | نعم |

> **ملاحظة للأدمن:** قد يحتاج الباك إند:
> - `GET /admin/delivery-requests` - كل طلبات التوصيل
> - `PUT /admin/delivery-requests/:id/status` - تعديل الحالة
> - `GET /admin/delivery-requests/stats` - إحصائيات

### 3.7 السائقون (Riders / Drivers)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/riders` | POST | إنشاء سائق | نعم |
| `/riders/me` | GET | ملف السائق الحالي | لا |
| `/riders/me/orders` | GET | طلبات السائق | لا |
| `/riders/me/available-orders` | GET | الطلبات المتاحة | لا |
| `/riders/me/orders/:id` | GET | طلب واحد | لا |
| `/riders/me/orders/:id/status` | PUT | تحديث حالة الطلب | لا |
| `/riders/me/respond-proposal` | POST | قبول/رفض عرض | لا |
| `/riders/me/earnings` | GET | أرباح السائق | لا |
| `/riders/me/status` | PUT | حالة السائق | لا |
| `/rider/location` | POST | إرسال الموقع | لا |
| `/drivers/orders/active` | - | الطلبات النشطة (legacy) | لا |
| `/drivers/earnings` | GET | أرباح السائق | لا |

> **ملاحظة للأدمن:** الباك إند قد يحتاج:
> - `GET /admin/riders` - قائمة كل السائقين
> - `GET /admin/riders/:id` - تفاصيل سائق
> - `PUT /admin/riders/:id` - تعطيل/تفعيل سائق، تحديث بيانات
> - `GET /admin/riders/:id/earnings` - أرباح سائق معين
> - `GET /admin/riders/:id/reviews` - تقييمات السائق
> - `GET /admin/riders/stats` - إحصائيات السائقين

### 3.8 التصنيفات (Categories)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/categories` | GET | التصنيفات العامة | نعم |

> **ملاحظة للأدمن:** قد يحتاج:
> - `POST /admin/categories` - إضافة تصنيف
> - `PUT /admin/categories/:id` - تعديل
> - `DELETE /admin/categories/:id` - حذف

### 3.9 الكوبونات (Coupons)
| Endpoint | Method | الوصف | يستخدم حالياً؟ |
|----------|--------|-------|----------------|
| `/coupons/validate` | - | التحقق من كوبون | غير مستخدم |
| `/coupons` | - | قائمة الكوبونات | غير مستخدم |

> **ملاحظة للأدمن:** إدارة الكوبونات:
> - `GET /admin/coupons` - قائمة الكوبونات
> - `POST /admin/coupons` - إنشاء
> - `PUT /admin/coupons/:id` - تعديل
> - `DELETE /admin/coupons/:id` - حذف
> - `GET /admin/coupons/:id/usage` - استخدام الكوبون

### 3.10 التقييمات والمراجعات (Reviews)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/reviews/restaurant` | POST | تقييم مطعم | لا |
| `/reviews/rider` | POST | تقييم سائق | لا |
| `/reviews/:id` | - | تقييم واحد | نعم |
| `/restaurants/:id/reviews` | GET | تقييمات المطعم | **نعم** |
| `/orders/:id/can-review` | GET | هل يمكن التقييم | لا |
| `/riders/:id/reviews` | GET | تقييمات السائق | **نعم (Admin only حسب الكود)** |

### 3.11 رفع الملفات (Uploads)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/uploads/presigned-url` | POST | طلب Presigned URL (R2) |
| `/restaurants/:id/image` | PUT | صورة المطعم |
| `/restaurants/menu/items/:id/image` | PUT | صورة عنصر القائمة |
| `/restaurants/menu/categories/:id/image` | PUT | صورة التصنيف |

### 3.12 الإشعارات (Notifications)
| Endpoint | Method | الوصف | يحتاج Admin؟ |
|----------|--------|-------|---------------|
| `/notifications` | - | قائمة الإشعارات | نعم |
| `/notifications/:id` | - | إشعار واحد | نعم |
| `/notifications/read-all` | - | تعليم الكل كمقروء | لا |
| `/notifications/:id/read` | - | تعليم كمقروء | لا |
| `/notifications/register-token` | POST | تسجيل FCM token | لا |

> **ملاحظة للأدمن:** إرسال إشعارات:
> - `POST /admin/notifications/send` - إرسال إشعار لجميع المستخدمين أو مجموعة معينة

### 3.13 WebSocket
| المسار | الوصف |
|--------|-------|
| `/ws/orders` | طلبات فورية |
| `/ws/driver-location` | موقع السائق |
| `/ws/restaurant/orders` | طلبات المطعم |

---

## 4. هيكل البيانات (Data Models)

### 4.1 UserModel
```json
{
  "id": "string",
  "email": "string",
  "name": "string | null",
  "phone": "string | null",
  "userType": "customer | driver | restaurant | pharmacy | supermarket",
  "imageUrl": "string | null",
  "isEmailVerified": "boolean",
  "createdAt": "datetime | null",
  "restaurantId": "string | null"
}
```

### 4.2 OrderModel & OrderStatus
**OrderStatus:** `pending` | `accepted` | `preparing` | `ready` | `picked_up` | `out_for_delivery` | `heading_to_restaurant` | `at_restaurant` | `delivering` | `delivered` | `cancelled`

**OrderModel (أهم الحقول):**
```json
{
  "id": "string",
  "userId": "string",
  "restaurantId": "string | null",
  "restaurantName": "string",
  "status": "string",
  "deliveryAddress": "AddressModel",
  "subtotal": "number",
  "deliveryFee": "number",
  "tax": "number | null",
  "discount": "number | null",
  "total": "number",
  "paymentMethod": "string",
  "createdAt": "datetime",
  "estimatedDeliveryTime": "datetime | null",
  "notes": "string | null",
  "couponCode": "string | null",
  "items": "OrderItemModel[]",
  "driverId": "string | null",
  "driverName": "string | null",
  "driverPhone": "string | null",
  "customerPhone": "string | null",
  "deliveredAt": "datetime | null",
  "vendorType": "restaurant | pharmacy | supermarket | null",
  "orderType": "vendor | p2p",
  "pickupAddress": "string | null",
  "receiverName": "string | null",
  "receiverPhone": "string | null",
  "itemDescription": "string | null"
}
```

### 4.3 RestaurantModel
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "imageUrl": "string",
  "rating": "number",
  "reviewCount": "number",
  "cuisineType": "string",
  "deliveryTime": "number",
  "deliveryFee": "number",
  "minOrderAmount": "number | null",
  "isOpen": "boolean",
  "isOnline": "boolean",
  "distance": "number",
  "address": "string",
  "latitude": "number",
  "longitude": "number",
  "images": "string[]",
  "isFeatured": "boolean",
  "vendorType": "restaurant | pharmacy | supermarket"
}
```

### 4.4 RiderModel
```json
{
  "id": "string",
  "user_id": "string",
  "rider_name": "string",
  "vehicle_type": "string",
  "vehicle_plate": "string",
  "status": "string",
  "current_location": { "latitude": "number", "longitude": "number" },
  "current_order_count": "number",
  "total_deliveries": "number",
  "rating": "number",
  "rating_count": "number",
  "is_active": "boolean",
  "created_at": "datetime"
}
```

### 4.5 DeliveryRequestModel & DeliveryRequestStatus
**DeliveryRequestStatus:** `pending` | `accepted` | `in_progress` | `completed` | `cancelled`

```json
{
  "id": "string",
  "user_id": "string",
  "customer_name": "string",
  "customer_phone": "string",
  "pickup_latitude": "number",
  "pickup_longitude": "number",
  "pickup_address": "string",
  "delivery_latitude": "number",
  "delivery_longitude": "number",
  "delivery_address": "string",
  "distance": "number",
  "price_per_km": "number",
  "total_price": "number",
  "status": "string",
  "notes": "string | null",
  "created_at": "datetime",
  "accepted_at": "datetime | null",
  "completed_at": "datetime | null",
  "driver_id": "string | null",
  "driver_name": "string | null"
}
```

### 4.6 DriverEarningsModel
```json
{
  "today_earnings": "number",
  "week_earnings": "number",
  "month_earnings": "number",
  "total_earnings": "number",
  "today_deliveries": "number",
  "week_deliveries": "number",
  "month_deliveries": "number",
  "total_deliveries": "number",
  "average_earning_per_delivery": "number",
  "weekly_earnings": [
    { "date": "string", "earnings": "number", "deliveries": "number" }
  ]
}
```

### 4.7 DriverRatingModel (للأدمن فقط)
```json
{
  "id": "string",
  "user_id": "string",
  "user_name": "string",
  "user_image_url": "string | null",
  "driver_id": "string",
  "order_id": "string | null",
  "rating": "number",
  "comment": "string | null",
  "created_at": "datetime",
  "updated_at": "datetime | null"
}
```

### 4.8 RestaurantStatisticsModel
```json
{
  "today_orders": "number",
  "today_revenue": "number",
  "pending_orders": "number",
  "active_orders": "number",
  "average_order_value": "number",
  "weekly_orders": "number",
  "weekly_revenue": "number",
  "monthly_orders": "number",
  "monthly_revenue": "number"
}
```

### 4.9 CategoryModel
```json
{
  "id": "string",
  "name": "string",
  "name_ar": "string",
  "icon": "string (emoji) | icon_url",
  "color": "string (hex)"
}
```

### 4.10 MenuItemModel
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "image_url": "string | null",
  "is_available": "boolean",
  "extras": "MenuExtraModel[]",
  "category": "string | null",
  "category_id": "string | null",
  "rank": "string | null",
  "expiry_date": "string | null",
  "barcode": "string | null",
  "stock_quantity": "number | null",
  "unit": "string | null",
  "deleted": "boolean"
}
```

---

## 5. شاشات ووظائف لوحة الإدارة المقترحة

### 5.1 لوحة التحكم الرئيسية (Dashboard)
- إجمالي الطلبات (اليوم، الأسبوع، الشهر)
- إجمالي الإيرادات
- عدد المستخدمين (عملاء، سائقون، مطاعم)
- عدد المطاعم النشطة
- طلبات قيد التنفيذ
- رسم بياني للطلبات حسب الوقت
- تنبيهات (طلبات معلقة، شكاوى، إلخ)

### 5.2 إدارة المستخدمين
| الوظيفة | الوصف |
|---------|-------|
| قائمة المستخدمين | عرض مع فلترة حسب النوع (عميل، سائق، مطعم) |
| البحث | بحث بالاسم، البريد، الهاتف |
| تفاصيل المستخدم | عرض الطلبات، العنوان، الحالة |
| تفعيل/تعطيل | تفعيل أو تعطيل حساب |
| إعادة تعيين كلمة المرور | إرسال رابط أو كود للمستخدم |

### 5.3 إدارة المطاعم والمتاجر
| الوظيفة | الوصف |
|---------|-------|
| قائمة المطاعم | كل المطاعم/الصيدليات/السوبرماركت |
| إضافة مطعم | إنشاء مطعم جديد مع ربط مالك |
| تعديل بيانات المطعم | الاسم، العنوان، الحالة، المميز |
| تفعيل/تعطيل | فتح أو إغلاق المطعم للنظام |
| عرض القائمة | أصناف وعناصر القائمة |
| إحصائيات المطعم | طلبات، إيرادات، تقييمات |

### 5.4 إدارة الطلبات
| الوظيفة | الوصف |
|---------|-------|
| قائمة كل الطلبات | مع فلترة (حالة، تاريخ، مطعم، عميل) |
| تفاصيل الطلب | عناصر، عنوان، سائق، حالة |
| تحديث حالة الطلب | تغيير الحالة يدوياً |
| إلغاء الطلب | إلغاء طلب مع إمكانية سبب |
| تصدير | تصدير الطلبات (Excel/CSV) |

### 5.5 إدارة السائقين (Riders)
| الوظيفة | الوصف |
|---------|-------|
| قائمة السائقين | مع حالة النشاط، التقييم |
| تفاصيل السائق | طلبات، أرباح، تقييمات |
| تفعيل/تعطيل | تفعيل أو تعطيل السائق |
| عرض التقييمات | تقييمات السائق (Admin only) |
| عرض الأرباح | أرباح السائق (اليوم، الأسبوع، الشهر) |

### 5.6 إدارة طلبات التوصيل P2P
| الوظيفة | الوصف |
|---------|-------|
| قائمة طلبات التوصيل | كل طلبات P2P |
| تفاصيل الطلب | من، إلى، السائق، الحالة |
| تحديث الحالة | يدوياً إذا لزم |

### 5.7 إدارة التصنيفات
| الوظيفة | الوصف |
|---------|-------|
| قائمة التصنيفات | التصنيفات العامة (مطاعم، صيدليات، إلخ) |
| إضافة/تعديل/حذف | إدارة التصنيفات |

### 5.8 إدارة الكوبونات
| الوظيفة | الوصف |
|---------|-------|
| قائمة الكوبونات | إن وجدت في الباك إند |
| إنشاء كوبون | كود، قيمة، صلاحية، عدد الاستخدام |
| تعديل/حذف | إدارة الكوبونات |

### 5.9 التقييمات والمراجعات
| الوظيفة | الوصف |
|---------|-------|
| تقييمات المطاعم | عرض كل التقييمات |
| تقييمات السائقين | عرض كل التقييمات (Admin only) |
| حذف/إخفاء | إزالة تقييم مخالف |

### 5.10 الإشعارات
| الوظيفة | الوصف |
|---------|-------|
| إرسال إشعار عام | لإرسال لإعدادات معينة (كل المستخدمين، سائقين فقط، إلخ) |
| قائمة الإشعارات المرسلة | سجل الإشعارات |

### 5.11 الإعدادات
| الوضعية | الوصف |
|---------|-------|
| إعدادات التطبيق | اسم التطبيق، الشعار، النصوص |
| أسعار التوصيل | سعر الكيلومتر، الحد الأدنى |
| الإشعارات | FCM أو إعدادات الدفع |
| اللغات | إدارة النصوص للعربية/الإنجليزية |

---

## 6. Endpoints مقترحة للباك إند (Admin-specific)

إذا لم تكن موجودة، يجب إضافتها في الباك إند:

```
# المستخدمون
GET    /admin/users              ?type=driver&page=1&limit=20
GET    /admin/users/:id
PUT    /admin/users/:id          (تحديث، تفعيل، تعطيل)
GET    /admin/users/stats

# المطاعم
GET    /admin/restaurants        ?vendor_type=restaurant&page=1
POST   /admin/restaurants
PUT    /admin/restaurants/:id
DELETE /admin/restaurants/:id

# الطلبات
GET    /admin/orders            ?status=delivered&from=&to=
GET    /admin/orders/:id
PUT    /admin/orders/:id/status
POST   /admin/orders/:id/cancel
GET    /admin/orders/stats

# السائقون
GET    /admin/riders            ?is_active=true
GET    /admin/riders/:id
PUT    /admin/riders/:id
GET    /admin/riders/:id/reviews
GET    /admin/riders/:id/earnings
GET    /admin/riders/stats

# طلبات التوصيل P2P
GET    /admin/delivery-requests
GET    /admin/delivery-requests/:id

# التصنيفات
GET    /admin/categories
POST   /admin/categories
PUT    /admin/categories/:id
DELETE /admin/categories/:id

# الكوبونات
GET    /admin/coupons
POST   /admin/coupons
PUT    /admin/coupons/:id
DELETE /admin/coupons/:id

# الإشعارات
POST   /admin/notifications/send   { "user_ids": [], "user_type": "driver", "title": "", "body": "" }

# لوحة التحكم
GET    /admin/dashboard/stats
GET    /admin/dashboard/orders-chart   ?period=week
```

---

## 7. المصادقة للأدمن

1. **تسجيل الدخول:** استخدم `/user/signin` مع `userType: "admin"` إذا كان مدعوماً.
2. **صلاحيات (RBAC):** يفضّل أن يكون للأدمن صلاحيات محددة (مثلاً: super_admin، admin، support).
3. **التحقق:** كل طلبات الأدمن يجب أن تمر بـ middleware يتحقق من `userType === 'admin'` أو role مشابه.

---

## 8. ملاحظات نهائية

1. **الباك إند الحالي** لا يبدو أنه يحتوي على endpoints خاصة بالأدمن (`/admin/*`). استخدم الـ endpoints الموجودة مع مستخدم admin إن أمكن، أو أضف endpoints جديدة في الباك إند.
2. **تقييمات السائقين** مخصصة للأدمن فقط ولا تظهر للعملاء.
3. **الكوبونات** معرفة في `api_constants` لكن غير مستخدمة في التطبيق حالياً.
4. **P2P Delivery** طلبات توصيل بين العميل والسائق مباشرة بدون مطعم.
5. **Vendor Types:** المطاعم تدعم `restaurant`، `pharmacy`، `supermarket`.
6. **WebSocket** مفيد لتحديث الطلبات وموقع السائق في الوقت الفعلي داخل لوحة الإدارة.

---

تم تجميع هذا الملف بناءً على تحليل تطبيق SouqDelivery والـ API constants والـ repositories. أي تغييرات في الباك إند يجب أن تنعكس في هذا الملف.
