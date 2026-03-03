# متطلبات تطبيق الأدمن – Souq Merchant
## دليل شامل لكل ما يحتاجه الأدمن لتشغيل وإدارة المنصة

---

## 1. نظرة عامة على النظام

| العنصر | التفاصيل |
|--------|----------|
| **اسم المنصة** | Souq (سوق) |
| **Backend Base URL** | `https://talabat-ehpd.onrender.com` |
| **API Path** | `/servy/api/v1` |
| **Full API Base** | `https://talabat-ehpd.onrender.com/servy/api/v1` |
| **WebSocket** | `wss://api.servy.app/ws` |
| **المصادقة** | JWT (Bearer Token) |
| **تطبيق التاجر** | Flutter (vendor_app) – هذا المشروع |

---

## 2. أنواع المستخدمين (User Types)

| النوع | الوصف | يستخدم |
|-------|-------|--------|
| `customer` | عميل | تطبيق العملاء |
| `driver` | سائق | تطبيق السائقين |
| `restaurant` | مطعم | تطبيق التاجر |
| `vendor` | بائع (مطعم) | تطبيق التاجر |
| `pharmacy` | صيدلية | تطبيق التاجر |
| `supermarket` | سوبرماركت | تطبيق التاجر |

**ملاحظة:** لا يوجد حاليًا نوع `admin` في النظام. تطبيق الأدمن يحتاج إضافته في Backend مع صلاحيات خاصة.

---

## 3. أنواع المتاجر (Vendor Types)

| النوع | الوصف |
|-------|-------|
| `restaurant` | مطعم |
| `pharmacy` | صيدلية |
| `supermarket` | سوبرماركت |

---

## 4. حالات الطلب (Order Statuses)

| الحالة | الكود | الوصف |
|--------|-------|-------|
| معلق | `pending` | في انتظار قبول المطعم |
| مقبول | `accepted` | مقبول من المطعم |
| قيد التحضير | `preparing` | المطعم يحضر الطلب |
| جاهز | `ready` | الطلب جاهز للتسليم |
| متجه للمطعم | `heading_to_restaurant` | السائق متجه للمطعم |
| عند المطعم | `at_restaurant` | السائق عند المطعم |
| تم الاستلام | `picked_up` | السائق استلم الطلب |
| في التوصيل | `delivering` | السائق يوصّل الطلب |
| تم التسليم | `delivered` | تم التسليم |
| ملغي | `cancelled` | تم إلغاء الطلب |

---

## 5. أنواع الطلبات (Order Types)

| النوع | الوصف |
|-------|-------|
| `vendor` | طلب من مطعم/صيدلية/سوبرماركت |
| `p2p` | توصيل P2P (عميل لعميل – حزم) |

---

## 6. الـ API Endpoints الموجودة والمرتبطة بالإدارة

### المصادقة (Auth)
| Method | Endpoint | الغرض |
|--------|----------|-------|
| POST | `/user/signin` | تسجيل الدخول |
| POST | `/user/signup` | إنشاء حساب |
| POST | `/user/refresh` | تحديث التوكن |
| POST | `/user/logout` | تسجيل الخروج |

### المستخدمون
| Method | Endpoint | الغرض |
|--------|----------|-------|
| GET | `/user/profile` | عرض البروفايل |
| PUT | `/user/profile` | تحديث البروفايل |
| GET | `/user/restaurants` | قائمة متاجر المستخدم |

### المتاجر (Restaurants / Pharmacies / Supermarkets)
| Method | Endpoint | الغرض |
|--------|----------|-------|
| GET | `/restaurants/:id` | عرض متجر |
| POST | `/restaurants` | إنشاء متجر |
| PUT | `/restaurants/:id` | تحديث متجر |
| PUT | `/restaurants/:id/status` | فتح/إغلاق المتجر |
| DELETE | `/restaurants/:id` | حذف متجر |

### الطلبات
| Method | Endpoint | الغرض |
|--------|----------|-------|
| GET | `/restaurant/orders` | قائمة طلبات المتجر |
| GET | `/restaurant/orders/:id` | تفاصيل طلب |
| PUT | `/restaurant/orders/:id/status` | تحديث حالة الطلب |

### القائمة والمنيو
| Method | Endpoint | الغرض |
|--------|----------|-------|
| GET | `/restaurant/categories` | التصنيفات |
| POST | `/restaurant/categories` | إضافة تصنيف |
| PUT | `/restaurant/categories/:id` | تعديل تصنيف |
| DELETE | `/restaurant/categories/:id` | حذف تصنيف |
| GET | `/restaurant/menu/items` | عناصر القائمة |
| POST | `/restaurant/menu/items` | إضافة عنصر |
| GET | `/restaurant/menu/items/:id` | تفاصيل عنصر |
| PUT | `/restaurant/menu/items/:id` | تعديل عنصر |
| DELETE | `/restaurant/menu/items/:id` | حذف عنصر |

