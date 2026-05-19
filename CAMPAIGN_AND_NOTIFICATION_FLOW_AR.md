# شرح دورة الحملات والإشعارات — للباك إند وفريق التطبيق

> **الغرض:** توضيح مفهوم **الحملة (Campaign)**، علاقتها بالبانر والكوبون والإشعار، وما المفترض أن يحدث عند العميل عند **الضغط على الإشعار**.  
> **الجمهور:** فريق الباك إند + مطور تطبيق العميل (Flutter).  
> **الأدمن:** يستخدم `POST /admin/campaigns/:id/notify` (يعمل 200 على السيرفر الحالي). المسار `send-notification` غير موجود (404).

---

## للفريق Flutter — سطر واحد (انسخه كما هو)

```
FCM data.type for campaign push (POST /admin/campaigns/:id/notify): canonical value is "campaign" (lowercase). Compare case-insensitively; do not rely on "CAMPAIGN".
```

**بالعربي:** عند فتح الإشعار، الباك يبعت `data.type = "campaign"` (حروف صغيرة). لا تعتمدوا على `CAMPAIGN`. قارنوا بـ `toLowerCase() == 'campaign'` واقرأوا `campaign_id` للتوجيه.

التفاصيل: **§3.2** في هذا الملف.

**العقد الكامل من الباك (ضغط الإشعار + topics + checklist):** [`campaign-notification-tap-flutter.md`](./campaign-notification-tap-flutter.md)

**حالة التنفيذ في الريبو:** [`CAMPAIGN_NOTIFICATION_IMPLEMENTATION_AR.md`](./CAMPAIGN_NOTIFICATION_IMPLEMENTATION_AR.md)

---

## 1. ما هي الحملة؟ (تعريف بسيط)

**الحملة** ليست صورة ولا إشعاراً بمفردها. هي **سجل تسويقي في قاعدة البيانات** يجمع معاً:

| الحقل / المفهوم | المعنى |
|-----------------|--------|
| الاسم والوصف | مثال: «عرض رمضان» |
| `start_date` / `end_date` | فترة سريان العرض |
| `status` | `draft` \| `active` \| `inactive` \| `expired` — العميل يرى الحملة فقط إذا كانت **نشطة** وضمن التاريخ |
| `user_segment` | `all` \| `new_user` \| `loyal_user` — من يستحق رؤية العرض |
| `restaurant_id` | (اختياري) حملة مرتبطة بمطعم معيّن |
| `banner_id` | (اختياري) ربط ببانر يظهر في الصفحة الرئيسية |
| `coupon_id` | (اختياري) ربط بكوبون يُستخدم عند الطلب |
| `loyalty_bonus_points` / `loyalty_multiplier` | (اختياري) مكافآت ولاء |
| `notification_title` / `notification_body` | نص الإشعار عند الإرسال |

**تشبيه:** الحملة = **حزمة عرض** في الداتابيز. الإشعار والبانر والكوبون أدوات مرتبطة بها، وليست الحملة نفسها.

```
┌─────────────────────────────────────────┐
│              حملة (Campaign)             │
│  اسم + تواريخ + جمهور + status=active    │
├─────────────┬─────────────┬─────────────┤
│  بانر       │  كوبون      │  مطعم       │
│  (اختياري)  │  (اختياري)  │  (اختياري)  │
└─────────────┴─────────────┴─────────────┘
         │                    │
         ▼                    ▼
   GET /banners         POST /coupons/validate
   (كاروسيل الهوم)      (عند إتمام الطلب)
```

---

## 2. ثلاث قنوات مستقلة يصل بها العرض للعميل

| القناة | Endpoint / آلية | ماذا يرى العميل؟ |
|--------|------------------|------------------|
| **1. إشعار Push** | `POST /admin/campaigns/:id/notify` | رسالة على الجوال (عنوان + نص) |
| **2. بانر** | `GET /banners` (بعد ربط `banner_id`) | صورة في كاروسيل الصفحة الرئيسية |
| **3. قائمة الحملات** | `GET /campaigns/active` | عروض/حملات داخل التطبيق |

**قاعدة مهمة:** الإشعار **لا يكفي** لظهور الحملة في التطبيق. لظهورها في `GET /campaigns/active` يجب:

- `status = active`
- `start_date <= اليوم <= end_date`
- فلتر `user_segment` يطابق نوع المستخدم

---

## 3. ماذا يحدث عند الضغط على الإشعار؟ (المطلوب من الباك + Flutter)

الضغط على الإشعار **لا يُعرَّف في لوحة الأدmin** — يُحدَّد في:

1. **محتوى FCM** الذي يبنيه الباك عند `POST .../notify`
2. **معالج الإشعارات** في تطبيق Flutter عند فتح التطبيق من الإشعار

### 3.1 التدفق المتوقع (التصميم الموصى به)

