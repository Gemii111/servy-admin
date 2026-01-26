# 🔧 Environment Variables Setup

## 📋 نظرة عامة

هذا الملف يشرح كيفية إعداد Environment Variables للمشروع.

---

## 📁 ملفات Environment

### 1. `.env.example`
هذا الملف يحتوي على مثال لجميع Environment Variables المطلوبة. **لا تقم بتعديله.**

### 2. `.env.development`
هذا الملف يستخدم في Development mode. قم بإنشائه في مجلد `web/`:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
REACT_APP_SENTRY_DSN=
REACT_APP_SENTRY_ENVIRONMENT=development
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_SENTRY=false
REACT_APP_USE_MOCK_API=true
```

### 3. `.env.production`
هذا الملف يستخدم في Production mode. قم بإنشائه في مجلد `web/`:

```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=production
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
REACT_APP_SENTRY_ENVIRONMENT=production
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_SENTRY=true
REACT_APP_USE_MOCK_API=false
```

---

## 🔑 Environment Variables

### API Configuration

#### `REACT_APP_API_BASE_URL`
- **الوصف**: Base URL للـ API
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.yourdomain.com/api`
- **مطلوب**: ✅ نعم

#### `REACT_APP_API_TIMEOUT`
- **الوصف**: Timeout للـ API requests (بالميلي ثانية)
- **القيمة الافتراضية**: `30000` (30 ثانية)
- **مطلوب**: ❌ لا

---

### Environment

#### `REACT_APP_ENV`
- **الوصف**: بيئة التشغيل
- **القيم**: `development` | `production` | `test`
- **مطلوب**: ❌ لا (يستخدم `NODE_ENV` تلقائياً)

---

### Sentry Configuration

#### `REACT_APP_SENTRY_DSN`
- **الوصف**: Sentry DSN للـ Error Tracking
- **كيفية الحصول عليه**:
  1. اذهب إلى [sentry.io](https://sentry.io)
  2. أنشئ مشروع جديد (React)
  3. انسخ DSN من Settings → Client Keys
- **مطلوب**: ❌ لا (فقط إذا كنت تريد استخدام Sentry)

#### `REACT_APP_SENTRY_ENVIRONMENT`
- **الوصف**: بيئة Sentry
- **القيم**: `development` | `production` | `staging`
- **مطلوب**: ❌ لا

#### `REACT_APP_ENABLE_SENTRY`
- **الوصف**: تفعيل/تعطيل Sentry
- **القيم**: `true` | `false`
- **Development**: `false`
- **Production**: `true`
- **مطلوب**: ❌ لا

---

### Feature Flags

#### `REACT_APP_ENABLE_ANALYTICS`
- **الوصف**: تفعيل/تعطيل Analytics
- **القيم**: `true` | `false`
- **Development**: `false`
- **Production**: `true`
- **مطلوب**: ❌ لا

#### `REACT_APP_USE_MOCK_API`
- **الوصف**: استخدام Mock APIs بدلاً من Real APIs
- **القيم**: `true` | `false`
- **Development**: `true` (يستخدم Mock APIs)
- **Production**: `false` (يستخدم Real APIs)
- **مطلوب**: ❌ لا

---

## 🚀 كيفية الإعداد

### 1. Development

1. أنشئ ملف `.env.development` في مجلد `web/`
2. انسخ المحتوى من `.env.example` وعدله
3. أعد تشغيل Development Server:
   ```bash
   npm start
   ```

### 2. Production

#### على Vercel:

1. اذهب إلى Vercel Dashboard
2. اختر المشروع
3. Settings → Environment Variables
4. أضف جميع المتغيرات من `.env.production`
5. Redeploy

#### محلياً:

1. أنشئ ملف `.env.production` في مجلد `web/`
2. انسخ المحتوى من `.env.example` وعدله
3. Build:
   ```bash
   npm run build
   ```

---

## ⚠️ ملاحظات مهمة

1. **جميع Environment Variables يجب أن تبدأ بـ `REACT_APP_`**
   - هذا مطلوب من Create React App
   - بدون هذا البادئة، لن تكون المتغيرات متاحة في الكود

2. **لا تضع ملفات `.env` في Git**
   - `.env` و `.env.local` و `.env.production.local` موجودة في `.gitignore`
   - `.env.example` فقط يجب أن يكون في Git

3. **أعد تشغيل Server بعد تغيير Environment Variables**
   - Create React App لا يقرأ Environment Variables ديناميكياً
   - يجب إعادة تشغيل Development Server

4. **في Production، استخدم Vercel Environment Variables**
   - لا تضع `.env.production` في Git
   - استخدم Vercel Dashboard لإضافة Environment Variables

---

## 🔍 التحقق من Environment Variables

### في الكود:

```typescript
import { env } from './config/env';

console.log(env.apiBaseUrl);
console.log(env.environment);
console.log(env.enableSentry);
```

### في Console:

```javascript
// في Browser Console
console.log(process.env.REACT_APP_API_BASE_URL);
```

---

## 📝 مثال كامل

### `.env.development`
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
REACT_APP_SENTRY_DSN=
REACT_APP_SENTRY_ENVIRONMENT=development
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_SENTRY=false
REACT_APP_USE_MOCK_API=true
```

### `.env.production`
```env
REACT_APP_API_BASE_URL=https://api.servy.com/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=production
REACT_APP_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
REACT_APP_SENTRY_ENVIRONMENT=production
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_SENTRY=true
REACT_APP_USE_MOCK_API=false
```

---

**آخر تحديث:** 2024-01-15

