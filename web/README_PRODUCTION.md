# 🚀 Servy Admin Panel - Production Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر وإدارة Servy Admin Panel في بيئة Production.

---

## 🏗️ البنية الأساسية

### Tech Stack
- **React 19** + **TypeScript**
- **Material-UI v7** (MUI)
- **TanStack Query v5** (React Query)
- **React Router v7**
- **Axios** للـ API calls
- **Sentry** للـ Error Tracking

### Features
- ✅ Dark Theme UI
- ✅ RTL Support (Arabic)
- ✅ Responsive Design
- ✅ Code Splitting (Lazy Loading)
- ✅ Error Tracking (Sentry)
- ✅ Environment Variables
- ✅ Real API Integration Ready

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd servy-admin/web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
انظر إلى [ENV_SETUP.md](./ENV_SETUP.md) للتفاصيل.

### 4. Development
```bash
npm start
```

### 5. Production Build
```bash
npm run build
```

---

## 📁 Project Structure

```
web/
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/       # Common components (ErrorBoundary, LoadingFallback, etc.)
│   │   ├── layout/       # Layout components (Sidebar, TopBar, Layout)
│   │   └── tables/       # DataTable component
│   ├── config/           # Configuration files
│   │   ├── env.ts        # Environment variables
│   │   └── sentry.ts     # Sentry configuration
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.tsx   # Authentication hook
│   │   └── useSnackbar.tsx # Snackbar hook
│   ├── pages/            # Page components
│   │   ├── Dashboard/
│   │   ├── Users/
│   │   ├── Restaurants/
│   │   ├── Orders/
│   │   ├── Notifications/
│   │   ├── Rewards/
│   │   └── DriverRatings/
│   ├── services/         # API services
│   │   └── api/          # API client and services
│   ├── theme/            # Theme configuration
│   ├── App.tsx            # Main app component
│   └── index.tsx          # Entry point
├── public/               # Static files
├── build/                # Production build (generated)
├── .env.development      # Development environment variables
├── .env.production       # Production environment variables
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

انظر إلى [ENV_SETUP.md](./ENV_SETUP.md) للتفاصيل الكاملة.

**المتغيرات المطلوبة:**
- `REACT_APP_API_BASE_URL` - API Base URL
- `REACT_APP_USE_MOCK_API` - Use Mock APIs (true/false)

**المتغيرات الاختيارية:**
- `REACT_APP_SENTRY_DSN` - Sentry DSN
- `REACT_APP_ENABLE_SENTRY` - Enable Sentry (true/false)
- `REACT_APP_API_TIMEOUT` - API Timeout (default: 30000)

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - اذهب إلى [Vercel Dashboard](https://vercel.com)
   - Import project from GitHub

2. **Configure Project**
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Framework Preset: Create React App

3. **Environment Variables**
   - Settings → Environment Variables
   - أضف جميع المتغيرات من `.env.production`

4. **Deploy**
   - Deploy automatically on push to main branch
   - أو Deploy manually

### Manual Deployment

```bash
# Build
npm run build

# Serve locally (for testing)
npx serve -s build

# Or deploy to your hosting provider
# Upload the 'build' folder to your server
```

---

## 🐛 Error Tracking

### Sentry Setup

1. **Create Sentry Account**
   - اذهب إلى [sentry.io](https://sentry.io)
   - أنشئ حساب جديد
   - أنشئ مشروع جديد (React)

2. **Get DSN**
   - Settings → Client Keys (DSN)
   - انسخ DSN

3. **Add to Environment Variables**
   ```env
   REACT_APP_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   REACT_APP_ENABLE_SENTRY=true
   ```

4. **Verify**
   - Deploy application
   - Trigger an error
   - Check Sentry dashboard

---

## 📊 Performance

### Code Splitting
- جميع الصفحات تستخدم Lazy Loading
- Bundle size محسّن
- Faster initial load time

### Optimization Tips
- Images: Use optimized images
- Bundle: Monitor bundle size
- Caching: Configure CDN caching
- Compression: Enable gzip/brotli

---

## 🔐 Security

### Best Practices
- ✅ Environment Variables (no secrets in code)
- ✅ HTTPS only
- ✅ CORS configured
- ✅ Authentication tokens secure
- ✅ Error messages don't expose sensitive data

### Checklist
- [ ] No API keys in code
- [ ] No secrets in environment variables (public)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Authentication secure

---

## 🧪 Testing

### Development
```bash
npm start
```

### Production Build Test
```bash
npm run build
npx serve -s build
```

### Manual Testing Checklist
- [ ] Login/Logout
- [ ] Navigation
- [ ] All pages load
- [ ] Forms work
- [ ] API calls work
- [ ] Error handling
- [ ] Responsive design

---

## 📝 Documentation

- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Production setup guide
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables guide
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [src/services/api/migration-guide.md](./src/services/api/migration-guide.md) - API migration guide

---

## 🆘 Troubleshooting

### Build Fails
- تحقق من Node.js version (>= 16)
- حذف `node_modules` و `package-lock.json` وإعادة التثبيت
- تحقق من TypeScript errors

### Environment Variables Not Working
- تأكد من أن المتغيرات تبدأ بـ `REACT_APP_`
- أعد تشغيل Development Server
- في Production، تحقق من Vercel Environment Variables

### API Not Working
- تحقق من `REACT_APP_API_BASE_URL`
- تحقق من CORS settings
- تحقق من Network tab في DevTools

### Sentry Not Working
- تحقق من `REACT_APP_SENTRY_DSN`
- تحقق من `REACT_APP_ENABLE_SENTRY=true`
- تحقق من Console للأخطاء

---

## 📞 Support

للحصول على المساعدة:
1. راجع [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
2. راجع [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (إذا كان موجوداً)
3. تحقق من [Issues](https://github.com/your-repo/issues)

---

## 🔄 Updates

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Updating Environment Variables
1. تحديث `.env.production`
2. تحديث Vercel Environment Variables
3. Redeploy

---

**آخر تحديث:** 2024-01-15  
**الإصدار:** 1.4.0

