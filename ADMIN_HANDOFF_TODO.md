# Souq Admin — تتبع التنفيذ (محدّث)

> **آخر تحديث:** 2026-05-17  
> **ملف الباك:** [`BACKEND_REQUIREMENTS_FOR_ADMIN.md`](BACKEND_REQUIREMENTS_FOR_ADMIN.md)

## ملخص

| المرحلة | التقدّم |
|---------|---------|
| P0 أساس | **~95%** (واجهة) — يحتاج باك لبعض endpoints |
| P1 تسويق/تقارير | **~80%** (واجهة + API layer) — باك للبانرات/التقارير |
| P2/P3 متقدم | **~70%** (واجهة) — WebSocket/Geofence يحتاج باك |

---

## منفّذ في الواجهة ✅

- [x] Login, Dashboard, Charts, Live orders hook (WebSocket client)
- [x] Users, Orders (+ نوع vendor/p2p, إلغاء, timeline), Restaurants, Riders (+ موافقة)
- [x] P2P Delivery, Categories, Coupons, Reviews
- [x] Loyalty قائمة + **تفاصيل حساب** `/loyalty/:userId`
- [x] Settings (API) + ولاء + **Force Update UI**
- [x] Notifications send/bulk + FCM stats
- [x] **إشراف المنيو** `/menu`
- [x] **سجل التدقيق** `/audit-log`
- [x] Banners/Campaigns/Reports — **طبقة API حقيقية** (Mock fallback)
- [x] RTL (MUI + stylis-rtl)
- [x] Presigned upload helper `utils/upload.ts`
- [x] إعادة تعيين كلمة مرور (UI + API call)

---

## يعتمد على الباك — راجع `BACKEND_REQUIREMENTS_FOR_ADMIN.md`

| الميزة | Endpoint مطلوب |
|--------|----------------|
| إلغاء طلب + tracking | `POST /admin/orders/:id/cancel`, `GET .../tracking` |
| Reset password | `POST /admin/users/:id/reset-password` |
| موافقة سائق | `PUT /admin/riders/:id/approve` |
| Banners CRUD | `/admin/banners` |
| Campaigns | `/admin/campaigns` |
| Reports | `/admin/reports/*` |
| Menu oversight | `GET .../menu`, `PUT .../availability` |
| Audit log | `GET /admin/audit-logs` |
| Review hide | `PUT /admin/reviews/:id/hide` |
| WebSocket حي | `/ws/orders`, `/ws/order/:id` |
| Geofence polygon | settings أو endpoint مخصص |
| Trust elements | حقول على restaurant |
| Rewards API | `/admin/rewards` |
| RBAC | JWT roles |

---

## أوامر التشغيل

```bash
cd web
npm start                    # Mock افتراضي في dev
# REACT_APP_USE_MOCK_API=false
# REACT_APP_API_BASE_URL=https://souq-917s.onrender.com/servy/api/v1
```

---

*الواجهة جاهزة للربط الكامل — ابدأ من ملف الباك أعلاه.*
