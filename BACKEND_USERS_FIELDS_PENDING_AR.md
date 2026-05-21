# تنبيه: الحقول الجديدة للمستخدمين غير منشورة على السيرفر

## ما يظهر في Console الآن

```
GET /admin/users → 200
الحقول: id, name, email, phone, userType, status, totalOrders, totalSpent, createdAt
(9 حقول فقط)
```

## ما كان متوقعاً (حسب `flutter-admin-users-fields.md`)

نفس الـ endpoints لكن مع **7 حقول إضافية**:

- `first_name`, `last_name`
- `image_url`
- `is_email_verified`
- `last_login_at`
- `last_seen_at`
- `restaurant_id`

## الخلاصة

| الجهة | الحالة |
|--------|--------|
| وثيقة الباكند | ✅ أرسلت المواصفة |
| لوحة الأدمن (React) | ✅ جاهزة لاستقبال الحقول |
| السيرفر الحالي (`souq-917s.onrender.com`) | ❌ لم يُنشر التحديث بعد |

## المطلوب من الباكند

1. Deploy الكود الذي يوسّع استجابة `GET /admin/users` و `GET /admin/users/:id`.
2. التحقق بعد النشر:

```http
GET /servy/api/v1/admin/users?page=1&limit=1
Authorization: Bearer <admin_token>
```

يجب أن يحتوي أول عنصر في `users[]` على `first_name` على الأقل.

## للأدمن (مؤقتاً)

- الاسم الأول/الأخير يُستنتجان من `name` (مثال: `test test` → Omar/Khaled).
- أعمدة «آخر دخول» و«البريد موثّق» تظهر `—` حتى ينشر الباكند الحقول.
- تحذير أصفر في صفحة المستخدمين يوضح أن المشكلة من السيرفر وليس من الواجهة.
