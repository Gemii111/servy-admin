# Souq Admin — متطلبات الباك إند للوحة الإدارة

> **الجمهور:** فريق Backend  
> **المرجع:** `ADMIN_APP_COMPLETE_HANDOFF.md` · `ADMIN_API_DOCS.md` · `ADMIN_API_PHASE3.md`  
> **حالة الواجهة (Frontend):** جاهزة مع طبقة API + Mock — عند `REACT_APP_USE_MOCK_API=false` تتصل بالمسارات أدناه  
> **آخر تحديث:** 2026-05-17

---

## 1. إعداد عام

| البند | القيمة |
|-------|--------|
| Base URL | `https://souq-917s.onrender.com/servy/api/v1` |
| Auth | `Authorization: Bearer {accessToken}` |
| Timeout مقترح | **60 ثانية** (Render Free Tier) |
| شكل الاستجابة المفضّل | `{ "success": true, "data": ... }` أو مصفوفة/كائن مباشر (الواجهة تدعم الاثنين) |
| أخطاء | `{ "error": "رسالة" }` أو `{ "message": "..." }` |
| Pagination | `page`, `limit`, `total`, `totalPages` |

### تسجيل دخول الأدمن (موجود)

```
POST /admin/auth/login
Body: { "email": "...", "password": "..." }
Response: { "success": true, "data": { "admin": {...}, "accessToken": "..." } }
```

---

## 2. ما هو مُنفَّذ في الباك (حسب الوثائق الحالية) — يجب التأكد والاختبار

| المجموعة | Endpoints |
|----------|-----------|
| Dashboard | `GET /admin/dashboard/statistics`, `orders-over-time`, `revenue-over-time`, `orders-by-status`, `top-restaurants` |
| Users | `GET/POST /admin/users`, `GET/PUT/DELETE /admin/users/:id`, `PUT .../status` |
| Orders | `GET /admin/orders`, `GET .../:id`, `PUT .../status`, `POST .../assign-driver` |
| Delivery P2P | `GET /admin/delivery-requests`, `GET .../:id`, `PUT .../status`, `PUT .../cancel` |
| Restaurants | `GET /admin/restaurants`, `GET .../:id`, `PUT .../status`, `DELETE .../:id` |
| Categories | CRUD + `PUT .../toggle` |
| Coupons | CRUD + `PUT .../toggle` |
| Riders (Phase 3) | `GET /admin/riders`, `stats`, `:id`, `PUT .../status` |
| Reviews (Phase 3) | `GET /admin/reviews`, `DELETE .../:id` |
| Notifications (Phase 3) | `POST .../send`, `POST .../send-bulk`, `GET .../stats` |
| Loyalty (Phase 3) | `GET accounts`, `GET accounts/:userId`, `stats`, `POST adjust` |
| Settings (Phase 3) | `GET/PUT /admin/settings` |

---

## 3. مطلوب تنفيذه في الباك — أولوية عالية (P0)

### 3.1 الطلبات — إكمال

```
GET    /admin/orders?orderType=vendor|p2p&status=...&restaurantId=...&page=&limit=
POST   /admin/orders/:id/cancel
Body:  { "reason": "سبب الإلغاء" }

GET    /admin/orders/:id/tracking
Response: {
  "events": [
    { "status": "pending", "label": "قيد الانتظار", "timestamp": "ISO8601", "note": "..." }
  ]
}
```

### 3.2 المستخدمون

```
POST   /admin/users/:id/reset-password
Body:  { "new_password": "optional" }   // إن تُرك فارغاً: إرسال رابط/OTP
Response: { "message": "..." }
```

### 3.3 السائقون

```
PUT    /admin/riders/:id/approve
Response: { "message": "Rider approved" }
```

### 3.4 المتاجر — Trust + إنشاء

```
PUT    /admin/restaurants/:id/verified
Body:  { "is_verified_seller": true }

PUT    /admin/restaurants/:id
Body:  حقول Trust Elements (انظر §6)

POST   /admin/restaurants
Body:  إنشاء متجر من الأدمن
```

---

## 4. مطلوب تنفيذه — أولوية متوسطة (P1)

### 4.1 البانرات (الواجهة جاهزة — Mock حالياً)

