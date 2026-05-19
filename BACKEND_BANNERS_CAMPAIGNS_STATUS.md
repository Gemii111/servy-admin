# الباك إند: البانرات والحملات — المطلوب / المتوقع / الناقص

> **الغرض:** ملف واحد تسلّمه لفريق الباك إند (أو تختبر به بنفسك) لمعرفة **إيه اللي الأدمن بيستدعيه** و**إيه اللي تطبيق العميل محتاجه** و**إيه اللي لسه مش مؤكد التنفيذ** حسب وثائق المشروع.
>
> **Base URL (إنتاج):** `https://souq-917s.onrender.com/servy/api/v1`  
> **الأدمن:** `REACT_APP_USE_MOCK_API=false` — كل الطلبات تحتاج **JWT أدمن**.

---

## 0. تحديث اختبار حي (مايو 2026 — من لوحة الأدمن على Render)

> التقرير الإنجليزي الذي أرسله الباك يصف الوثائق كـ «غير مُختبرة». هذا القسم يحدّث الحالة **بعد استخدام الأدمن الحقيقي** (ليس بديلاً عن اختبار Postman الكامل من طرف الباك).

| البند | الحالة | ملاحظة |
|--------|--------|--------|
| `GET /admin/campaigns` | ✅ 200 | القائمة تعمل؛ شكل الاستجابة قد يكون مصفوفة داخل `data` |
| `POST` / `PUT /admin/campaigns` | ✅ يعمل بعد ضبط payload | تواريخ ISO + حقول snake/camel؛ كان 400 قبل التصحيح |
| `POST /admin/campaigns/:id/notify` | ✅ 200 | **المسار الفعلي على السيرفر** — الإشعار وصل للعميل |
| `POST .../send-notification` | ❌ 404 | غير مُنفَّذ — الأدمن يجرّب `/notify` أولاً |
| `GET /admin/banners` · `coupons` · `restaurants` | ✅ 200 | لاختيارات الربط في نموذج الحملة |
| `POST /uploads/presigned-url` | ⚠️ جزئي | الطلب ينجح؛ **رفع الملف من المتصفح إلى R2 يفشل (CORS)** — استخدم `image_url` مباشرة |
| `GET /banners` (عميل) ← `POST /admin/banners` | ☐ لم يُؤكَّد round-trip | **أولوية الباك** — انظر §9 |
| `GET /campaigns/active` ← حملة `active` | ☐ لم يُؤكَّد round-trip | **أولوية الباك** |
| FCM `data.type` | ✅ موثّق | **canonical: `"campaign"`** (lowercase) — ليس `CAMPAIGN`؛ §3.2 في `CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md` |
| `notification_sent` بعد `/notify` | ☐ غير مؤكد | الأدمن يعطّل الزر إن رجع الحقل `true` |

**للباك:** حدّثوا عمود «تم الاختبار» في §4 بعد تشغيل §7. وثّقوا أن مسار الإشعار هو **`/notify`** وليس `send-notification` فقط.

---

## 1. ملخص سريع

| الجزء | حالة الوثائق في الريبو | حالة واجهة الأدمن |
|--------|-------------------------|-------------------|
| CRUD بانرات (`/admin/banners`) | P1 — **جزئي على Render** (قائمة 200؛ round-trip عميل ☐) | **جاهز** (قائمة + إضافة + تعديل + حذف + رفع صورة) |
| CRUD حملات (`/admin/campaigns`) | P1 — **يعمل على Render**؛ إشعار عبر **`/notify`** | **جاهز** (قائمة + إضافة + تعديل + إرسال إشعار) |
| بانرات للعميل (`GET /banners`) | موثّق في handoff العميل | يعتمد 100% على الباك |
| حملات للعميل (`GET /campaigns/active`) | موثّق | يعتمد على الباك |
| رفع صور (`POST /uploads/presigned-url`) | موثّق | اختياري — يمكن لصق `image_url` مباشرة |
| عروض Flash | مسار منفصل أو مدمج في campaigns | **غير مدمج** في شاشة الأدمن الحالية |