### التقييمات والمراجعات
| Method | Endpoint | الغرض |
|--------|----------|-------|
| POST | `/reviews/restaurant` | تقييم مطعم |
| POST | `/reviews/rider` | تقييم سائق |
| GET | `/restaurants/:id/reviews` | مراجعات المطعم |
| GET | `/riders/:id/reviews` | مراجعات السائق (للأدمن فقط) |

### الإحصائيات
| Method | Endpoint | الغرض |
|--------|----------|-------|
| GET | `/restaurant/statistics` | إحصائيات المتجر |

### رفع الصور
| Method | Endpoint | الغرض |
|--------|----------|-------|
| POST | `/uploads/presigned-url` | الحصول على رابط رفع (Cloudflare R2) |

### الكوبونات
| Method | Endpoint | الغرض |
|--------|----------|-------|
| POST | `/coupons/validate` | التحقق من كوبون |
| GET | `/coupons` | قائمة الكوبونات |

### الطلبات P2P
| Method | Endpoint | الغرض |
|--------|----------|-------|
| POST | `/order/p2p/checkout` | إنهاء طلب P2P |

### الإشعارات
| Method | Endpoint | الغرض |
|--------|----------|-------|
| POST | `/notifications/register-token` | تسجيل توكن الإشعارات |

---

## 7. ما يحتاجه تطبيق الأدمن من Endpoints (غير موجودة حالياً)

يجب إضافة/توضيح الـ Endpoints التالية في الـ Backend للأدمن:

### إدارة المستخدمين (Admin)
| Method | Endpoint المقترح | الغرض |
|--------|------------------|-------|
| GET | `/admin/users` | قائمة كل المستخدمين (مع فلترة ون pagination) |
| GET | `/admin/users/:id` | تفاصيل مستخدم |
| PUT | `/admin/users/:id` | تعديل مستخدم (تفعيل/تعطيل/تعديل الصلاحيات) |
| DELETE | `/admin/users/:id` | حذف أو تعطيل مستخدم |

### إدارة المتاجر (Admin)
| Method | Endpoint المقترح | الغرض |
|--------|------------------|-------|
| GET | `/admin/restaurants` | قائمة كل المتاجر |
| GET | `/admin/restaurants/:id` | تفاصيل متجر |
| PUT | `/admin/restaurants/:id` | تعديل متجر (تفعيل/تعطيل/مميز) |
| PUT | `/admin/restaurants/:id/status` | فتح/إغلاق متجر يدوياً |
| DELETE | `/admin/restaurants/:id` | حذف متجر |

### إدارة الطلبات (Admin)
| Method | Endpoint المقترح | الغرض |
|--------|------------------|-------|
| GET | `/admin/orders` | كل الطلبات (مع فلترة وتاريخ) |
| GET | `/admin/orders/:id` | تفاصيل طلب |
| PUT | `/admin/orders/:id/status` | تحديث حالة الطلب (تدخل يدوي) |

### إدارة السائقين (Riders)
| Method | Endpoint المقترح | الغرض |
|--------|------------------|-------|
| GET | `/admin/riders` | قائمة السائقين |
| GET | `/admin/riders/:id` | تفاصيل سائق |
| GET | `/admin/riders/:id/reviews` | تقييمات السائق (موجود: `/riders/:id/reviews`) |

### إحصائيات المنصة (Admin)
| Method | Endpoint المقترح | الغرض |
|--------|------------------|-------|
| GET | `/admin/statistics` | إحصائيات عامة (عدد المستخدمين، الطلبات، الإيرادات...) |
| GET | `/admin/statistics/daily` | إحصائيات يومية |
| GET | `/admin/statistics/revenue` | تقارير الإيرادات |

### إدارة الكوبونات (Admin)
| Method | Endpoint المقترح | الغرض |
|--------|------------------|-------|
| GET | `/admin/coupons` | قائمة الكوبونات |
| POST | `/admin/coupons` | إنشاء كوبون |
| PUT | `/admin/coupons/:id` | تعديل كوبون |
| DELETE | `/admin/coupons/:id` | حذف كوبون |

### الإشعارات (Admin)
| Method | Endpoint المقترح | الغرض |
|--------|------------------|-------|
| POST | `/admin/notifications/broadcast` | إرسال إشعار لكل المستخدمين |
| POST | `/admin/notifications/send` | إرسال إشعار لمستخدم/مجموعة |

---

## 8. البيانات (Data Models) – مرجع سريع