```
GET    /admin/banners?is_active=true&banner_type=platform_offer
POST   /admin/banners
PUT    /admin/banners/:id
DELETE /admin/banners/:id
```

**نموذج Banner:**

```json
{
  "id": "uuid",
  "title": "خصم 50%",
  "description": "على أول طلب",
  "banner_type": "restaurant_promo | platform_offer | campaign | custom",
  "image_url": "https://...",
  "action_url": "souq://promo/...",
  "restaurant_id": null,
  "priority": 10,
  "user_segment": "new_user | loyal_user | all",
  "is_active": true,
  "start_date": "ISO8601",
  "end_date": "ISO8601"
}
```

يجب أن تظهر في `GET /banners` لتطبيق العميل.

### 4.2 الحملات

```
GET    /admin/campaigns?status=active
POST   /admin/campaigns
PUT    /admin/campaigns/:id
POST   /admin/campaigns/:id/send-notification
```

### 4.3 عروض Flash

```
GET    /admin/flash-offers
POST   /admin/flash-offers
PUT    /admin/flash-offers/:id
```

(أو دمجها في `/admin/campaigns` مع `type: flash`)

### 4.4 التقارير

```
GET    /admin/reports/orders?date_from=&date_to=
GET    /admin/reports/revenue?date_from=&date_to=
GET    /admin/reports/revenue-by-day?date_from=&date_to=
GET    /admin/reports/drivers?date_from=&date_to=
GET    /admin/reports/export?type=orders&format=csv&date_from=&date_to=
```

**استجابة orders report (مثال):**

```json
{
  "totalOrders": 1500,
  "totalRevenue": 250000,
  "averageOrderValue": 166,
  "totalDeliveryFees": 30000,
  "ordersByStatus": [
    { "status": "delivered", "count": 1000, "revenue": 200000 }
  ]
}
```

### 4.5 إشراف المنيو

```
GET    /admin/restaurants/:restaurantId/menu
Response: { "items": [ { "id", "name", "price", "is_available", "category", ... } ] }

PUT    /admin/menu/items/:id/availability
Body:  { "is_available": false }
```

### 4.6 المراجعات — إخفاء

```
PUT    /admin/reviews/:id/hide
Body:  { "hidden": true }
```

### 4.7 سجل التدقيق (Audit Log)

```
GET    /admin/audit-logs?actionType=&entityType=&dateFrom=&dateTo=&page=&limit=
Response: {
  "logs": [
    {
      "id": "uuid",
      "adminId": "uuid",
      "adminName": "Admin",
      "actionType": "create|update|delete|approve",
      "entityType": "order|restaurant|user|coupon",
      "entityId": "uuid",
      "description": "...",
      "ipAddress": "x.x.x.x",
      "createdAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

يُسجَّل تلقائياً عند: تغيير حالة طلب، موافقة متجر، حذف تقييم، تعديل إعدادات، إلخ.

### 4.8 تاريخ الإشعارات المرسلة

```
GET    /admin/notifications/history?page=&limit=
POST   /admin/notifications/schedule   // اختياري لاحقاً
```

---

## 5. مطلوب تنفيذه — أولوية منخفضة / متقدم (P2)

### 5.1 WebSocket (تطبيق العميل يستخدمها — الأدمن يحتاجها للوحة الحية)

| Path | الاستخدام |
|------|-----------|
| `wss://{host}/servy/api/v1/ws/orders` | تحديث قائمة الطلبات |
| `wss://.../ws/order/:orderId` | تتبع طلب واحد |
| `wss://.../ws/driver-location` | موقع السائق |

**Auth:** تمرير `?token=` أو header عند الاتصال.

### 5.2 Geofence

```
GET    /admin/settings/geofence
PUT    /admin/settings/geofence
Body:  {
  "polygon": [[lat, lon], ...],
  "message_ar": "التوصيل غير متاح في منطقتك",
  "message_en": "..."
}
```

أو مفاتيح في `/admin/settings`: `geofence_polygon`, `geofence_enabled`.

### 5.3 إصدارات التطبيقات (Force Update)