**قاعدة ذهبية:** أي سجل تنشئه من `/admin/banners` أو `/admin/campaigns` **لازم** يظهر تلقائياً في endpoints العميل (`/banners`, `/campaigns/active`) لو `is_active` / `status=active` والتاريخ ضمن المدة.

---

## 2. ما الأدمن يبعته بالظبط (عقد الـ API من الكود)

### 2.1 إنشاء/تعديل بانر — `POST` / `PUT /admin/banners[/:id]`

```json
{
  "title": "خصم 50%",
  "description": "على أول طلب",
  "banner_type": "platform_offer",
  "image_url": "https://....jpg",
  "action_url": "souq://promo/first-order",
  "restaurant_id": "uuid-or-omit",
  "priority": 10,
  "user_segment": "all",
  "is_active": true,
  "start_date": "2026-05-19T00:00:00.000Z",
  "end_date": "2026-06-19T00:00:00.000Z"
}
```

| الحقل | مطلوب | ملاحظة للباك |
|--------|--------|----------------|
| `title` | نعم | |
| `image_url` | نعم | HTTPS عام؛ أو URL بعد R2 |
| `banner_type` | نعم | `restaurant_promo` \| `platform_offer` \| `campaign` \| `custom` |
| `user_segment` | نعم | `new_user` \| `loyal_user` \| `all` |
| `is_active` | نعم | |
| `start_date` / `end_date` | نعم | ISO8601 (الأدمن يحوّل من `type=date`) |
| `priority` | نعم | رقم — الأعلى يظهر أولاً في العميل |
| `restaurant_id` | عند `restaurant_promo` | UUID مطعم موجود |
| `action_url` | لا | deep link عند الضغط |

**قائمة الأدمن:** `GET /admin/banners?is_active=true&banner_type=platform_offer`

**استجابة متوقعة للقائمة:**

```json
{
  "banners": [ { "...": "نفس الحقول أعلاه + id, created_at" } ]
}
```

أو مصفوفة مباشرة `[]` — الأدمن يدعم الاثنين.

---

### 2.2 إنشاء/تعديل حملة — `POST` / `PUT /admin/campaigns[/:id]`

```json
{
  "name": "عرض رمضان",
  "description": "خصومات الشهر",
  "status": "active",
  "start_date": "2026-05-01",
  "end_date": "2026-06-01",
  "user_segment": "all",
  "restaurant_id": "uuid-or-omit",
  "banner_id": "uuid-or-omit",
  "coupon_id": "uuid-or-omit",
  "loyalty_bonus_points": 50,
  "loyalty_multiplier": 1.5,
  "notification_title": "عرض جديد",
  "notification_body": "افتح التطبيق الآن"
}
```

| الحقل | مطلوب | ملاحظة للباك |
|--------|--------|----------------|
| `name` | نعم | |
| `status` | نعم | `active` \| `inactive` \| `expired` |
| `start_date` / `end_date` | نعم | `YYYY-MM-DD` (الأدمن يبعت تاريخ فقط) |
| `user_segment` | نعم | نفس قيم البانر |
| `coupon_id` | لا | UUID كوبون من `/admin/coupons` |
| `banner_id` | لا | UUID بانر من `/admin/banners` |
| `restaurant_id` | لا | حملة مرتبطة بمتجر |
| `loyalty_*` | لا | لو نظام الولاء مفعّل |
| `notification_title/body` | لا | لاستخدام `send-notification` |

**قائمة الأدمن:** `GET /admin/campaigns?status=active`

**استجابة متوقعة:**

```json
{
  "campaigns": [ {
    "id": "uuid",
    "name": "...",
    "notification_sent": false,
    "created_at": "ISO8601",
    "...": "باقي الحقول"
  } ]
}
```

