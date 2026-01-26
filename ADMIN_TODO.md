## ✅ Servy Admin Panel – Project TODO Roadmap

> هذا الملف يهدف لمتابعة التقدّم في تنفيذ لوحة الإدارة بناءً على الدليل الشامل، ومعرفة ما تم وما المتبقي.
> استخدم مربعات التحديد لتحديث الحالة:  
> `- [ ]` لم يتم، `- [x]` مكتمل، يمكن إضافة `🔄` لما هو جاري العمل عليه.

---

## 🧩 Phase 1 – Project Setup & Authentication (High Priority)

- [x] **Create React + TypeScript project**
  - [x] تهيئة المشروع بـ `create-react-app` داخل مجلد فرعي `web`
  - [x] إعداد `tsconfig.json` الافتراضي (من CRA)
- [x] **Install core dependencies**
  - [x] React, React DOM, TypeScript
  - [x] React Router v6/7
  - [x] Axios
  - [x] React Query (TanStack Query)
  - [x] MUI + Icons + Emotion
  - [x] Recharts
  - [x] React Hook Form + Yup + resolvers
  - [x] TanStack Table
  - [x] Date-fns
- [x] **Project structure**
  - [x] إنشاء مجلدات `components`, `pages`, `services`, `hooks`
  - [ ] إنشاء مجلدات `utils`, `types`, `theme` (لاحقاً عند الحاجة)
  - [x] إنشاء صفحات أساسية (Login, Dashboard)
- [x] **Theme & Design System**
  - [x] تفعيل MUI ThemeProvider في `App` مع ألوان أساسية حسب الدليل
  - [ ] دعم العربية والـ RTL (يُضاف لاحقاً)
- [x] **Routing**
  - [x] إعداد `react-router-dom` مع `BrowserRouter`
  - [x] تعريف مسارات `/login` و `/dashboard`
  - [x] إنشاء `ProtectedRoute` لحماية صفحات الـ Admin
- [ ] **API Client**
  - [ ] إنشاء Axios instance مع `baseURL` من env (سيتم بعد جاهزية الباك إند)
  - [ ] إضافة interceptors (Authorization + error handling)
- [x] **React Query Setup**
  - [x] إنشاء `QueryClient`
  - [x] تغليف التطبيق بـ `QueryClientProvider`
  - [ ] إعداد خيارات افتراضية متقدمة (retry, refetchOnWindowFocus, إلخ)
- [x] **Authentication (Mock حالياً)**
  - [x] صفحة تسجيل الدخول (Login Page) مع التحقق البسيط
  - [x] استدعاء Mock API: `mockLogin` بدلاً من `/auth/login`
  - [x] تخزين التوكن في `localStorage`
  - [x] إنشاء `useAuth`/`AuthProvider` لإدارة حالة المستخدم
  - [x] إعادة توجيه غير المصرّح لهم إلى `/login`
  - [x] تجهيز `logout` لمسح التوكن (استخدامه لاحقاً في الـ Layout)

---

## 📊 Phase 2 – Layout & Dashboard (High Priority)

- [ ] **Layout (Sidebar + TopBar + Content)**
  - [ ] مكوّن `Sidebar` مع روابط الأقسام الرئيسية
  - [ ] مكوّن `TopBar` (البحث، الإشعارات، قائمة المستخدم)
  - [ ] مكوّن `Layout` العام الذي يغلّف الصفحات المحمية
  - [ ] دعم الـ Responsive (Sidebar قابل للطي/Drawer على الموبايل)
- [ ] **Common UI Components**
  - [ ] `StatCard` لبطاقات الإحصائيات
  - [ ] `DataTable` عام مع (sorting, pagination, search, filters)
  - [ ] `Chart` Wrapper (Line/Bar/Pie)
  - [ ] `Loading` + Skeleton
  - [ ] `EmptyState` + `ErrorState`
- [ ] **Dashboard Page**
  - [ ] استدعاء `/dashboard/statistics`
  - [ ] عرض بطاقات: Total Users, Total Orders, Total Revenue, Active Restaurants, Active Drivers, Pending Orders
  - [ ] استدعاء `/dashboard/charts` للـ (orders / revenue / users)
  - [ ] عرض الرسوم البيانية (Orders Over Time, Revenue Over Time, Orders by Status, Top Restaurants, Top Drivers)
  - [ ] قسم Recent Activities (مبدئياً من Mock أو من activity_logs لاحقاً)
  - [ ] إعداد تحديث دوري (polling أو refetchInterval)

---

## 👥 Phase 3 – Users Management (High Priority)

- [ ] **Users List Page**
  - [ ] استدعاء `/users` مع دعم `userType`, `status`, `search`, `page`, `limit`, `sortBy`
  - [ ] دمج مع `DataTable` (أعمدة: ID, Name, Email, Phone, Total Orders, Total Spent, Status, Registered, Actions)
  - [ ] شريط بحث + فلاتر (User Type, Status, Date)
  - [ ] Pagination + Sorting
  - [ ] أزرار Actions (View, Edit, Delete, Disable)
  - [ ] Export (مبدئياً client-side، وserver-side عند توفر API)
