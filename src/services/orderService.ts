import { supabase } from '../lib/supabase';
import type { Order, OrderStatus, OrderItem } from '../types';

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), shops(name)')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), shops(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrder(data) : undefined;
}

export async function getOrdersByShop(shopId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), shops(name)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrder);
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), shops(name)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrder);
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
  const tokenNumber = await generateToken();

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      student_id: data.userId,
      shop_id: data.shopId,
      total_amount: data.totalAmount,
      payment_status: 'PENDING',
      order_status: 'PLACED',
      token_number: tokenNumber,
      payment_method: data.paymentMethod,
      estimated_pickup_time: data.estimatedPickupTime,
      student_name: data.userName,
      qr_code_data: `TOKEN:${tokenNumber}`,
    })
    .select()
    .single();
  if (orderError) throw new Error(orderError.message);

  const qrData = `ORDER:${orderRow.id}\nTOKEN:${tokenNumber}`;
  await supabase
    .from('orders')
    .update({ qr_code_data: qrData })
    .eq('id', orderRow.id);

  const orderItems = data.items.map((item) => ({
    order_id: orderRow.id,
    menu_item_id: item.itemId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    image: item.image,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  const { data: fullOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*, order_items(*), shops(name)')
    .eq('id', orderRow.id)
    .maybeSingle();
  if (fetchError) throw new Error(fetchError.message);

  return mapOrder(fullOrder!);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const dbStatus = status.toUpperCase() as string;
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: dbStatus })
    .eq('id', id)
    .select('*, order_items(*), shops(name)')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Order not found');
  return mapOrder(data);
}

export async function updatePaymentStatus(
  orderId: string,
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: status })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
}

/**
 * Atomically redeems (completes) an order via QR scan.
 * Only succeeds when:
 *  - order.id matches
 *  - order.shop_id matches the shopkeeper's assigned shop
 *  - order.order_status is 'PLACED' (not already completed/cancelled)
 * Returns null if no row was updated (already redeemed / wrong shop / not found).
 */
export async function redeemOrderByQr(
  orderId: string,
  shopId: string
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: 'COMPLETED' })
    .eq('id', orderId)
    .eq('shop_id', shopId)
    .in('order_status', ['PLACED', 'PREPARING', 'READY'])
    .select('*, order_items(*), shops(name)')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrder(data) : null;
}

export const ORDER_FLOW: OrderStatus[] = [
  'placed',
  'preparing',
  'ready',
  'completed',
];

async function generateToken(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_token_number');
  if (error) throw new Error(error.message);
  return data as string;
}

function mapOrder(d: Record<string, unknown>): Order {
  const items = (d.order_items as Record<string, unknown>[]) ?? [];
  const shop = d.shops as Record<string, unknown> | null;
  return {
    id: d.id as string,
    userId: d.student_id as string,
    userName: (d.student_name as string) ?? '',
    shopId: d.shop_id as string,
    shopName: (shop?.name as string) ?? '',
    items: items.map((it) => ({
      itemId: (it.menu_item_id as string) ?? '',
      name: it.name as string,
      price: Number(it.price) ?? 0,
      quantity: Number(it.quantity) ?? 1,
      image: (it.image as string) ?? '',
    })),
    totalAmount: Number(d.total_amount) ?? 0,
    status: ((d.order_status as string) ?? 'PLACED').toLowerCase() as OrderStatus,
    token: (d.token_number as string) ?? '',
    estimatedPickupTime: (d.estimated_pickup_time as string) ?? '',
    createdAt: (d.created_at as string) ?? '',
    paymentMethod: (d.payment_method as string) ?? '',
    paymentStatus: ((d.payment_status as string) ?? 'PENDING').toLowerCase() === 'success' ? 'paid' : 'pending',
  };
}