**إرسال إشعار (على السيرفر الحالي):**

| Method | Path | الحالة |
|--------|------|--------|
| POST | `/admin/campaigns/:id/notify` | ✅ يعمل (200) — **استخدم هذا** |
| POST | `/admin/campaigns/:id/send-notification` | ❌ 404 — غير موجود |

- Body: فارغ.  
- المتوقع: FCM حسب `user_segment` + `notification_sent: true` + **`data`** في FCM (`type`, `campaign_id`) — انظر `CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md`.  
- الأدمن يجرّب `/notify` أولاً ثم يعطّل الزر إن `notification_sent === true`.

**لا يوجد في الأدمن:** `DELETE /admin/campaigns/:id` — الحذف غير مطلوب في الواجهة حالياً.

---

### 2.3 رفع صورة البانر — `POST /uploads/presigned-url`

```json
{
  "uploadType": "banner",
  "filename": "promo.jpg",
  "contentType": "image/jpeg"
}
```

> **ملاحظة:** الباك لا يقبل `folder` — الحقول المطلوبة **camelCase:** `uploadType`، `contentType` (مثلاً `banner`، `restaurant`، `menu_item`).

**استجابة متوقعة:**

```json
{
  "upload_url": "https://...",
  "public_url": "https://..."
}
```

أو `uploadUrl` / `publicUrl` (camelCase) — الأدمن يقرأ الاثنين.

ثم: `PUT` على `upload_url` بالملف، وحفظ `public_url` في `image_url` للبانر.

---

## 3. ما تطبيق العميل (Flutter) يحتاجه — منفصل عن الأدمن

| Method | Path | الوظيفة | شروط الظهور (منطق الباك) |
|--------|------|---------|---------------------------|
| GET | `/banners` | كاروسيل الرئيسية | `is_active=true` + الآن بين `start_date` و `end_date` + فلتر `user_segment` |
| POST | `/banners/click` | تتبع نقرة | `banner_id` في body |
| GET | `/campaigns/active` | حملات نشطة | `status=active` + ضمن التاريخ + segment |
| GET | `/campaigns/flash-offers` | عروض فلاش | حسب تصميم الباك (قد = campaigns بخصائص flash) |

**الأدمن لا يستدعي هذه المسارات** — لكن **بدونها العميل لن يرى ما أنشأته**.

---

## 4. جدول الحالة: عامل إيه؟ ناقص إيه؟

> **آخر تحديث عمود الاختبار:** مايو 2026 — جزء من الأدمن على Render؛ الباقي على فريق الباك.

### 4.1 مسارات الأدمن

| # | Endpoint | مطلوب لـ | حالة الوثائق | تم الاختبار؟ |
|---|----------|----------|---------------|--------------|
| 1 | `GET /admin/banners` | قائمة الأدمن | P1 | ☑ (200 من الأدمن) |
| 2 | `POST /admin/banners` | إضافة بانر | P1 | ☐ (يحتاج تأكيد الباك) |
| 3 | `PUT /admin/banners/:id` | تعديل | P1 | ☐ |
| 4 | `DELETE /admin/banners/:id` | حذف | P1 | ☐ |
| 5 | `GET /admin/campaigns` | قائمة الحملات | P1 | ☑ (200) |
| 6 | `POST /admin/campaigns` | إنشاء حملة | P1 | ☑ (بعد ضبط التواريخ) |
| 7 | `PUT /admin/campaigns/:id` | تعديل | P1 | ☑ (200) |
| 8 | `POST /admin/campaigns/:id/notify` | Push | P1 — **المسار الحقيقي** | ☑ (200 + إشعار وصل) |
| 8b | `POST .../send-notification` | alias مقترح | موثّق فقط | ✗ 404 |
| 9 | `POST /uploads/presigned-url` | رفع صورة بانر | Handoff §4.13 | ⚠️ presigned نعم؛ PUT R2 CORS لا |

### 4.2 مسارات العميل (ضرورية للأبلكيشن)