- [ ] **User Details Page**
  - [ ] استدعاء `/users/:id`
  - [ ] عرض معلومات البروفايل الأساسية
  - [ ] عرض Order History (جدول)
  - [ ] عرض Addresses
  - [ ] عرض Payment Methods
  - [ ] عرض Favorite Restaurants
- [ ] **User Actions**
  - [ ] تحديث الحالة `/users/:id/status` (Active/Suspended)
  - [ ] حذف المستخدم `/users/:id`
  - [ ] (اختياري) صفحة/مودال لتعديل بيانات المستخدم الأساسية

---

## 🏪 Phase 4 – Restaurants Management (High Priority)

- [ ] **Restaurants List Page**
  - [ ] استدعاء `/restaurants` مع `status`, `search`, `page`, `limit`
  - [ ] جدول أعمدة: ID, Name, Owner Email, Cuisine Type, Status, Total Orders, Total Revenue, Rating, Registered, Actions
  - [ ] فلاتر حسب الحالة (approved, pending, suspended) والبحث بالاسم/المطبخ
- [ ] **Restaurant Details Page**
  - [ ] استدعاء `/restaurants/:id`
  - [ ] عرض معلومات المطعم العامة
  - [ ] عرض Menu Preview
  - [ ] عرض Orders History
  - [ ] عرض Revenue Statistics
  - [ ] عرض Ratings & Reviews
- [ ] **Pending Approval**
  - [ ] صفحة/تبويب للمطاعم المعلقة (status = pending)
  - [ ] زر Approve `/restaurants/:id/approve`
  - [ ] زر Reject `/restaurants/:id/reject` مع إدخال سبب الرفض (Modal)
- [ ] **Restaurant Actions**
  - [ ] تحديث الحالة `/restaurants/:id/status`
  - [ ] تعديل بيانات المطعم (نفس فورم التفاصيل أو صفحة مستقلة)

---

## 📦 Phase 5 – Orders Management (High Priority)

- [ ] **Orders List Page**
  - [ ] استدعاء `/orders` مع فلاتر: `status`, `restaurantId`, `customerId`, `driverId`, `dateFrom`, `dateTo`, `page`, `limit`
  - [ ] جدول أعمدة: Order ID, Customer, Restaurant, Driver, Items, Total, Status, Date, Actions
  - [ ] فلاتر متقدمة + Date Range Picker
- [ ] **Order Details Page**
  - [ ] استدعاء `/orders/:id`
  - [ ] عرض معلومات الطلب الأساسية
  - [ ] عرض بيانات العميل
  - [ ] عرض بيانات المطعم
  - [ ] عرض بيانات السائق (إن وجِد)
  - [ ] Items List
  - [ ] Delivery Address + Payment Info
  - [ ] Status Timeline
  - [ ] خريطة التتبع (إن وُجدت بيانات الموقع/driver_locations)
- [ ] **Order Actions**
  - [ ] تحديث حالة الطلب `/orders/:id/status`
  - [ ] إلغاء الطلب مع سبب
  - [ ] تعيين سائق `/orders/:id/assign-driver`

---

## 📂 Phase 6 – Categories & Menu Management (Medium Priority)

- [ ] **Categories Management**
  - [ ] صفحة قائمة الفئات `/categories`
  - [ ] جدول/شبكة للفئات مع (Name, NameAr, Icon, Color, Actions)
  - [ ] إضافة فئة `/categories` (POST)
  - [ ] تعديل فئة `/categories/:id` (PUT)
  - [ ] حذف فئة `/categories/:id` (DELETE)
  - [ ] دعم رفع أيقونة + اختيار لون (Color Picker)
- [ ] **Menu Management (Global/Admin View)**
  - [ ] صفحة تعرض عناصر القائمة (مع فلتر حسب المطعم/الفئة/التوفر)
  - [ ] عرض تفاصيل Menu Item (سعر، توفّر، إضافات، المطعم)
  - [ ] (اختياري) تعديل/حذف العناصر حسب سياسة النظام

---

## 🎟️ Phase 7 – Coupons Management (Medium Priority)

- [ ] **Coupons List Page**
  - [ ] استدعاء `/coupons`
  - [ ] جدول أعمدة: Code, Type, Value, Usage, Status, Valid Until, Actions
  - [ ] فلاتر حسب الحالة/النوع
- [ ] **Add/Edit Coupon**
  - [ ] نموذج إنشاء كوبون `/coupons` (POST)
  - [ ] نموذج تعديل كوبون `/coupons/:id` (PUT)
  - [ ] حقول: code, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, validFrom, validUntil
  - [ ] تحقّق (validation) مع React Hook Form + Yup
  - [ ] تعطيل/حذف كوبون `/coupons/:id` (DELETE أو status)
  - [ ] (لاحقاً) عرض إحصائيات الاستخدام إن توفّرت من الباك إند

