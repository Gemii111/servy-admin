# تنفيذ عقد إشعارات الحملات — حالة التنفيذ

> **مرجع الباك:** `campaign-notification-tap-flutter.md` (2026-05-19)

---

## أين يُنفَّذ ماذا؟

| الجزء | المشروع | الحالة |
|--------|---------|--------|
| إرسال FCM + payload + topics | **الباك إند** (Go) | ✅ موثّق — `/notify` يعمل |
| ضغط الإشعار والتوجيه | **تطبيق Flutter (العميل)** | ☐ **مطلوب من فريق Flutter** — لا يوجد كود Flutter في ريبو الأدمن |
| لوحة الأدمن (CRUD + زر إرسال) | **هذا الريبو** `servy-admin-main` | ✅ محدَّث ليطابق العقد |

---

## ما تم في الأدمن (هذا الريبو) ✅

1. **`web/src/services/api/campaigns.ts`**
   - مواضيع FCM الرسمية: `campaigns_all` | `campaigns_new_user` | `campaigns_loyal_user`
   - `buildCampaignNotificationData()` — نفس حقول الباك: `type`, `campaign_id`, + اختياري `coupon_id`, `restaurant_id`, `banner_id`
   - مسار `/notify` أولاً؛ fallback `send-bulk` يستخدم topic + data الصحيحين

2. **`web/src/pages/Campaigns/CampaignsList.tsx`**
   - تنبيه في نموذج الحملة يوضح الـ topic والتوجيه المتوقع عند الضغط

3. **التوثيق**
   - `campaign-notification-tap-flutter.md` — العقد الكامل من الباك (إنجليزي)
   - `CAMPAIGN_AND_NOTIFICATION_FLOW_AR.md` — شرح عربي + canonical `type=campaign`

---

## ما يجب على فريق Flutter تنفيذه ☐

انسخ لهم الملف: **`campaign-notification-tap-flutter.md`**

| # | المهمة |
|---|--------|
| 1 | `POST /notifications/register-token` بعد الدخول + `onTokenRefresh` |
| 2 | الاشتراك في topics: `campaigns_all` (+ `_new_user` / `_loyal_user` حسب المستخدم) |
| 3 | `handleNotificationTap`: إذا `data['type'] == 'campaign'` ثم أولوية: coupon → restaurant → banner → تفاصيل حملة |
| 4 | تسجيل المعالج في: `onMessage` / `onMessageOpenedApp` / `getInitialMessage` |
| 5 | استخدام **`data`** للتوجيه (ليس `notification` فقط) — خاصة Android في الخلفية |

---

## سطر واحد لـ Flutter

```
FCM data.type for campaign push: "campaign" (lowercase). Topics: campaigns_all | campaigns_new_user | campaigns_loyal_user. Tap routing: coupon_id → restaurant_id → banner_id → campaign details. See campaign-notification-tap-flutter.md.
```

---

## اختبار من الأدمن

1. حملة `active` + عنوان/نص إشعار + (اختياري) ربط كوبون/مطعم/بانر
2. زر **إرسال** → `POST .../notify` → 200
3. على جهاز عميل مشترك في الـ topic المناسب: يظهر الإشعار
4. بعد تنفيذ Flutter: الضغط يوجّه حسب الأولوية أعلاه

---

*آخر تحديث: مايو 2026*
