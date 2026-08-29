import type { FoodItem } from '../types';
import { mockFoodItems } from '../data/mockData';

export async function getFoodItemsByShop(shopId: string): Promise<FoodItem[]> {
  await delay();
  return mockFoodItems.filter((f) => f.shopId === shopId);
}

export async function updateFoodItem(
  id: string,
  updates: Partial<FoodItem>
): Promise<FoodItem> {
  await delay();
  const item = mockFoodItems.find((f) => f.id === id);
  if (!item) throw new Error('Item not found');
  Object.assign(item, updates);
  return item;
}

export async function createFoodItem(
  data: Omit<FoodItem, 'id'>
): Promise<FoodItem> {
  await delay();
  const item: FoodItem = {
    ...data,
    id: `f${mockFoodItems.length + 1}`,
  };
  mockFoodItems.push(item);
  return item;
}

export async function deleteFoodItem(id: string): Promise<void> {
  await delay();
  const idx = mockFoodItems.findIndex((f) => f.id === id);
  if (idx >= 0) mockFoodItems.splice(idx, 1);
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
