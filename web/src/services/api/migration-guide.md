# 🔄 API Migration Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية الانتقال من Mock APIs إلى Real APIs.

---

## 🎯 الخطوات

### 1. تحديث Environment Variables

تأكد من أن `.env.production` يحتوي على:
```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
REACT_APP_USE_MOCK_API=false
```

### 2. تحديث API Service File

#### مثال: `users.ts`

**قبل (Mock API):**
```typescript
export async function mockGetUsers(params?: {...}): Promise<UsersResponse> {
  // Mock implementation
}
```

**بعد (Real API):**
```typescript
import { apiClient } from './client';
import { shouldUseMock } from './base';

export async function getUsers(params?: {
  userType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {
  // Use mock in development if enabled
  if (shouldUseMock()) {
    return mockGetUsers(params);
  }

  // Use real API
  const response = await apiClient.get<UsersResponse>('/users', { params });
  return response.data;
}

// Keep mock function for development/testing
export async function mockGetUsers(params?: {...}): Promise<UsersResponse> {
  // Mock implementation (unchanged)
}
```

### 3. تحديث Components

#### قبل:
```typescript
import { mockGetUsers } from '../../services/api/users';

const { data } = useQuery({
  queryKey: ['users', ...],
  queryFn: () => mockGetUsers(params),
});
```

#### بعد:
```typescript
import { getUsers } from '../../services/api/users';

const { data } = useQuery({
  queryKey: ['users', ...],
  queryFn: () => getUsers(params),
});
```

---

## 📝 مثال كامل

### `src/services/api/users.ts`

```typescript
import { apiClient, ApiResponse, handleApiError } from './client';
import { shouldUseMock } from './base';

// Types (unchanged)
export interface User { ... }
export interface UsersResponse { ... }

// Real API function
export async function getUsers(params?: {
  userType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {
  // Use mock in development if enabled
  if (shouldUseMock()) {
    return mockGetUsers(params);
  }

  try {
    const response = await apiClient.get<ApiResponse<UsersResponse>>('/users', {
      params: {
        userType: params?.userType !== 'all' ? params?.userType : undefined,
        status: params?.status !== 'all' ? params?.status : undefined,
        search: params?.search,
        page: params?.page || 1,
        limit: params?.limit || 10,
      },
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch users');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

// Mock function (for development)
export async function mockGetUsers(params?: {...}): Promise<UsersResponse> {
  // Existing mock implementation
  // ...
}
```

### `src/pages/Users/UsersList.tsx`

```typescript
import { getUsers } from '../../services/api/users';

const UsersListPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['users', userTypeFilter, statusFilter, searchQuery, page, limit],
    queryFn: () => getUsers({
      userType: userTypeFilter,
      status: statusFilter,
      search: searchQuery,
      page,
      limit,
    }),
  });

  // Rest of component...
};
```

---

## 🔍 API Response Format

تأكد من أن Backend API يتبع هذا التنسيق:

### Success Response:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "message": "Users fetched successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details",
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## ✅ Checklist

- [ ] تحديث Environment Variables
- [ ] تحديث API Service Files
- [ ] تحديث Components لاستخدام Real API functions
- [ ] اختبار جميع API endpoints
- [ ] التحقق من Error Handling
- [ ] التحقق من Authentication Token
- [ ] اختبار في Production environment

---

## 🐛 Troubleshooting

### مشكلة: API لا يعمل

**الحل:**
1. تحقق من `REACT_APP_API_BASE_URL`
2. تحقق من Network tab في DevTools
3. تحقق من CORS settings في Backend
4. تحقق من Authentication token

### مشكلة: 401 Unauthorized

**الحل:**
1. تحقق من أن Token موجود في localStorage
2. تحقق من أن Token صحيح
3. تحقق من Request Interceptor في `client.ts`

### مشكلة: CORS Error

**الحل:**
1. تأكد من أن Backend يسمح بـ CORS
2. أضف Frontend URL إلى CORS whitelist
3. تحقق من Headers في Backend

---

**آخر تحديث:** 2024-01-15

