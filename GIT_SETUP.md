# 🔧 Git Setup Instructions

## ✅ ما تم إنجازه

- ✅ تم تهيئة Git repository
- ✅ تم إضافة جميع الملفات
- ✅ تم عمل commit بنجاح

**Commit Message:**
```
feat: إعداد Production - Environment Variables, Axios, Code Splitting, Sentry, Error Boundary
```

---

## 🚀 الخطوات التالية

### 1. إنشاء GitHub Repository

1. اذهب إلى [GitHub](https://github.com)
2. اضغط على **New Repository**
3. أدخل اسم المشروع: `servy-admin`
4. اختر **Private** أو **Public**
5. **لا** تضع علامة على "Initialize with README"
6. اضغط **Create repository**

### 2. إضافة Remote Repository

بعد إنشاء Repository، استخدم أحد الأوامر التالية:

#### إذا كان Repository فارغاً:
```bash
git remote add origin https://github.com/YOUR_USERNAME/servy-admin.git
git branch -M main
git push -u origin main
```

#### إذا كان Repository يحتوي على ملفات:
```bash
git remote add origin https://github.com/YOUR_USERNAME/servy-admin.git
git branch -M main
git pull origin main --allow-unrelated-histories
git push -u origin main
```

**ملاحظة:** استبدل `YOUR_USERNAME` باسم المستخدم الخاص بك في GitHub.

### 3. Push إلى GitHub

```bash
git push -u origin main
```

---

## 📝 أوامر Git المفيدة

### التحقق من الحالة:
```bash
git status
```

### إضافة ملفات جديدة:
```bash
git add .
git commit -m "رسالة الـ commit"
git push
```

### إنشاء Branch جديد:
```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

### عرض الـ Commits:
```bash
git log --oneline
```

---

## ⚠️ ملاحظات مهمة

1. **ملفات .env غير متضمنة في Git** (موجودة في `.gitignore`)
2. **node_modules غير متضمنة** (موجودة في `.gitignore`)
3. **build folder غير متضمن** (موجودة في `.gitignore`)

---

**آخر تحديث:** 2024-01-15