### UserModel
```
id, email, name, phone, userType, imageUrl, isEmailVerified, createdAt, restaurantId
```

### RestaurantModel
```
id, name, description, imageUrl, rating, reviewCount, cuisineType, deliveryTime,
deliveryFee, minOrderAmount, isOpen, isOnline, distance, address, latitude,
longitude, images, isFeatured, vendorType
```

### OrderModel
```
id, userId, restaurantId, restaurantName, status, deliveryAddress, subtotal,
deliveryFee, tax, discount, total, paymentMethod, createdAt, estimatedDeliveryTime,
notes, couponCode, items, itemCount, driverId, driverName, driverPhone,
customerPhone, deliveredAt, vendorType, orderType, pickupAddress, receiverName,
receiverPhone, itemDescription
```

### MenuItemModel
```
id, name, description, price, discount, priceBeforeDiscount, priceAfterDiscount,
imageUrl, isAvailable, extras, sizes, category, categoryId, rank, expiryDate,
barcode, stockQuantity, unit, deleted
```

### RestaurantStatisticsModel
```
todayOrders, todayRevenue, pendingOrders, activeOrders, averageOrderValue,
weeklyOrders, weeklyRevenue, monthlyOrders, monthlyRevenue
```

### DriverRatingModel (للسائقين – مرئية للأدمن فقط)
```
id, userId, userName, userImageUrl, driverId, orderId, rating, comment, createdAt, updatedAt
```

---

## 9. شاشات تطبيق الأدمن المقترحة

### لوحة التحكم (Dashboard)
- إحصائيات سريعة: عدد الطلبات اليوم، الإيرادات، المستخدمين، المتاجر
- رسوم بيانية للإيرادات
- آخر الطلبات

### إدارة المستخدمين
- قائمة المستخدمين (customers, drivers, vendors)
- فلترة حسب النوع والتاريخ
- عرض/تعديل/تعطيل مستخدم

### إدارة المتاجر
- قائمة المطاعم/الصيدليات/السوبرماركت
- فلترة حسب النوع والحالة
- تعديل، تفعيل، تعطيل، تمييز متجر

### إدارة الطلبات
- قائمة كل الطلبات
- فلترة حسب التاريخ، الحالة، المتجر
- عرض التفاصيل وتحديث الحالة يدوياً

### إدارة السائقين
- قائمة السائقين
- تقييمات السائقين (Driver Ratings – للأدمن فقط)
- إحصائيات السائق

### إدارة الكوبونات
- إنشاء وتعديل وحذف الكوبونات
- مراقبة الاستخدام

### الإشعارات
- إرسال إشعار عام أو لشريحة معينة

### الإعدادات
- إعدادات المنصة
- روابط سياسة الخصوصية والشروط

---

## 10. معلومات الدعم والاتصال

| العنصر | القيمة |
|--------|--------|
| البريد الإلكتروني | support@souqegy.net |
| الهاتف 1 | +201091717188 |
| الهاتف 2 | +201000431699 |
| سياسة الخصوصية | https://www.souqegy.net/privacy |
| الشروط والأحكام | https://www.souqegy.net/terms |
| العنوان | ذكرنس، دقهلية، مصر |

---

## 11. متطلبات تشغيل تطبيق الأدمن

### تقنية مقترحة
- **Web:** React/Next.js أو Vue لسهولة الوصول
- **مصادقة:** تسجيل دخول خاص بالأدمن (userType: admin) + JWT
- **API Client:** نفس Base URL مع صلاحيات admin

### بيئة التشغيل
- الاتصال بنفس Backend: `https://talabat-ehpd.onrender.com`
- إضافة طبقة صلاحيات `admin` في الـ Backend
- دعم RTL (العربية) + الإنجليزية

### ما يجب التأكد منه في الـ Backend
1. إضافة `admin` كـ userType مع صلاحيات وصول لكل الموارد
2. إنشاء endpoints `/admin/*` للعمليات الإدارية
3. Middleware للتحقق من صلاحية الأدمن قبل تنفيذ أي طلب admin

---

## 12. ملخص سريع للمطور

- **Backend URL:** `https://talabat-ehpd.onrender.com/servy/api/v1`
- **Auth:** Bearer Token
- **User Types:** customer, driver, restaurant, vendor, pharmacy, supermarket
- **Vendor Types:** restaurant, pharmacy, supermarket
- **Order Types:** vendor, p2p
- **Driver ratings:** مرئية للأدمن فقط عبر `/riders/:id/reviews`
- **لا يوجد تطبيق أدمن حالي** – الـ Backend يحتاج توسيع لدعم admin

---

*تم إنشاء هذا الملف بناءً على تحليل مشروع SouqMerchant (تطبيق التاجر) بتاريخ 2025-03-03*
