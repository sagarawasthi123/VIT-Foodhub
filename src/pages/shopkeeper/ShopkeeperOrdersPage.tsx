import { useState, useEffect } from 'react';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { getOrdersByShop, updateOrderStatus, ORDER_FLOW } from '../../services/orderService';
import { getShopByShopkeeper } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import type { Order, OrderStatus } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';

export function ShopkeeperOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getShopByShopkeeper(user.id).then((shop) => {
      if (shop) {
        setShopId(shop.id);
        getOrdersByShop(shop.id).then(setOrders);
      }
    });
  }, [user]);

  async function loadOrders() {
    if (!shopId) return;
    getOrdersByShop(shopId).then(setOrders);
  }

  async function advanceStatus(order: Order) {
    const idx = ORDER_FLOW.indexOf(order.status);
    if (idx < ORDER_FLOW.length - 1) {
      await updateOrderStatus(order.id, ORDER_FLOW[idx + 1]);
      loadOrders();
    }
  }

  const shopOrders = orders;
  const filtered = filter === 'all' ? shopOrders : shopOrders.filter((o) => o.status === filter);

  const counts: Record<string, number> = {
    all: shopOrders.length,
    placed: shopOrders.filter((o) => o.status === 'placed').length,
    preparing: shopOrders.filter((o) => o.status === 'preparing').length,
    ready: shopOrders.filter((o) => o.status === 'ready').length,
    completed: shopOrders.filter((o) => o.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', ...ORDER_FLOW] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors capitalize ${
              filter === s
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted'
            }`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-8 w-8" />} title="No orders" description="Orders will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const idx = ORDER_FLOW.indexOf(order.status);
            const isLast = idx === ORDER_FLOW.length - 1;
            return (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">#{order.id.slice(0, 8)}</span>
                      <span className="text-sm font-medium">Token: {order.token}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{order.userName}</p>
                  </div>
                  <span className="font-bold">₹{order.totalAmount}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {order.items.map((it, i) => (
                    <span key={i} className="text-xs bg-muted rounded-full px-2 py-0.5">
                      {it.quantity}× {it.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Pickup: {order.estimatedPickupTime} · {order.paymentMethod.toUpperCase()}
                  </span>
                  {!isLast && (
                    <Button size="sm" onClick={() => advanceStatus(order)}>
                      Mark as {ORDER_FLOW[idx + 1]} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  )}
                  {isLast && (
                    <span className="text-xs text-green-600 font-medium">Order completed</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