```
إشعار على الجوال (FCM)
        │
        ▼  (المستخدم يضغط)
يفتح التطبيق
        │
        ▼
يقرأ data payload من الإشعار
        │
        ▼
يوجّه لشاشة مناسبة، مثلاً:
  • شاشة تفاصيل الحملة / العروض
  • أو صفحة المطعم (إن وُجد restaurant_id)
  • أو تطبيق الكوبون في الطلب (إن وُجد coupon_id)
  • أو الصفحة الرئيسية (إن لم يُحدَّد توجيه)
```

### 3.2 payload FCM — القيمة الرسمية لـ `data.type` (مهم لـ Flutter)

| المصدر | قيمة `data.type` | ملاحظة |
|--------|------------------|--------|
| **الباك إند (canonical)** | `"campaign"` (أحرف صغيرة) | `internal/campaign/service.go` — مسار `POST .../notify` |
| وثائق قديمة في الريبو | `"CAMPAIGN"` | **غير مطابقة للكود الحي** — تم تصحيح التوثيق |
| الأدمن (fallback `send-bulk` فقط) | `"campaign"` | محاذاة مع الباك — `web/src/services/api/campaigns.ts` |

**للفريق Flutter:** اعتمدوا **`campaign`** (lowercase) كقيمة أساسية. يُفضَّل المقارنة **بدون حساسية لحالة الأحرف** (`campaign` / `CAMPAIGN`) حتى لا تنكسر الإشعارات القديمة.

```dart
// مثال مقترح
final t = (data['type'] as String?)?.toLowerCase();
if (t == 'campaign') { /* توجيه حملة */ }
```

### 3.3 payload FCM الكامل (للباك إند)

عند `POST /admin/campaigns/:id/notify` يُفضَّل إرسال **data** (وليس notification فقط):

```json
{
  "notification": {
    "title": "عرض جديد",
    "body": "افتح التطبيق الآن"
  },
  "data": {
    "type": "campaign",
    "campaign_id": "uuid-الحملة",
    "restaurant_id": "uuid-أو-فارغ",
    "coupon_id": "uuid-أو-فارغ",
    "banner_id": "uuid-أو-فارغ"
  }
}
```

| حقل `data` | الاستخدام في Flutter |
|------------|----------------------|
| `type` | **`campaign`** (canonical) — معالج التوجيه |
| `campaign_id` | جلب تفاصيل من `GET /campaigns/active` أو endpoint تفاصيل إن وُجد |
| `restaurant_id` | فتح شاشة المطعم |
| `coupon_id` | فتح شاشة عروض/سلة مع تلميح الكوبون |
| `banner_id` | فتح الهوم أو البانر المرتبط |

> **للباك (اختياري):** توحيد أي وثائق/API spec على `"campaign"` lowercase؛ أو إرجاع الحقلين لفترة انتقالية — الأفضل قيمة واحدة في الكود والوثائق.

### 3.4 أولوية التوجيه عند الضغط (من الباك — 2026-05-19)

```
if type != "campaign"  → ليس إشعار حملة

else if coupon_id     → شاشة السلة/العرض مع تلميح الكوبون
else if restaurant_id → صفحة المطعم
else if banner_id     → الهوم أو deep link من البانر
else                  → تفاصيل الحملة (campaign_id من GET /campaigns/active)
```

الكود الكامل: `campaign-notification-tap-flutter.md` §2.

**مواضيع FCM (يجب اشتراك Flutter بعد الدخول):**

| `user_segment` في الحملة | Topic |
|--------------------------|--------|
| `all` | `campaigns_all` |
| `new_user` | `campaigns_new_user` |
| `loyal_user` | `campaigns_loyal_user` |

### 3.5 إذا لم يُبرمج التوجيه في Flutter

- الضغط يفتح التطبيق على الشاشة الافتراضية (غالباً الهوم) فقط.
- العميل قد يجد العرض عبر البانر (`GET /banners`) أو قائمة الحملات (`GET /campaigns/active`) — **وليس عبر الإشعار مباشرة**.

---

## 4. الفرق بين البانر والحملة والإشعار

| | البانر (Banner) | الحملة (Campaign) | إشعار الحملة |
|---|-----------------|-------------------|--------------|
| **أين يظهر؟** | كاروسيل الصفحة الرئيسية | API `GET /campaigns/active` | شريطة إشعارات الجوال |
| **الشكل** | صورة + عنوان | سجل بيانات (اسم، تواريخ، روابط) | نص قصير (title/body) |
| **عند الضغط** | `action_url` (deep link مثل `souq://promo/...`) | من شاشة العروض داخل التطبيق | يفتح التطبيق حسب `data` في FCM |
| **تطبيق الخصم** | يوجّه المستخدم للمكان المناسب | عبر **الكوبون المربوط** عند الطلب | **لا يطبّق خصماً لوحده** |

**البانر** و**الحملة** يمكن ربطهما (`banner_id` في الحملة) لكنهما يُستهلكان من endpoints مختلفة في التطبيق.

---

## 5. مثال عملي من البداية للنهاية