```
GET    /app/version-config          // عام — موجود للعميل
PUT    /admin/settings              // مفاتيح:
       min_version_android, min_version_ios, min_version_customer,
       min_version_merchant, min_version_driver, force_update,
       store_url_android, store_url_ios
```

### 5.4 رفع الصور (R2)

```
POST   /uploads/presigned-url
Body:  { "folder": "banners", "filename": "x.jpg", "content_type": "image/jpeg" }
Response: { "upload_url": "...", "public_url": "https://..." }
```

### 5.5 RBAC

- حقل `role` في JWT الأدمن: `super_admin`, `operations`, `marketing`, `support`
- Middleware يمنع مسارات حسب الدور

### 5.6 جوائز / Rewards (واجهة موجودة — Mock)

```
GET/POST/PUT/DELETE /admin/rewards
GET                 /admin/rewards/history
GET                 /admin/rewards/statistics
```

---

## 6. حقول Trust Elements على المتجر (تطبيق العميل)

يجب إرجاعها في `GET /restaurants/:id` و `PUT /admin/restaurants/:id`:

| الحقل | النوع |
|-------|------|
| `is_verified_seller` | boolean |
| `return_policy_summary` | string |
| `return_policy_url` | string |
| `supports_secure_payment` | boolean |
| `accepted_payment_methods` | string[] (`cash`, `card`, `wallet`) |
| `delivery_badge_label` | string |
| `delivery_guarantee` | string |

---

## 7. مفاتيح الإعدادات (`/admin/settings`)

| Key | Default | الوصف |
|-----|---------|--------|
| `delivery_base_fee` | `20` | رسوم أساسية (ج.م) |
| `delivery_price_per_km` | `10` | لكل كم |
| `delivery_free_km` | `2` | كم مجاني |
| `max_delivery_distance_km` | `20` | أقصى مسافة |
| `min_order_amount` | `50` | أقل طلب |
| `maintenance_mode` | `false` | إيقاف الطلبات |
| `loyalty_earn_rate` | `1` | نقاط/جنيه |
| `loyalty_redeem_rate` | `0.1` | قيمة النقطة |
| `loyalty_expiry_days` | `90` | صلاحية النقاط |
| `min_version_android` | `1.0.0` | Force update |
| `min_version_ios` | `1.0.0` | Force update |
| `force_update` | `false` | إجبار التحديث |

---

## 8. ترتيب التنفيذ المقترح للباك

| الأسبوع | المهام |
|---------|--------|
| 1 | تأكيد Phase 1–2 + Phase 3 على Staging · `cancel` + `tracking` للطلبات · `reset-password` · `rider approve` |
| 2 | `/admin/banners` · `/admin/campaigns` · `/admin/reports/*` |
| 3 | Menu oversight · Audit logs · Review hide · Notification history |
| 4 | WebSocket للأدمن · Geofence · RBAC · Rewards API |

---

## 9. اختبار التكامل مع الواجهة

```bash
cd web
# .env.local
REACT_APP_USE_MOCK_API=false
REACT_APP_API_BASE_URL=https://souq-917s.onrender.com/servy/api/v1
npm start
```

**Checklist سريع:**

- [ ] Login أدمن
- [ ] Dashboard أرقام حقيقية
- [ ] قائمة طلبات + تفاصيل + إلغاء + tracking
- [ ] موافقة مطعم + verified seller
- [ ] إرسال إشعار bulk + FCM stats
- [ ] تعديل إعدادات التوصيل تنعكس على checkout العميل
- [ ] CRUD بانر يظهر في `GET /banners`

---

## 10. ملفات مرجعية في repo الأدمن

| الملف | المحتوى |
|-------|---------|
| `ADMIN_APP_COMPLETE_HANDOFF.md` | Handoff من تطبيق العميل |
| `ADMIN_API_DOCS.md` | Phase 1–2 |
| `ADMIN_API_PHASE3.md` | Riders, Reviews, Notifications, Loyalty, Settings |
| `ADMIN_HANDOFF_TODO.md` | تتبع تنفيذ الواجهة |
| `web/src/services/api/*.ts` | عقود الاستدعاء الفعلية في الكود |

---

*عند إضافة endpoint جديد، حدّث هذا الملف و`ADMIN_API_DOCS.md` حتى تبقى الواجهة والباك متزامنين.*
