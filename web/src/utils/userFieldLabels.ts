/** Arabic labels for user API / DB fields (snake_case and camelCase). */
export const USER_FIELD_LABELS: Record<string, string> = {
  id: 'المعرّف',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  phone_number: 'الهاتف',
  phoneNumber: 'الهاتف',
  first_name: 'الاسم الأول',
  firstName: 'الاسم الأول',
  last_name: 'اسم العائلة',
  lastName: 'اسم العائلة',
  user_type: 'نوع المستخدم',
  userType: 'نوع المستخدم',
  status: 'حالة الحساب',
  is_active: 'مفعّل (DB)',
  isActive: 'مفعّل',
  image_url: 'صورة الملف',
  imageUrl: 'صورة الملف',
  is_email_verified: 'البريد موثّق',
  isEmailVerified: 'البريد موثّق',
  restaurant_id: 'معرّف المطعم',
  restaurantId: 'معرّف المطعم',
  created_at: 'تاريخ التسجيل',
  createdAt: 'تاريخ التسجيل',
  updated_at: 'آخر تحديث',
  updatedAt: 'آخر تحديث',
  last_login_at: 'آخر تسجيل دخول',
  last_login: 'آخر تسجيل دخول',
  lastLoginAt: 'آخر تسجيل دخول',
  last_seen_at: 'آخر نشاط للملف',
  last_seen: 'آخر نشاط للملف',
  lastSeenAt: 'آخر نشاط للملف',
  is_online: 'متصل (قديم)',
  isOnline: 'متصل (قديم)',
  total_orders: 'عدد الطلبات',
  totalOrders: 'عدد الطلبات',
  total_spent: 'إجمالي الإنفاق',
  totalSpent: 'إجمالي الإنفاق',
  no_of_orders: 'عدد الطلبات',
  loyalty_points: 'نقاط الولاء',
  loyaltyPoints: 'نقاط الولاء',
  address: 'العنوان',
  city: 'المدينة',
  country: 'الدولة',
  deleted_at: 'تاريخ الحذف',
  is_deleted: 'محذوف',
};

export function labelForUserField(key: string): string {
  return USER_FIELD_LABELS[key] ?? key;
}

export function formatUserFieldValue(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : '[]';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function isIsoDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(Date.parse(s));
}
