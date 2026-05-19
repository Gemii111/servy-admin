# رد على تقرير الباك — البانرات والحملات

> **لمن:** فريق الباك إند  
> **من:** فريق الأدمن / المنتج  
> **التاريخ:** مايو 2026  
> **مرجع تقريركم:** ملخص إنجليزي لملف `BACKEND_BANNERS_CAMPAIGNS_STATUS.md`

### للفريق Flutter (سطر واحد — انسخه)

```
FCM data.type for campaign push (POST /admin/campaigns/:id/notify): canonical value is "campaign" (lowercase). Compare case-insensitively; do not rely on "CAMPAIGN".
```

(نفس النص في `CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md` تحت العنوان مباشرة.)

---

## 1. ملخص سريع

تقريركم **صحيح في الجزء الأساسي:** واجهة الأدمن جاهزة، والوثائق مكتملة، وأكبر مجهول كان **اختبار الباك على Render**.

بعد استخدام الأدمن على السيرفر الحقيقي (`https://souq-917s.onrender.com/servy/api/v1`)، الوضع **لم يعد «كل شيء غير مؤكد»** — جزء كبير من مسارات **الحملات والإشعار** يعمل. ما زال ينقصكم **اختبار الدورة الكاملة admin → customer** (البانر والحملة تظهر في تطبيق العميل).

---

## 2. ما نتفق معكم عليه ✅

| البند | الحالة |
|--------|--------|
| الأدمن: CRUD بانرات + حملات + زر إرسال إشعار | ✅ منفّذ |
| عقود JSON، enums، قواعد `user_segment` والتواريخ | ✅ موثّقة |
| سكربت اختبار §7 في الملف الأصلي | ✅ مفيد — شغّلوه وأكملوا العمود |
| Flash offers غير محسوم | ✅ ما زال مفتوحاً |
| `DELETE /admin/campaigns` غير مستخدم في الأدمن | ✅ مقصود حالياً |
| مزامنة `POST /admin/*` → `GET` للعميل | ⚠️ **ما زالت أولوية — لم نؤكدها من الأدمن** |

---

## 3. ما تغيّر بعد الاختبار الحي (مهم للباك) 🔄

### 3.1 مسار الإشعار — ليس `send-notification`

| المسار | النتيجة على Render |
|--------|---------------------|
| `POST /admin/campaigns/:id/notify` | ✅ **200** — الإشعار وصل للعميل |
| `POST /admin/campaigns/:id/send-notification` | ❌ **404** |

**المطلوب من الباك (واحد من الاثنين):**

1. توثيق رسمي أن المسار المعتمد هو **`/notify`**، أو  
2. إضافة **alias** يوجّه `send-notification` → نفس منطق `notify` لتطابق الوثائق القديمة.

الأدمن يستدعي `/notify` أولاً (انظر `web/src/services/api/campaigns.ts`).

### 3.2 الحملات في الأدمن

| المسار | الحالة |
|--------|--------|
| `GET /admin/campaigns` | ✅ 200 |
| `POST` / `PUT /admin/campaigns/:id` | ✅ يعمل (تواريخ ISO + حقول snake/camel) |
| شكل الاستجابة | قد يكون `{ data: [...] }` — الأدمن يتعامل مع أشكال متعددة |

### 3.3 رفع الصور

| الخطوة | الحالة |
|--------|--------|
| `POST /uploads/presigned-url` | ⚠️ ينجح غالباً |
| `PUT` الملف إلى R2 من المتصفح | ❌ **CORS** — الحل: ضبط CORS على الـ bucket **أو** الاعتماد على `image_url` خارجي |

حقول الطلب الصحيحة: **`uploadType`**, **`contentType`**, **`filename`** (camelCase) — وليس `folder`.

### 3.4 قائمة كانت «فاضية» في الأدمن

كانت أحياناً **200 مع بيانات** لكن الجدول فارغ بسبب **شكل JSON** (مصفوفة داخل `data` بدل `data.banners`). تم إصلاح **الأدمن**؛ الباك يفضّل توحيد الشكل:

```json
{ "banners": [...], "pagination": {...} }
```
أو
```json
{ "data": { "campaigns": [...] } }
```

مع توثيق الشكل الرسمي.

---

## 4. ما زال مطلوباً من الباك (أولويات) 🎯

### أولوية 1 — Round-trip (الفجوة الأكبر في تقريركم)

```text
POST /admin/banners     →  GET /banners (token عميل)     نفس السجل؟
POST /admin/campaigns   →  GET /campaigns/active           نفس السجل؟
```

شروط ظهور العميل:

- بانر: `is_active=true` + ضمن `start_date`/`end_date` + `user_segment`
- حملة: `status=active` + ضمن التاريخ + `user_segment`

**بدون تأكيد هذين السطرين، الأدمن «يحفظ» لكن التطبيق قد لا يعرض.**

### أولوية 2 — إشعار الحملة (بعد النجاح)

- [ ] `GET /admin/campaigns` يرجع `notification_sent: true` بعد `/notify`
- [ ] FCM يتضمن **`data`** للتوجيه عند الضغط (ليس notification فقط):

```json
{
  "data": {
    "type": "campaign",
    "campaign_id": "uuid",
    "restaurant_id": "",
    "coupon_id": "",
    "banner_id": ""
  }
}
```

> **`data.type` canonical:** `"campaign"` (lowercase) — من `internal/campaign/service.go`. وثائق قديمة كانت `"CAMPAIGN"`؛ Flutter يقارن case-insensitive. انظر **`CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md` §3.2**.

التفاصيل الكاملة: **`CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md`**

### أولوية 3 — قرارات مفتوحة

- [ ] `GET /campaigns/flash-offers` — منفصل أم نوع حملة؟
- [ ] CORS R2 للرفع من الأدمن
- [ ] توثيق شكل الاستجابة الموحّد للقوائم

---

## 5. Definition of Done — محدّث

| # | البند | الأدمن | الباك |
|---|--------|--------|-------|
| 1 | CRUD حملات أدمن | ✅ | ☑ جزئي |
| 2 | `/notify` + وصول FCM | ✅ زر | ☑ تم |
| 3 | `send-notification` أو alias | — | ☐ |
| 4 | بانر أدمن → `GET /banners` | ✅ UI | ☐ **مطلوب** |
| 5 | حملة active → `GET /campaigns/active` | ✅ UI | ☐ **مطلوب** |
| 6 | `notification_sent` بعد الإشعار | يعرض | ☐ |
| 7 | FCM `data` للتوجيه | — | ☐ + Flutter |
| 8 | presigned + CORS R2 | ⚠️ URL فقط | ☐ |
| 9 | flash-offers قرار | — | ☐ |

---

## 6. الملفات في الريبو (للتنسيق)

| الملف | الغرض |
|-------|--------|
| `BACKEND_BANNERS_CAMPAIGNS_STATUS.md` | عقود API + §0 تحديث اختبار حي + جداول §4 |
| `CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md` | ماذا تعني الحملة + ماذا يحدث عند ضغط الإشعار |
| `BACKEND_REPLY_TO_STATUS_REPORT_AR.md` | هذا الملف — رد على تقريركم |

---

## 7. الخطوة التالية المقترحة للباك

1. تشغيل §7 في `BACKEND_BANNERS_CAMPAIGNS_STATUS.md` (محدّث: خطوة 6 = **`/notify`**).
2. تعليم ☑ في §4.1 و §4.2 لكل ما ينجح.
3. إرسال لنا **لقطة JSON** من:
   - `GET /banners` بعد إنشاء بانر من الأدمن
   - `GET /campaigns/active` بعد حملة `active`
   - body الـ FCM الفعلي من `/notify`
4. قرار flash-offers + CORS R2 في رد واحد.

---

**الخلاصة:** تقريركم كان دقيقاً لحظة كتابته («الأدمن جاهز، الباك غير مُختبر»). الآن: **الحملات والإشعار يعملان على Render**؛ المتبقي الأهم هو **إظهار ما يُنشأ من الأدمن في endpoints العميل** + **payload الإشعار للتوجيه**.
