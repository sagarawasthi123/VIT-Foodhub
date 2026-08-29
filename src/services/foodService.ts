import { supabase } from '../lib/supabase';
import type { FoodCourt, Shop, FoodItem } from '../types';

export async function getFoodCourts(): Promise<FoodCourt[]> {
  const { data, error } = await supabase.from('food_courts').select('*').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFoodCourt);
}

export async function getFoodCourt(id: string): Promise<FoodCourt | undefined> {
  const { data, error } = await supabase
    .from('food_courts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapFoodCourt(data) : undefined;
}

export async function getShopsByFoodCourt(foodCourtId: string): Promise<Shop[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('food_court_id', foodCourtId)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapShop);
}

export async function getShop(id: string): Promise<Shop | undefined> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapShop(data) : undefined;
}

export async function getFoodItemsByShop(shopId: string): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('shop_id', shopId)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFoodItem);
}

export async function getAllFoodItems(): Promise<FoodItem[]> {
  const { data, error } = await supabase.from('menu_items').select('*').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFoodItem);
}

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  const all = await getAllFoodItems();
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
  );
}

function mapFoodCourt(d: Record<string, unknown>): FoodCourt {
  return {
    id: d.id as string,
    name: d.name as string,
    location: d.location as string,
    description: (d.description as string) ?? '',
    status: (d.status as 'open' | 'closed') ?? 'open',
    shopCount: 0,
    crowd: (d.crowd as 'low' | 'moderate' | 'busy') ?? 'low',
  };
}

function mapShop(d: Record<string, unknown>): Shop {
  return {
    id: d.id as string,
    name: d.name as string,
    foodCourtId: d.food_court_id as string,
    category: (d.category as string) ?? '',
    contact: (d.contact as string) ?? '',
    status: (d.status as 'open' | 'closed') ?? 'open',
    crowd: (d.crowd as 'low' | 'moderate' | 'busy') ?? 'low',
    rating: Number(d.rating) ?? 0,
    image: (d.image as string) ?? '',
  };
}

function mapFoodItem(d: Record<string, unknown>): FoodItem {
  return {
    id: d.id as string,
    shopId: d.shop_id as string,
    name: d.name as string,
    description: (d.description as string) ?? '',
    price: Number(d.price) ?? 0,
    category: (d.category as string) ?? '',
    type: (d.type as 'veg' | 'non_veg') ?? 'veg',
    availability: (d.availability as 'available' | 'low_stock' | 'out_of_stock') ?? 'available',
    preparationTime: Number(d.preparation_time) ?? 10,
    image: (d.image as string) ?? '',
  };
}
