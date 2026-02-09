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

// 👇 Mock login function (بدون باك إند حقيقي حالياً)
export async function mockLogin(
  payload: LoginPayload
): Promise<LoginResponse> {
  // محاكاة تأخير الشبكة
  await new Promise((resolve) => setTimeout(resolve, 800));

  // يمكنك تعديل هذا الشرط كما تحب أثناء التطوير
  const isValid =
    payload.email === 'support@souqegy.net' && payload.password === 'password123';

  if (!isValid) {
    return {
      success: false,
      message: 'Invalid email or password',
    };
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


