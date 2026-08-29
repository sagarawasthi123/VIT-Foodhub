import type { FoodCourt, Shop, FoodItem } from '../types';
import {
  mockFoodCourts,
  mockShops,
  mockFoodItems,
} from '../data/mockData';

export async function getFoodCourts(): Promise<FoodCourt[]> {
  await delay();
  return [...mockFoodCourts];
}

export async function getFoodCourt(id: string): Promise<FoodCourt | undefined> {
  await delay();
  return mockFoodCourts.find((fc) => fc.id === id);
}

export async function getShopsByFoodCourt(
  foodCourtId: string
): Promise<Shop[]> {
  await delay();
  return mockShops.filter((s) => s.foodCourtId === foodCourtId);
}

export async function getShop(id: string): Promise<Shop | undefined> {
  await delay();
  return mockShops.find((s) => s.id === id);
}

export async function getFoodItemsByShop(shopId: string): Promise<FoodItem[]> {
  await delay();
  return mockFoodItems.filter((f) => f.shopId === shopId);
}

export async function getAllFoodItems(): Promise<FoodItem[]> {
  await delay();
  return [...mockFoodItems];
}

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  await delay();
  const q = query.toLowerCase().trim();
  if (!q) return [...mockFoodItems];
  return mockFoodItems.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
  );
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
