import type {
  User,
  FoodCourt,
  Shop,
  Role,
} from '../types';
import {
  mockUsers,
  mockFoodCourts,
  mockShops,
  mockOrders,
} from '../data/mockData';

export async function getAllUsers(): Promise<User[]> {
  await delay();
  return [...mockUsers];
}

export async function updateUserRole(
  id: string,
  role: Role
): Promise<User> {
  await delay();
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  user.role = role;
  return user;
}

export async function getAllFoodCourtsAdmin(): Promise<FoodCourt[]> {
  await delay();
  return [...mockFoodCourts];
}

export async function createFoodCourt(
  data: Omit<FoodCourt, 'id' | 'shopCount'>
): Promise<FoodCourt> {
  await delay();
  const fc: FoodCourt = {
    ...data,
    id: `fc${mockFoodCourts.length + 1}`,
    shopCount: 0,
  crowd: data.crowd ?? 'low',
  status: data.status ?? 'open',
  description: data.description ?? '',
  location: data.location ?? '',
    name: data.name,
  };
  mockFoodCourts.push(fc);
  return fc;
}

export async function updateFoodCourt(
  id: string,
  updates: Partial<FoodCourt>
): Promise<FoodCourt> {
  await delay();
  const fc = mockFoodCourts.find((f) => f.id === id);
  if (!fc) throw new Error('Food court not found');
  Object.assign(fc, updates);
  return fc;
}

export async function deleteFoodCourt(id: string): Promise<void> {
  await delay();
  const idx = mockFoodCourts.findIndex((f) => f.id === id);
  if (idx >= 0) mockFoodCourts.splice(idx, 1);
}

export async function getAllShopsAdmin(): Promise<Shop[]> {
  await delay();
  return [...mockShops];
}

export async function createShop(data: Omit<Shop, 'id'>): Promise<Shop> {
  await delay();
  const shop: Shop = {
    ...data,
    id: `s${mockShops.length + 1}`,
    crowd: data.crowd ?? 'low',
    status: data.status ?? 'open',
    rating: data.rating ?? 0,
    image: data.image ?? '',
    name: data.name,
    foodCourtId: data.foodCourtId,
    category: data.category,
    contact: data.contact,
  };
  mockShops.push(shop);
  return shop;
}

export async function updateShop(
  id: string,
  updates: Partial<Shop>
): Promise<Shop> {
  await delay();
  const shop = mockShops.find((s) => s.id === id);
  if (!shop) throw new Error('Shop not found');
  Object.assign(shop, updates);
  return shop;
}

export async function deleteShop(id: string): Promise<void> {
  await delay();
  const idx = mockShops.findIndex((s) => s.id === id);
  if (idx >= 0) mockShops.splice(idx, 1);
}

export async function getAdminStats() {
  await delay();
  const todayOrders = mockOrders.filter((o) =>
    o.createdAt.startsWith(new Date().toISOString().slice(0, 10))
  );
  return {
    totalStudents: mockUsers.filter((u) => u.role === 'student').length,
    totalShops: mockShops.length,
    totalFoodCourts: mockFoodCourts.length,
    todayOrders: todayOrders.length || mockOrders.length,
    completedOrders: mockOrders.filter((o) => o.status === 'completed').length,
    revenue: mockOrders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0),
    activeOrders: mockOrders.filter((o) =>
      ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)
    ).length,
  };
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