| # | Endpoint | مطلوب لـ | حالة الوثائق | تم الاختبار؟ |
|---|----------|----------|---------------|--------------|
| 10 | `GET /banners` | شاشة العميل | `ADMIN_APP_COMPLETE_HANDOFF.md` §4.8 | ☐ |
| 11 | `POST /banners/click` | Analytics | نفسه | ☐ |
| 12 | `GET /campaigns/active` | عروض/حملات | نفسه | ☐ |
| 13 | `GET /campaigns/flash-offers` | Flash (إن مستخدم في Flutter) | نفسه — قد يكون alias | ☐ |

### 4.3 اختياري / مرحلة لاحقة

| # | Endpoint | ملاحظة |
|---|----------|--------|
| 14 | `GET/POST/PUT /admin/flash-offers` | بديل لـ campaigns؛ الأدمن الحالي لا يستخدمه |
| 15 | `DELETE /admin/campaigns/:id` | غير مستخدم في الواجهة |

---

## 5. منطق الباك إند المطلوب (Business rules)

### البانرات
1. عند `GET /banners` (عميل): فقط النشطة ضمن التاريخ، مرتبة بـ `priority` تنازلياً.
2. فلتر `user_segment`: عميل جديد يرى `new_user` + `all`؛ مخلص يرى `loyal_user` + `all`.
3. `restaurant_promo`: التحقق من وجود `restaurant_id`.
4. `action_url`: يُرجع للعميل كما هو (deep link).

### الحملات
1. `GET /campaigns/active`: `status=active` + `start_date <= today <= end_date`.
2. لو `coupon_id` مربوط: الكوبون يظل صالحاً في `/coupons/validate` (منطق الكوبونات منفصل).
3. `POST .../notify`: مرة واحدة أو idempotent — الأدمن يفترض `notification_sent` بعد النجاح؛ يضمّن FCM `data` للتوجيه عند الضغط (انظر `CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md`).
4. ربط `banner_id`: اختياري — العميل قد يعرض البانر من `/banners` والحملة من `/campaigns/active` بشكل منفصل.

### مزامنة admin → customer
```
POST /admin/banners  ──►  يُخزَّن في DB  ──►  GET /banners (عميل)
POST /admin/campaigns ──►  يُخزَّن في DB  ──►  GET /campaigns/active (عميل)
```
**Checklist المشروع (غير منفّذ في الريبو):**  
`- [ ] CRUD بانر يظهر في GET /banners` — في `BACKEND_REQUIREMENTS_FOR_ADMIN.md`

---

## 6. أخطاء شائعة — الباك لازم يتجنبها

| المشكلة | الأعراض في الأدمن/العميل |
|---------|---------------------------|
| 404 على `/admin/banners` | قائمة فاضية أو خطأ عند الحفظ |
| 401 بدون دور admin | فشل كل الطلبات |
| حقول camelCase فقط بدون snake_case | حقول فاضية في الجدول (الأدمن يقرأ الاثنين جزئياً) |
| البانر محفوظ لكن `GET /banners` فاضي | الأدمن يظهر، العميل لا |
| `is_active=false` أو خارج التاريخ | طبيعي ألا يظهر للعميل |
| presigned URL بدون CORS/صلاحيات R2 | رفع الصورة يفشل — استخدم رابط صورة مباشر مؤقتاً |

---

## 7. خطوات اختبار (انسخها للباك أو Postman)

استبدل `TOKEN` بـ JWT أدمن.