---

## 📊 Phase 8 – Reports & Analytics (Medium Priority)

- [ ] **Reports Dashboard**
  - [ ] اختيار نوع التقرير (Sales, Orders, Users, Drivers, Restaurants)
  - [ ] Date Range Picker + فلاتر إضافية (مثلاً Restaurant)
- [ ] **Sales Reports**
  - [ ] استدعاء `/reports/sales`
  - [ ] عرض رسوم بيانية (Revenue by period, Top Restaurants, Top Items)
  - [ ] جدول ملخّص
  - [ ] أزرار تصدير (PDF/Excel/CSV) عبر `/reports/export`
- [ ] **Orders Reports**
  - [ ] استدعاء `/reports/orders`
  - [ ] إحصائيات (Orders by Status, Completion Rate, Cancellation Rate, Average Order Value)
- [ ] **Users/Drivers/Restaurants Reports**
  - [ ] استدعاء `/reports/users` وبقية الـ endpoints حسب التصميم
  - [ ] عرض Top Customers, Active Users, Driver Performance, Top Drivers, Restaurant Performance, إلخ

---

## ⚙️ Phase 9 – Settings, Activity Logs & Notifications (Medium/Low Priority)

- [ ] **System Settings**
  - [ ] صفحة إعدادات النظام
  - [ ] استدعاء `/settings` (GET) + `/settings` (PUT)
  - [ ] حقول: appVersion (عرض فقط), maintenanceMode, defaultDeliveryFee, defaultTaxRate, currency, paymentGateway settings
- [ ] **Notifications Management**
  - [ ] نموذج إرسال إشعارات عامة `/notifications/broadcast`
  - [ ] خيارات: targetAudience (all/customers/drivers/restaurants)، userIds (مستخدمين محددين)
  - [ ] جدول تاريخ الإشعارات `/notifications/history`
- [ ] **Activity Logs**
  - [ ] استدعاء `/activity-logs`
  - [ ] جدول أعمدة: Admin, User, UserType, ActionType, EntityType, Description, IP, Date
  - [ ] فلاتر: userType, actionType, dateFrom/dateTo
  - [ ] مودال لعرض تفاصيل النشاط

---

## 🧪 Phase 10 – Polish, Testing & Performance (High Priority في نهاية المشروع)

- [ ] **Error Handling & UX**
  - [ ] Global error boundary إن لزم
  - [ ] توست/سنackbar للإشعارات (نجاح/خطأ)
  - [ ] رسائل خطأ واضحة من الـ APIs
- [ ] **Loading & Empty States**
  - [ ] Skeletons للجداول والبطاقات
  - [ ] EmptyState لكل صفحة في حالة عدم وجود بيانات
- [ ] **Responsive Design**
  - [ ] اختبار على (Mobile/Tablet/Desktop) مع breakpoints المحددة
  - [ ] تحسين استخدام الجداول على الشاشات الصغيرة (stacked cards أو horizontal scroll)
- [ ] **Testing**
  - [ ] Unit tests للمكونات الحرجة (Forms, Tables, Hooks)
  - [ ] Integration tests لتدفق رئيسي (Login, Orders Management, Restaurants Approval)
  - [ ] (اختياري) E2E لتدفقات حرجة
- [ ] **Performance & Code Quality**
  - [ ] Lazy loading للروتات الثقيلة
  - [ ] Code splitting حيث يلزم
  - [ ] إزالة أي كود/مكتبات غير مستخدمة

---

## 📌 General Meta Tasks

- [ ] **Mock Data / Mock APIs**
  - [ ] إعداد طبقة Mock أو JSON Server عند غياب الباك إند
  - [ ] عزل طبقة الـ API بحيث يسهل التحويل من Mock إلى حقيقي
- [ ] **Env & Config**
  - [ ] إعداد بيئات `development`, `staging`, `production`
  - [ ] تعريف `REACT_APP_API_URL` وأي متغيّرات أخرى
- [ ] **Documentation**
  - [ ] تحديث `README.md` (كيفية التشغيل، البناء، البيئة)
  - [ ] توثيق بنية المشروع وأهم المجلدات
  - [ ] إضافة ملاحظات حول الـ RBAC (الأدوار والصلاحيات في الواجهة)

---

### 🧭 استخدام هذا الملف

- حدّث مربعات التحديد مع التقدّم في العمل.
- يمكنك إضافة سطر مثل: `🔄` بجانب المهمة الجارية، أو إضافة اسم المطور/التاريخ إن أردت.
- عند إضافة ميزات جديدة، أضفها تحت الـ Phase الأنسب أو أنشئ Phase جديد في الأسفل.


