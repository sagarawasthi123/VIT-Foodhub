import { useState, useEffect } from 'react';
import { ShoppingBag, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getOrdersByUser } from '../../services/orderService';
import { getFoodItemsByShop } from '../../services/foodService';
import type { Order, FoodItem } from '../../types';
import { OrderCard } from '../../components/common/OrderCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

export function OrderHistoryPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    getOrdersByUser(user.id).then(setOrders);
  }, [user]);

  async function handleReorder(order: Order) {
    const items = await getFoodItemsByShop(order.shopId);
    order.items.forEach((oi) => {
      const item = items.find((f) => f.id === oi.itemId);
      if (item) addItem(item, oi.quantity);
    });
  }

  const active = orders.filter((o) =>
    ['placed', 'preparing', 'ready'].includes(o.status)
  );
  const past = orders.filter((o) => o.status === 'completed');

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="No orders yet"
          description="Place your first order to see it here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="past">History ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="No active orders" />
          ) : (
            active.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                to={`/student/orders/${order.id}`}
                action={
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleReorder(order);
                    }}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Reorder
                  </button>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3 mt-4">
          {past.length === 0 ? (
            <EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="No past orders" />
          ) : (
            past.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                to={`/student/orders/${order.id}`}
                action={
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleReorder(order);
                    }}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Reorder
                  </button>
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
