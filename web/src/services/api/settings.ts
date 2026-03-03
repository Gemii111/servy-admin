export interface AppSettings {
  general: {
    appName: string;
    appLogo?: string;
    defaultLanguage: string;
    timezone: string;
    currency: string;
    taxRate: number;
    deliveryFee: number;
    minOrderAmount: number;
  };
  payment: {
    paymentMethods: string[];
    commissionRate: number;
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
    autoPayout: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    orderNotifications: boolean;
    marketingNotifications: boolean;
  };
  delivery: {
    maxDeliveryDistance: number; // in km
    estimatedDeliveryTime: number; // in minutes
    driverAssignment: 'auto' | 'manual';
    deliveryBaseFee: number; // الرسوم الأساسية (EGP)
    deliveryFreeKm: number; // كم متر مجاني
    deliveryPricePerKm: number; // السعر لكل كم إضافي (EGP)
  };
  restaurant: {
    autoApprove: boolean;
    commissionRate: number;
    minRating: number;
  };
  support: {
    supportEmail: string;
    supportPhone1: string;
    supportPhone2: string;
    supportAddress: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
}

// Mock settings data
let mockSettings: AppSettings = {
  general: {
    appName: 'Souq',
    defaultLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    taxRate: 15,
    deliveryFee: 15,
    minOrderAmount: 50,
  },
  payment: {
    paymentMethods: ['cash', 'card', 'online'],
    commissionRate: 10,
    payoutSchedule: 'weekly',
    autoPayout: true,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    orderNotifications: true,
    marketingNotifications: false,
  },
  delivery: {
    maxDeliveryDistance: 10,
    estimatedDeliveryTime: 45,
    driverAssignment: 'auto',
    deliveryBaseFee: 20,
    deliveryFreeKm: 2,
    deliveryPricePerKm: 10,
  },
  restaurant: {
    autoApprove: false,
    commissionRate: 15,
    minRating: 4.0,
  },
  support: {
    supportEmail: 'support@souqegy.net',
    supportPhone1: '+201091717188',
    supportPhone2: '+201000431699',
    supportAddress: 'ذكرنس، دقهلية، مصر',
    privacyPolicyUrl: 'https://www.souqegy.net/privacy',
    termsOfServiceUrl: 'https://www.souqegy.net/terms',
  },
};

export async function mockGetSettings(): Promise<AppSettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...mockSettings };
}

export async function mockUpdateSettings(
  section: keyof AppSettings,
  data: Partial<AppSettings[keyof AppSettings]>
): Promise<AppSettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockSettings = {
    ...mockSettings,
    [section]: {
      ...mockSettings[section],
      ...data,
    },
  };
  return { ...mockSettings };
}

