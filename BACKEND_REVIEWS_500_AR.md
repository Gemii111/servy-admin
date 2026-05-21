# إصلاح GET /admin/reviews → 500

> **تحديث الباكند (2026-05-21):** حسب `flutter-reviews-api.md` تم إصلاح خطأ SQL في `GET /admin/reviews`. بعد deploy: أعد تحميل صفحة التقييمات أو اضغط **إعادة المحاولة**.

# (سجل المشكلة السابقة)

## المشكلة (مؤكدة من الأدمن)

الفرونت إند يستدعي:

```
GET /servy/api/v1/admin/reviews?page=1&limit=10
```

مع توكن أدمن صالح (باقي الصفحات مثل Dashboard تعمل 200).

**النتيجة:** `500 Internal Server Error` في **كل** المحاولات:

| المحاولة | Query params |
|----------|----------------|
| 1 | `targetType` + page + limit |
| 2 | `target_type` + page + limit |
| 3 | `page` + `limit` فقط |

يعني العطل **داخل handler** `/admin/reviews` وليس بسبب فلتر معيّن من الواجهة.

---

## ما يعمل حالياً في نفس السيرفر

- `GET /admin/dashboard/statistics` → 200
- `GET /admin/users` → 200
- (محتمل) `GET /admin/driver-ratings` → يُستخدم كـ fallback للسائقين فقط

---

## المطلوب من الباكند

1. إصلاح `GET /admin/reviews` ليرجع 200 مع الشكل:

```json
{
  "reviews": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "userId": "uuid",
      "userName": "string",
      "targetType": "restaurant | rider",
      "targetId": "uuid",
      "targetName": "string",
      "rating": 5,
      "comment": "string",
      "createdAt": "ISO8601",
      "hidden": false
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

2. التحقق من:
   - وجود جدول `reviews` بعد migrations (`000034_add_review_hidden` وغيرها)
   - JOIN على users/restaurants/riders لا يسبب NULL panic
   - أعمدة `hidden` موجودة إن كان الـ query يفلترها

3. تسجيل الخطأ في logs السيرفر عند 500 (stack trace) وإرجاع `message` واضح في JSON بدل `{}` فقط.

---

## مرجع الفرونت

- `web/src/services/api/reviews.ts` — يحاول `/admin/reviews` ثم fallback `/admin/driver-ratings`
- صفحة: `/reviews` (التقييمات العامة)
- صفحة منفصلة: `/driver-ratings` (تقييمات السائقين)

---

## للمطور (الأدمن)

بعد الإصلاح على الباكند: أعد تحميل صفحة التقييمات.

**حالياً (بدون إصلاح الباكند):** صفحة التقييمات تعرض تحذيراً بدل خطأ أحمر، ولن تعيد طلبات متكررة عند focus (لتقليل ضوضاء الـ Console). تقييمات السائق في تفاصيل السائق تظهر رسالة أن الـ API غير متاح.

## للمطور

بعد الإصلاح: أعد تحميل صفحة التقييمات — يجب أن يختفي التحذير الأصفر وأن تظهر تقييمات المطاعم والسائقين من `/admin/reviews`.
