export type RewardType =
  | 'discount_coupon'
  | 'free_delivery'
  | 'cash_credit'
  | 'free_item'
  | 'points'
  | 'custom';

export type UserRewardStatus = 'active' | 'used' | 'expired' | 'revoked';

export interface Reward {
  id: string;
  adminId: string;
  name: string;
  description?: string;
  rewardType: RewardType;
  rewardValue: number;
  expiryDays?: number;
  usageLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserReward {
  id: string;
  rewardId: string;
  reward: Reward;
  userId: string;
  userName: string;
  userEmail: string;
  adminId: string;
  adminName: string;
  assignedAt: string;
  expiresAt?: string;
  usedAt?: string;
  usedCount: number;
  status: UserRewardStatus;
  notes?: string;
}

export interface RewardsStatistics {
  totalRewards: number;
  totalAssigned: number;
  totalUsed: number;
  totalValue: number;
  byType: Record<RewardType, number>;
  usageRate: number;
}

export interface RewardsResponse {
  rewards: Reward[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserRewardsResponse {
  userRewards: UserReward[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Mock data
const mockRewards: Reward[] = [
  {
    id: 'reward-1',
    adminId: 'admin-1',
    name: 'ترحيب للمستخدمين الجدد',
    description: '20 ريال رصيد للمستخدمين الجدد',
    rewardType: 'cash_credit',
    rewardValue: 20.0,
    expiryDays: 30,
    usageLimit: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'reward-2',
    adminId: 'admin-1',
    name: 'كوبون خصم 15%',
    description: 'خصم 15% على الطلب الأول',
    rewardType: 'discount_coupon',
    rewardValue: 15.0,
    expiryDays: 7,
    usageLimit: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'reward-3',
    adminId: 'admin-1',
    name: 'توصيل مجاني',
    description: 'توصيل مجاني لطلبات أكثر من 100 ريال',
    rewardType: 'free_delivery',
    rewardValue: 0,
    expiryDays: 60,
    usageLimit: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockUserRewards: UserReward[] = [
  {
    id: 'user-reward-1',
    rewardId: 'reward-1',
    reward: mockRewards[0],
    userId: 'user-1',
    userName: 'أحمد محمد',
    userEmail: 'ahmed@example.com',
    adminId: 'admin-1',
    adminName: 'أحمد محمد',
    assignedAt: '2024-01-10T00:00:00Z',
    expiresAt: '2024-02-10T00:00:00Z',
    usedAt: undefined,
    usedCount: 0,
    status: 'active',
    notes: 'ترحيب بالمستخدم الجديد',
  },
  {
    id: 'user-reward-2',
    rewardId: 'reward-2',
    reward: mockRewards[1],
    userId: 'user-2',
    userName: 'محمد علي',
    userEmail: 'mohammed@example.com',
    adminId: 'admin-1',
    adminName: 'أحمد محمد',
    assignedAt: '2024-01-05T00:00:00Z',
    expiresAt: '2024-01-12T00:00:00Z',
    usedAt: '2024-01-06T10:00:00Z',
    usedCount: 1,
    status: 'used',
  },
];

// Mock API functions
export async function mockCreateReward(data: {
  name: string;
  description?: string;
  rewardType: RewardType;
  rewardValue: number;
  expiryDays?: number;
  usageLimit: number;
}): Promise<Reward> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const reward: Reward = {
    id: `reward-${Date.now()}`,
    adminId: 'admin-1',
    ...data,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockRewards.push(reward);
  return reward;
}

export async function mockGetRewards(params?: {
  isActive?: boolean;
  rewardType?: RewardType | 'all';
  page?: number;
  limit?: number;
}): Promise<RewardsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockRewards];

  if (params?.isActive !== undefined) {
    filtered = filtered.filter((r) => r.isActive === params.isActive);
  }

  if (params?.rewardType && params.rewardType !== 'all') {
    filtered = filtered.filter((r) => r.rewardType === params.rewardType);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    rewards: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockGetRewardById(id: string): Promise<Reward> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const reward = mockRewards.find((r) => r.id === id);
  if (!reward) {
    throw new Error('Reward not found');
  }

  return reward;
}

export async function mockUpdateReward(
  id: string,
  data: Partial<Reward>
): Promise<Reward> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockRewards.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Reward not found');
  }

  mockRewards[index] = {
    ...mockRewards[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return mockRewards[index];
}

export async function mockDeleteReward(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = mockRewards.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Reward not found');
  }

  mockRewards.splice(index, 1);
}

export async function mockAssignReward(data: {
  rewardId: string;
  userIds: string[];
  sendNotification?: boolean;
  notes?: string;
}): Promise<{ assignedCount: number; assignments: UserReward[] }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const reward = mockRewards.find((r) => r.id === data.rewardId);
  if (!reward) {
    throw new Error('Reward not found');
  }

  const assignments: UserReward[] = data.userIds.map((userId) => {
    const expiresAt = reward.expiryDays
      ? new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    return {
      id: `user-reward-${Date.now()}-${userId}`,
      rewardId: data.rewardId,
      reward,
      userId,
      userName: `User ${userId}`,
      userEmail: `user${userId}@example.com`,
      adminId: 'admin-1',
      adminName: 'أحمد محمد',
      assignedAt: new Date().toISOString(),
      expiresAt,
      usedAt: undefined,
      usedCount: 0,
      status: 'active',
      notes: data.notes,
    };
  });

  mockUserRewards.push(...assignments);

  return {
    assignedCount: assignments.length,
    assignments,
  };
}

export type RewardCriteriaType =
  | 'top_customers'
  | 'order_count'
  | 'total_spent'
  | 'new_users'
  | 'all_users'
  | 'all_customers'
  | 'all_drivers'
  | 'all_restaurants';

export async function mockAssignRewardByCriteria(data: {
  rewardId: string;
  criteria: {
    type: RewardCriteriaType;
    value?: number;
    minOrders?: number;
    minSpent?: number;
  };
  sendNotification?: boolean;
}): Promise<{ assignedCount: number; assignments: UserReward[] }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock: Get users based on criteria
  // In real implementation, this would filter users from database
  let mockUserIds: string[] = [];
  
  if (data.criteria.type === 'all_users' || data.criteria.type === 'all_customers' || data.criteria.type === 'all_drivers' || data.criteria.type === 'all_restaurants') {
    // Generate mock user IDs based on type
    // Mock: Generate 50 user IDs
    mockUserIds = Array.from({ length: 50 }, (_, i) => `user-${i + 1}`);
  } else {
    // For other criteria types, use a smaller set
    mockUserIds = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
  }

  return mockAssignReward({
    rewardId: data.rewardId,
    userIds: mockUserIds,
    sendNotification: data.sendNotification,
  });
}

export async function mockGetUserRewardsHistory(params?: {
  userId?: string;
  rewardId?: string;
  status?: UserRewardStatus | 'all';
  rewardType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<UserRewardsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockUserRewards];

  if (params?.userId) {
    filtered = filtered.filter((ur) => ur.userId === params.userId);
  }

  if (params?.rewardId) {
    filtered = filtered.filter((ur) => ur.rewardId === params.rewardId);
  }

  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((ur) => ur.status === params.status);
  }

  if (params?.rewardType) {
    filtered = filtered.filter((ur) => ur.reward.rewardType === params.rewardType);
  }

  if (params?.dateFrom) {
    const dateFrom = new Date(params.dateFrom);
    filtered = filtered.filter((ur) => new Date(ur.assignedAt) >= dateFrom);
  }

  if (params?.dateTo) {
    const dateTo = new Date(params.dateTo);
    dateTo.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter((ur) => new Date(ur.assignedAt) <= dateTo);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    userRewards: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockRevokeReward(
  id: string,
  reason?: string
): Promise<UserReward> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockUserRewards.findIndex((ur) => ur.id === id);
  if (index === -1) {
    throw new Error('User reward not found');
  }

  mockUserRewards[index] = {
    ...mockUserRewards[index],
    status: 'revoked',
    notes: reason,
  };

  return mockUserRewards[index];
}

export async function mockExtendReward(
  id: string,
  days: number
): Promise<UserReward> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockUserRewards.findIndex((ur) => ur.id === id);
  if (index === -1) {
    throw new Error('User reward not found');
  }

  const currentExpiresAt = mockUserRewards[index].expiresAt
    ? new Date(mockUserRewards[index].expiresAt!)
    : new Date();

  const newExpiresAt = new Date(currentExpiresAt);
  newExpiresAt.setDate(newExpiresAt.getDate() + days);

  mockUserRewards[index] = {
    ...mockUserRewards[index],
    expiresAt: newExpiresAt.toISOString(),
  };

  return mockUserRewards[index];
}

export async function mockGetRewardsStatistics(): Promise<RewardsStatistics> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    totalRewards: mockRewards.length,
    totalAssigned: mockUserRewards.length,
    totalUsed: mockUserRewards.filter((ur) => ur.status === 'used').length,
    totalValue: mockUserRewards.reduce((sum, ur) => sum + ur.reward.rewardValue, 0),
    byType: {
      discount_coupon: 1500,
      cash_credit: 2000,
      free_delivery: 1000,
      free_item: 300,
      points: 200,
      custom: 0,
    },
    usageRate: 60.0,
  };
}

