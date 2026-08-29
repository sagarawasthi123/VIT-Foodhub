import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByShop } from '../../services/orderService';
import { getShopByShopkeeper, getFoodItemsByShop } from '../../services/shopService';
import type { Order, FoodItem } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/common/Badges';

export function ShopkeeperDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getShopByShopkeeper(user.id).then((shop) => {
      if (shop) {
        setShopId(shop.id);
        getOrdersByShop(shop.id).then(setOrders);
        getFoodItemsByShop(shop.id).then(setItems);
      }
    });
  }, [user]);

  const todayOrders = orders.length;
  const pending = orders.filter((o) => o.status === 'placed').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const ready = orders.filter((o) => o.status === 'ready').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const lowStock = items.filter((i) => i.availability !== 'available').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Orders" value={todayOrders} icon={<ClipboardList className="h-6 w-6" />} />
        <StatCard title="Pending" value={pending} icon={<Clock className="h-6 w-6" />} accent="orange" />
        <StatCard title="Preparing" value={preparing} icon={<UtensilsCrossed className="h-6 w-6" />} accent="blue" />
        <StatCard title="Ready" value={ready} icon={<CheckCircle2 className="h-6 w-6" />} accent="green" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Completed" value={completed} icon={<CheckCircle2 className="h-6 w-6" />} />
        <StatCard title="Low Stock Items" value={lowStock} icon={<AlertTriangle className="h-6 w-6" />} accent="red" />
      </div>

      {/* Recent orders */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link to="/shopkeeper/orders">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                <div>
                  <span className="font-medium text-sm">#{order.id.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground ml-2">{order.userName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">₹{order.totalAmount}</span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Low stock alert */}
      {lowStock > 0 && (
        <Card className="p-5 border-orange-200 bg-orange-50">
          <h2 className="font-semibold text-orange-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Low Stock Alert
          </h2>
          <div className="mt-3 space-y-1">
            {items.filter((i) => i.availability !== 'available').map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <span className={`text-xs font-medium ${item.availability === 'out_of_stock' ? 'text-red-600' : 'text-orange-600'}`}>
                  {item.availability === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                </span>
              </div>
            ))}
          </div>
          <Link to="/shopkeeper/inventory">
            <Button variant="outline" size="sm" className="mt-3">Manage Inventory</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