```http
### 1) قائمة بانرات
GET /servy/api/v1/admin/banners
Authorization: Bearer TOKEN

### 2) إنشاء بانر
POST /servy/api/v1/admin/banners
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "title": "اختبار بانر",
  "description": "من الأدمن",
  "banner_type": "platform_offer",
  "image_url": "https://picsum.photos/800/300",
  "priority": 99,
  "user_segment": "all",
  "is_active": true,
  "start_date": "2026-01-01T00:00:00Z",
  "end_date": "2027-12-31T00:00:00Z"
}

### 3) هل ظهر للعميل؟
GET /servy/api/v1/banners
Authorization: Bearer <token عميل أو عام حسب الباك>

### 4) إنشاء حملة
POST /servy/api/v1/admin/campaigns
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "حملة اختبار",
  "description": "اختبار",
  "status": "active",
  "start_date": "2026-01-01",
  "end_date": "2027-12-31",
  "user_segment": "all"
}

### 5) حملات نشطة للعميل
GET /servy/api/v1/campaigns/active

### 6) إشعار حملة (المسار الشغال على Render)
POST /servy/api/v1/admin/campaigns/{id}/notify
Authorization: Bearer TOKEN

### 6b) (اختياري) alias — غير موجود حالياً
POST /servy/api/v1/admin/campaigns/{id}/send-notification
```

---

## 8. محتاج منك (صاحب المنتج) — مش من الباك

| البند | |
|--------|--|
| كوبون جاهز | قبل ربط `coupon_id` في حملة — من شاشة الكوبونات |
| بانر جاهز | قبل ربط `banner_id` — من شاشة البانرات |
| صور | رفع من الأدمن **أو** رابط HTTPS جاهز |
| Env | `REACT_APP_USE_MOCK_API=false` على Vercel |

---

## 9. محتاج من الباك — قائمة تسليم (Definition of Done)

- [x] مسارات الحملات الأساسية في الأدمن (GET/POST/PUT) — **مؤكد من الأدمن**
- [x] `POST .../notify` يرسل FCM — **مؤكد** (وصول الإشعار للعميل)
- [ ] كل مسارات §4.1 الباقية (بانر CRUD كامل، DELETE، إلخ)
- [ ] **`POST` بانر ثم `GET /banners` (عميل) يعيد نفس البانر** ← أهم فجوة
- [ ] **`POST` حملة `active` ثم `GET /campaigns/active` يعيدها** ← أهم فجوة
- [ ] بعد `/notify`: `notification_sent: true` في `GET /admin/campaigns`
- [ ] FCM `data`: `type=campaign` (lowercase, canonical), `campaign_id`, واختياري `restaurant_id` / `coupon_id`
- [ ] `POST /uploads/presigned-url` + **CORS على R2** للرفع من المتصفح (أو توثيق رسمي: URL فقط)
- [ ] فلترة `user_segment` و `priority` على `/banners` للعميل
- [ ] توثيق: هل `flash-offers` منفصل أم جزء من `campaigns`
- [ ] (اختياري) alias `send-notification` → `notify` لتطابق الوثائق القديمة

---

## 10. مراجع داخل الريبو

| ملف | محتوى |
|-----|--------|
| `BACKEND_API_REQUIREMENTS.md` §9–10 | عقود JSON كاملة |
| `BACKEND_REQUIREMENTS_FOR_ADMIN.md` §4.1–4.3 | P1 + checklist |
| `ADMIN_APP_COMPLETE_HANDOFF.md` §4.8, §5.5 | مسارات العميل + الأدمن |
| `web/src/services/api/banners.ts` | ما يستدعيه الأدمن فعلياً |
| `web/src/services/api/campaigns.ts` | ما يستدعيه الأدمن فعلياً |
| `web/src/pages/Banners/BannersList.tsx` | واجهة CRUD بانر |
| `web/src/pages/Campaigns/CampaignsList.tsx` | واجهة CRUD حملة |
| `CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md` | شرح الحملة + ضغط الإشعار + payload FCM للباك/Flutter |
| `BACKEND_REPLY_TO_STATUS_REPORT_AR.md` | رد جاهز على تقرير الباك (ملخص + خطوات تالية) |

---

*آخر تحديث: مايو 2026 — §0 يعكس اختبار الأدmin على Render؛ الباك يكمّل round-trip العميل و§9.*
