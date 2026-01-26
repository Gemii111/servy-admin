# 🚀 Production Setup Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إعداد المشروع للـ Production مع جميع الميزات المطلوبة.

---

## 1. Environment Variables

### إنشاء ملفات Environment

قم بإنشاء الملفات التالية في مجلد `web/`:

#### `.env.development`
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

#### `.env.production`
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

### ملاحظات مهمة:

1. **REACT_APP_API_BASE_URL**: يجب أن يكون URL الـ API الخاص بك
2. **REACT_APP_SENTRY_DSN**: احصل عليه من [Sentry Dashboard](https://sentry.io)
3. **REACT_APP_USE_MOCK_API**: 
   - `true` في Development (يستخدم Mock APIs)
   - `false` في Production (يستخدم Real APIs)

### إضافة Environment Variables في Vercel

1. اذهب إلى Vercel Dashboard
2. اختر المشروع
3. Settings → Environment Variables
4. أضف جميع المتغيرات من `.env.production`

---

## 2. Axios Configuration

### ✅ ما تم إنجازه

- ✅ إنشاء Axios instance مع base URL من environment variables
- ✅ Request Interceptor لإضافة Authorization token
- ✅ Response Interceptor لمعالجة الأخطاء
- ✅ معالجة 401 (Unauthorized) - إعادة توجيه للـ login
- ✅ معالجة 403 (Forbidden)
- ✅ معالجة Network Errors
- ✅ Logging في Development mode

### استخدام Axios في API Services

```typescript
import { apiClient } from '../services/api/client';

// GET request
const response = await apiClient.get('/users');

// POST request
const response = await apiClient.post('/users', userData);

// PUT request
const response = await apiClient.put(`/users/${id}`, userData);

// DELETE request
const response = await apiClient.delete(`/users/${id}`);
```

### الانتقال من Mock APIs إلى Real APIs

1. في ملف API service (مثل `users.ts`):
```typescript
import { shouldUseMock } from './base';
import { apiClient } from './client';

export async function getUsers(params?: {...}): Promise<UsersResponse> {
  if (shouldUseMock()) {
    // Use mock data
    return mockGetUsers(params);
  }
  
  // Use real API
  const response = await apiClient.get<UsersResponse>('/users', { params });
  return response.data;
}
```

---

## 3. Code Splitting (Lazy Loading)

### ✅ ما تم إنجازه

- ✅ تحويل جميع الصفحات إلى Lazy Loading
- ✅ استخدام `React.lazy()` و `Suspense`
- ✅ إنشاء `LoadingFallback` component
- ✅ تحسين Performance عبر تقليل Bundle Size

### النتيجة:

- **Initial Bundle Size**: أصغر بكثير
- **Load Time**: أسرع
- **User Experience**: أفضل (تحميل تدريجي)

### كيفية إضافة صفحة جديدة:

```typescript
// في App.tsx
const NewPage = lazy(() => import('./pages/NewPage'));

// في Routes
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <NewPage />
        </Suspense>
      </Layout>
    </ProtectedRoute>
  }
/>
```

---

## 4. Sentry Error Tracking

### ✅ ما تم إنجازه

- ✅ تثبيت `@sentry/react` و `@sentry/tracing`
- ✅ إعداد Sentry Configuration
- ✅ Performance Monitoring (tracesSampleRate)
- ✅ Error Filtering
- ✅ User Context Tracking
- ⚠️ Session Replay (يمكن إضافتها لاحقاً إذا لزم الأمر)

### إعداد Sentry:

1. **إنشاء حساب في Sentry**:
   - اذهب إلى [sentry.io](https://sentry.io)
   - أنشئ حساب جديد
   - أنشئ مشروع جديد (React)

2. **الحصول على DSN**:
   - من Sentry Dashboard
   - Settings → Client Keys (DSN)
   - انسخ DSN

3. **إضافة DSN إلى Environment Variables**:
   ```env
   REACT_APP_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   REACT_APP_ENABLE_SENTRY=true
   ```

4. **إعداد User Context**:
   - يتم تلقائياً عند Login
   - يتم مسحه عند Logout

### استخدام Sentry يدوياً:

```typescript
import { captureException, captureMessage } from '../config/sentry';

// Capture exception
try {
  // some code
} catch (error) {
  captureException(error as Error, { context: 'additional info' });
}

// Capture message
captureMessage('Something important happened', 'info');
```

---

## 5. Error Boundary

### ✅ ما تم إنجازه

- ✅ إنشاء `ErrorBoundary` component
- ✅ Catch JavaScript errors في component tree
- ✅ Display fallback UI بدلاً من crash
- ✅ Send errors إلى Sentry
- ✅ Show error details في Development mode
- ✅ Reset functionality
- ✅ Integration في `index.tsx`

### الملفات:
- `src/components/common/ErrorBoundary.tsx` - Error Boundary component
- `src/utils/errorHandler.ts` - Error handling utilities

---

## 6. Build & Deployment

### Build للـ Production:

```bash
cd web
npm run build
```

### التحقق من Build:

```bash
# Check build size
ls -lh build/static/js/

# Test production build locally
npx serve -s build
```

### Deployment على Vercel:

1. **Push إلى GitHub**
2. **Connect Vercel**:
   - Import project from GitHub
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **إضافة Environment Variables**:
   - من Vercel Dashboard
   - Settings → Environment Variables
   - أضف جميع المتغيرات من `.env.production`

4. **Deploy**

---

## 7. Performance Optimization Checklist

### ✅ مكتمل:
- [x] Code Splitting (Lazy Loading)
- [x] Environment Variables
- [x] Axios Configuration
- [x] Error Tracking (Sentry)

### ⏳ اختياري (لاحقاً):
- [ ] Image Optimization
- [ ] Bundle Analysis
- [ ] Service Worker (PWA)
- [ ] CDN Configuration
- [ ] Caching Strategy

---

## 8. Security Checklist

### ✅ مكتمل:
- [x] Environment Variables (لا توجد secrets في الكود)
- [x] Axios Interceptors (إزالة Authorization headers من Sentry)
- [x] Error Filtering (إزالة معلومات حساسة)

### ⏳ إضافي:
- [ ] HTTPS Only
- [ ] Content Security Policy (CSP)
- [ ] Rate Limiting
- [ ] API Key Rotation

---

## 9. Monitoring & Analytics

### ✅ مكتمل:
- [x] Sentry Error Tracking
- [x] Sentry Performance Monitoring
- [x] Sentry Session Replay

### ⏳ إضافي:
- [ ] Google Analytics
- [ ] Custom Analytics
- [ ] User Behavior Tracking

---

## 10. Troubleshooting

### مشكلة: Environment Variables لا تعمل

**الحل:**
1. تأكد من أن المتغيرات تبدأ بـ `REACT_APP_`
2. أعد تشغيل Development Server
3. في Production، تأكد من إضافتها في Vercel

### مشكلة: Axios لا يرسل Authorization Token

**الحل:**
1. تأكد من أن Token موجود في localStorage
2. تحقق من Request Interceptor
3. تأكد من أن Token صحيح

### مشكلة: Sentry لا يعمل

**الحل:**
1. تأكد من إضافة DSN في Environment Variables
2. تأكد من `REACT_APP_ENABLE_SENTRY=true`
3. تحقق من Console للأخطاء

### مشكلة: Code Splitting لا يعمل

**الحل:**
1. تأكد من استخدام `React.lazy()`
2. تأكد من وجود `Suspense` wrapper
3. تحقق من Network tab في DevTools

---

## 11. Next Steps

1. **Backend Integration**:
   - استبدال Mock APIs بـ Real APIs
   - اختبار جميع Endpoints

2. **Testing**:
   - Unit Tests
   - Integration Tests
   - E2E Tests

3. **Performance**:
   - Bundle Analysis
   - Lighthouse Audit
   - Performance Monitoring

4. **Security**:
   - Security Audit
   - Penetration Testing
   - Compliance Check

---

## 📝 ملاحظات

- جميع الملفات الجديدة موجودة في:
  - `src/config/env.ts` - Environment Variables
  - `src/config/sentry.ts` - Sentry Configuration
  - `src/services/api/client.ts` - Axios Client
  - `src/services/api/base.ts` - Base API Service
  - `src/components/common/LoadingFallback.tsx` - Loading Component
  - `src/components/common/ErrorBoundary.tsx` - Error Boundary Component
  - `src/utils/errorHandler.ts` - Error Handling Utilities

- جميع الصفحات تم تحويلها إلى Lazy Loading في `App.tsx`

- Sentry يتم تهيئته في `index.tsx` قبل أي شيء آخر

---

**آخر تحديث:** 2024-01-15  
**الإصدار:** 1.4.0

