import type { Order, OrderStatus, OrderItem } from '../types';
import { mockOrders } from '../data/mockData';

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  await delay();
  return mockOrders.filter((o) => o.userId === userId);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await delay();
  return mockOrders.find((o) => o.id === id);
}

export async function getOrdersByShop(shopId: string): Promise<Order[]> {
  await delay();
  return mockOrders.filter((o) => o.shopId === shopId);
}

export async function getAllOrders(): Promise<Order[]> {
  await delay();
  return [...mockOrders];
}

export async function createOrder(data: {
  userId: string;
  userName: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  estimatedPickupTime: string;
}): Promise<Order> {
  await delay();
  const id = `VF${105 + mockOrders.length}`;
  const order: Order = {
    id,
    userId: data.userId,
    userName: data.userName,
    shopId: data.shopId,
    shopName: data.shopName,
    items: data.items,
    totalAmount: data.totalAmount,
    status: 'placed',
    token: id,
    estimatedPickupTime: data.estimatedPickupTime,
    createdAt: new Date().toISOString(),
    paymentMethod: data.paymentMethod,
    paymentStatus: 'paid',
  };
  mockOrders.unshift(order);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  await delay();
  const order = mockOrders.find((o) => o.id === id);
  if (!order) throw new Error('Order not found');
  order.status = status;
  return order;
}

export const ORDER_FLOW: OrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'completed',
];

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
