export type Role = 'student' | 'shopkeeper' | 'admin';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed';

export type CrowdLevel = 'low' | 'moderate' | 'busy';

export type Availability = 'available' | 'low_stock' | 'out_of_stock';

export type FoodType = 'veg' | 'non_veg';

export interface User {
  id: string;
  name: string;
  email: string;
  regNo?: string;
  role: Role;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface FoodCourt {
  id: string;
  name: string;
  location: string;
  description: string;
  status: 'open' | 'closed';
  shopCount: number;
  crowd: CrowdLevel;
}

export interface Shop {
  id: string;
  name: string;
  foodCourtId: string;
  category: string;
  contact: string;
  status: 'open' | 'closed';
  crowd: CrowdLevel;
  rating: number;
  image: string;
}

export interface FoodItem {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: FoodType;
  availability: Availability;
  preparationTime: number;
  image: string;
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  token: string;
  estimatedPickupTime: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
}

export interface Payment {
  id: string;
  orderId: string;
  method: 'upi' | 'card' | 'cashless';
  amount: number;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Favourite {
  id: string;
  userId: string;
  itemId: string;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  feedback: string;
  createdAt: string;
}