1. الأدمن ينشئ حملة «خصم 20%» — `status: active`، تواريخ صالحة، `user_segment: all`.
2. يربط كوبون `RAMADAN20` → عند الطلب: `POST /coupons/validate`.
3. يربط بانر → يظهر في `GET /banners` للعميل المناسب.
4. يضغط «إرسال إشعار» → `POST /admin/campaigns/:id/notify` → FCM للمستخدمين حسب الشريحة.

**عند وصول الإشعار للعميل:**

- يرى العنوان والنص على الجوال.

**عند الضغط على الإشعار (المطلوب):**

- التطبيق يفتح ويقرأ `campaign_id` (واختيارياً `restaurant_id` / `coupon_id`).
- يوجّه لشاشة العرض أو المطعم أو الطلب مع الكوبون.

**بدون الضغط على الإشعار:**

- العميل يفتح التطبيق عادياً → يرى البانر في الهوم و/أو الحملة في `GET /campaigns/active` → يطلب ويستخدم الكوبون.

---

## 6. مسؤوليات الباك إند (Checklist)

### 6.1 CRUD وعرض للعميل

| # | المطلوب |
|---|---------|
| 1 | `POST/PUT /admin/campaigns` يخزّن كل الحقول (بما فيها `banner_id`, `coupon_id`, `restaurant_id`, `notification_*`) |
| 2 | `GET /campaigns/active` يرجع فقط: `status=active` + ضمن التاريخ + فلتر `user_segment` |
| 3 | أي حملة/بانر يُنشأ من الأدمن يظهر للعميل تلقائياً عند استيفاء الشروط (لا حاجة لخطوة يدوية إضافية) |

### 6.2 إرسال الإشعار

| # | المطلوب |
|---|---------|
| 4 | `POST /admin/campaigns/:id/notify` يرسل FCM للمستخدمين حسب `user_segment` |
| 5 | يستخدم `notification_title` / `notification_body` من الحملة، أو `name` / `description` كبديل |
| 6 | يضمّن `data` في FCM كما في §3.2 (على الأقل `type` + `campaign_id`) |
| 7 | بعد النجاح: `notification_sent: true` (الأدمن يعطّل زر الإرسال) |
| 8 | (اختياري) توحيد `send-notification` كـ alias لـ `notify` لتجنب 404 |

### 6.3 البانرات والكوبونات

| # | المطلوب |
|---|---------|
| 9 | `GET /banners` — نشطة، ضمن التاريخ، مرتبة بـ `priority` |
| 10 | `action_url` يُرجع للعميل كما هو (deep link عند ضغط البانر) |
| 11 | الكوبون المربوط يبقى صالحاً عبر `POST /coupons/validate` |

---

## 7. مسؤوليات تطبيق العميل (Flutter) — للتنسيق

| # | المطلوب |
|---|---------|
| 1 | تسجيل FCM token: `POST /notifications/register-token` |
| 2 | عند فتح التطبيق من إشعار `type=campaign` (canonical): قراءة `campaign_id` والتوجيه |
| 3 | شاشة تعرض `GET /campaigns/active` |
| 4 | شاشة الهوم تعرض `GET /banners` |
| 5 | عند الطلب: التحقق من الكوبون عبر `POST /coupons/validate` |

---

## 8. مسارات API المرجعية

**Base:** `https://<host>/servy/api/v1`

### أدمن

| Method | Path | الوظيفة |
|--------|------|---------|
| GET | `/admin/campaigns` | قائمة الحملات |
| POST | `/admin/campaigns` | إنشاء |
| PUT | `/admin/campaigns/:id` | تعديل |
| POST | `/admin/campaigns/:id/notify` | إرسال إشعار (**المستخدم فعلياً**) |

### عميل

| Method | Path | الوظيفة |
|--------|------|---------|
| GET | `/campaigns/active` | الحملات النشطة للعرض في التطبيق |
| GET | `/banners` | بانرات الهوم |
| POST | `/banners/click` | تتبع نقرة بانر |
| POST | `/coupons/validate` | التحقق من كوبون مرتبط بالحملة |

---

## 9. خلاصة في جملة واحدة

**الحملة** = عرض منظم في السيرفر (وقت + جمهور + روابط اختيارية). **الإشعار** = دعوة لفتح التطبيق؛ والضغط عليه **يجب** أن يوجّه العميل حسب `campaign_id` (وما يرتبط به) في payload الـ FCM. **البانر** و**الكوبون** قناتان إضافيتان لنفس العرض دون الاعتماد على الإشعار فقط.

---

## 10. ملفات ذات صلة في الريبو

| الملف | المحتوى |
|-------|---------|
| `BACKEND_BANNERS_CAMPAIGNS_STATUS.md` | عقد API، payloads، checklist اختبار |
| `ADMIN_APPLICATION_REQUIREMENTS.md` | §6 البانرات والحملات |
| `web/src/services/api/campaigns.ts` | ما يستدعيه الأدمن (`/notify` أولاً) |

---

*آخر تحديث: مايو 2026 — من واجهة الأدمن Servy Admin*
