import { supabase } from '../lib/supabase';
import type { User, FoodCourt, Shop, Role } from '../types';

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    email: d.email,
    regNo: d.reg_no,
    role: d.role as Role,
    status: d.status,
    createdAt: d.created_at,
  }));
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('User not found');
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    regNo: data.reg_no,
    role: data.role as Role,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function getAllFoodCourtsAdmin(): Promise<FoodCourt[]> {
  const { data, error } = await supabase.from('food_courts').select('*').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    location: d.location,
    description: d.description ?? '',
    status: d.status ?? 'open',
    shopCount: 0,
    crowd: d.crowd ?? 'low',
  }));
}

export async function createFoodCourt(
  data: Omit<FoodCourt, 'id' | 'shopCount'>
): Promise<FoodCourt> {
  const { data: row, error } = await supabase
    .from('food_courts')
    .insert({
      name: data.name,
      location: data.location,
      description: data.description,
      status: data.status,
      crowd: data.crowd,
    })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error('Failed to create food court');
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description ?? '',
    status: row.status ?? 'open',
    shopCount: 0,
    crowd: row.crowd ?? 'low',
  };
}

export async function updateFoodCourt(
  id: string,
  updates: Partial<FoodCourt>
): Promise<FoodCourt> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.crowd !== undefined) dbUpdates.crowd = updates.crowd;

  const { data, error } = await supabase
    .from('food_courts')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Food court not found');
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    description: data.description ?? '',
    status: data.status ?? 'open',
    shopCount: 0,
    crowd: data.crowd ?? 'low',
  };
}

export async function deleteFoodCourt(id: string): Promise<void> {
  const { error } = await supabase.from('food_courts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getAllShopsAdmin(): Promise<Shop[]> {
  const { data, error } = await supabase.from('shops').select('*').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    foodCourtId: d.food_court_id,
    category: d.category ?? '',
    contact: d.contact ?? '',
    status: d.status ?? 'open',
    crowd: d.crowd ?? 'low',
    rating: Number(d.rating) ?? 0,
    image: d.image ?? '',
  }));
}

export async function createShop(data: Omit<Shop, 'id'>): Promise<Shop> {
  const { data: row, error } = await supabase
    .from('shops')
    .insert({
      food_court_id: data.foodCourtId,
      shopkeeper_id: null,
      name: data.name,
      category: data.category,
      contact: data.contact,
      status: data.status,
      crowd: data.crowd,
      rating: data.rating,
      image: data.image,
    })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error('Failed to create shop');
  return {
    id: row.id,
    name: row.name,
    foodCourtId: row.food_court_id,
    category: row.category ?? '',
    contact: row.contact ?? '',
    status: row.status ?? 'open',
    crowd: row.crowd ?? 'low',
    rating: Number(row.rating) ?? 0,
    image: row.image ?? '',
  };
}

export async function updateShop(
  id: string,
  updates: Partial<Shop>
): Promise<Shop> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.foodCourtId !== undefined) dbUpdates.food_court_id = updates.foodCourtId;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.crowd !== undefined) dbUpdates.crowd = updates.crowd;
  if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
  if (updates.image !== undefined) dbUpdates.image = updates.image;

  const { data, error } = await supabase
    .from('shops')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Shop not found');
  return {
    id: data.id,
    name: data.name,
    foodCourtId: data.food_court_id,
    category: data.category ?? '',
    contact: data.contact ?? '',
    status: data.status ?? 'open',
    crowd: data.crowd ?? 'low',
    rating: Number(data.rating) ?? 0,
    image: data.image ?? '',
  };
}

export async function deleteShop(id: string): Promise<void> {
  const { error } = await supabase.from('shops').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getAdminStats() {
  const [users, shops, foodCourts, orders] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('shops').select('*'),
    supabase.from('food_courts').select('*'),
    supabase.from('orders').select('*'),
  ]);

  const allUsers = users.data ?? [];
  const allOrders = orders.data ?? [];

  return {
    totalStudents: allUsers.filter((u: Record<string, unknown>) => u.role === 'student').length,
    totalShops: (shops.data ?? []).length,
    totalFoodCourts: (foodCourts.data ?? []).length,
    todayOrders: allOrders.length,
    completedOrders: allOrders.filter((o: Record<string, unknown>) => o.order_status === 'COMPLETED').length,
    revenue: allOrders
      .filter((o: Record<string, unknown>) => o.payment_status === 'SUCCESS')
      .reduce((sum: number, o: Record<string, unknown>) => sum + Number(o.total_amount), 0),
    activeOrders: allOrders.filter((o: Record<string, unknown>) =>
      ['PLACED', 'PREPARING', 'READY'].includes(o.order_status as string)
    ).length,
  };
}

export async function createShopkeeperAccount(data: {
  name: string;
  email: string;
  password: string;
  shopId: string;
}): Promise<{ user: User; shopName: string }> {
  const { data: resData, error } = await supabase.functions.invoke('create-shopkeeper', {
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      shopId: data.shopId,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to create shopkeeper account');
  }

  if (resData?.error) {
    throw new Error(resData.error);
  }

  const userId = resData?.user?.id || resData?.userId || resData?.id || '';
  const shopName = resData?.shopName || resData?.shop_name || 'Assigned Shop';

  return {
    user: {
      id: userId,
      name: resData?.user?.name || data.name,
      email: resData?.user?.email || data.email,
      role: 'shopkeeper',
      status: 'active',
      createdAt: resData?.user?.createdAt || new Date().toISOString(),
    },
    shopName,
  };
}
