import { supabase } from '../lib/supabase';
import type { FoodItem, Shop } from '../types';

export async function getFoodItemsByShop(shopId: string): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('shop_id', shopId)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFoodItem);
}

export async function updateFoodItem(
  id: string,
  updates: Partial<FoodItem>
): Promise<FoodItem> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
  if (updates.preparationTime !== undefined) dbUpdates.preparation_time = updates.preparationTime;
  if (updates.image !== undefined) dbUpdates.image = updates.image;
  if (updates.type !== undefined) dbUpdates.type = updates.type;

  const { data, error } = await supabase
    .from('menu_items')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Item not found');
  return mapFoodItem(data);
}

export async function createFoodItem(
  data: Omit<FoodItem, 'id'>
): Promise<FoodItem> {
  const { data: row, error } = await supabase
    .from('menu_items')
    .insert({
      shop_id: data.shopId,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      type: data.type,
      availability: data.availability,
      preparation_time: data.preparationTime,
      image: data.image,
    })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error('Failed to create item');
  return mapFoodItem(row);
}

export async function deleteFoodItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getShopByShopkeeper(userId: string): Promise<Shop | undefined> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('shopkeeper_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
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
