تحميل تطبيقات الأندرويد (APK)
==============================

يوجد 3 تطبيقات، ولكل واحد زر "تحميل التطبيق" تحت كروت "سوق" و"سوق فيندور" و"سوق درايفر" في قسم التطبيقات.

ضع ملفات الـ APK في المجلد web/public بالأسماء التالية:

1. سوق (للعملاء):     souq.apk
2. سوق فيندور:        souq-vendor.apk
3. سوق درايفر:        souq-driver.apk

المسار الكامل:
   web/public/souq.apk
   web/public/souq-vendor.apk
   web/public/souq-driver.apk

بعد الرفع، روابط التحميل المباشرة ستكون:
   https://your-domain.com/souq.apk
   https://your-domain.com/souq-vendor.apk
   https://your-domain.com/souq-driver.apk

يمكنك تغيير الروابط من ملف src/lib/content.ts داخل home.apps.customer / vendor / driver (downloadUrl و downloadFileName).
