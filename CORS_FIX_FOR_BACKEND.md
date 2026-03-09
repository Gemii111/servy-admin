# حل مشكلة CORS

## ✅ الحل من الفرونت إند (تم تنفيذه)
تم إضافة **Vercel Proxy** في `web/api/proxy/` لتجاوز CORS. الطلبات تمر عبر نفس الدومين فلا يحدث CORS.

### إعدادات Vercel المطلوبة:
في مشروع Vercel → Settings → Environment Variables أضف:

| المتغير | القيمة | البيئة |
|---------|--------|--------|
| `REACT_APP_API_BASE_URL` | `/api/proxy` | Production |
| `REACT_APP_USE_MOCK_API` | `false` | Production |
| `BACKEND_URL` | `https://talabat-ehpd.onrender.com` | Production (اختياري) |

بعد إضافة المتغيرات، أعد النشر (Redeploy).

---

## المشكلة الأصلية
لوحة الإدارة على `https://www.souqegy.net` لا تستطيع الاتصال بالـ API على `https://talabat-ehpd.onrender.com` بسبب **CORS**.

الرسالة في المتصفح:
```
Access to XMLHttpRequest at 'https://talabat-ehpd.onrender.com/servy/api/v1/admin/auth/login' 
from origin 'https://www.souqegy.net' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## الحل (يجب تنفيذه في الباك إند)

يجب إضافة الـ origins التالية في إعدادات CORS في الباك إند:

| البيئة | Origin المطلوب |
|--------|----------------|
| **إنتاج** | `https://www.souqegy.net` |
| **إنتاج (بدون www)** | `https://souqegy.net` |
| **تطوير محلي** | `http://localhost:3000` |

## مثال (Node.js/Express)
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://www.souqegy.net',
    'https://souqegy.net',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

## أو للسماح بكل الطلبات (أقل أماناً)
```javascript
app.use(cors({ origin: '*' }));
```

---

**ملاحظة:** لا يمكن حل CORS من الفرونت إند. الخادم (الباك إند) هو المسؤول عن إرسال هيدر `Access-Control-Allow-Origin`.
