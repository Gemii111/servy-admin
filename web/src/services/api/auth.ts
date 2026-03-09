import axios from 'axios';
import apiClient from './client';
import { shouldUseMock } from './base';

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    admin: Admin;
    accessToken: string;
  };
  message?: string;
}

/** استدعاء تسجيل الدخول من الباك إند الحقيقي */
async function realLogin(payload: LoginPayload): Promise<LoginResponse> {
  const baseURL = (apiClient as any).defaults?.baseURL || 'unknown';
  const fullUrl = `${baseURL}/admin/auth/login`;
  console.log('[Login Debug] جاري الاتصال بـ:', fullUrl, '| استخدام Mock:', shouldUseMock());

  try {
    const { data } = await apiClient.post<LoginResponse>('/admin/auth/login', payload);
    console.log('[Login Debug] استجابة ناجحة:', data);
    if (!data.success || !data.data) {
      return {
        success: false,
        message: (data as unknown as { message?: string }).message || 'Login failed',
      };
    }
    return data;
  } catch (err) {
    // Debug: طباعة كل تفاصيل الخطأ
    console.error('[Login Debug] خطأ كامل:', err);
    if (axios.isAxiosError(err)) {
      console.error('[Login Debug] تفاصيل Axios:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        configUrl: err.config?.url,
        configBaseURL: err.config?.baseURL,
      });
      const resData = err.response?.data as { message?: string; error?: string } | undefined;
      const msg = resData?.message || resData?.error || err.response?.statusText || err.message;
      if (msg) {
        return { success: false, message: msg };
      }
    }
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `خطأ في الاتصال بالخادم: ${errMsg}`,
    };
  }
}

/** Mock للتطوير بدون باك إند */
async function mockLogin(payload: LoginPayload): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const isValid =
    payload.email === 'support@souqegy.net' && payload.password === 'password123';
  if (!isValid) {
    return { success: false, message: 'Invalid email or password' };
  }
  return {
    success: true,
    data: {
      admin: {
        id: 'admin-uuid-mock',
        email: payload.email,
        name: 'Mock Admin',
        role: 'super_admin',
      },
      accessToken: 'mock-jwt-token',
    },
  };
}

/** تسجيل الدخول - يستخدم API الحقيقي أو Mock حسب الإعداد */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const useMock = shouldUseMock();
  console.log('[Login] USE_MOCK=', process.env.REACT_APP_USE_MOCK_API, '| useMock=', useMock);
  if (useMock) {
    return mockLogin(payload);
  }
  return realLogin(payload);
}


