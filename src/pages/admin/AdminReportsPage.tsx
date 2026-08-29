import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag } from 'lucide-react';
import { getAllOrders } from '../../services/orderService';
import { mockShops, mockFoodItems } from '../../data/mockData';
import type { Order } from '../../types';
import { Card } from '../../components/ui/card';
import { StatCard } from '../../components/common/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = ['#16a34a', '#f97316', '#ef4444', '#3b82f6', '#a855f7'];

export function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getAllOrders().then(setOrders);
  }, []);

  // Orders by shop
  const ordersByShop = mockShops.map((shop) => ({
    name: shop.name.split(' ')[0],
    orders: orders.filter((o) => o.shopId === shop.id).length,
  }));

  // Status breakdown
  const statusData = [
    { name: 'Completed', value: orders.filter((o) => o.status === 'completed').length },
    { name: 'Active', value: orders.filter((o) => ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)).length },
  ].filter((d) => d.value > 0);

  // Popular items
  const itemCounts: Record<string, number> = {};
  orders.forEach((o) => o.items.forEach((it) => {
    itemCounts[it.name] = (itemCounts[it.name] ?? 0) + it.quantity;
  }));
  const popularItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const revenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const completed = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Overview of system performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={orders.length} icon={<ShoppingBag className="h-6 w-6" />} />
        <StatCard title="Completed" value={completed} icon={<TrendingUp className="h-6 w-6" />} accent="green" />
        <StatCard title="Revenue" value={`₹${revenue.toLocaleString()}`} icon={<IndianRupee className="h-6 w-6" />} accent="orange" />
        <StatCard title="Avg Order" value={`₹${orders.length ? Math.round(revenue / orders.length) : 0}`} icon={<BarChart3 className="h-6 w-6" />} accent="blue" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Orders by shop */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Orders by Shop</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ordersByShop}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status breakdown */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Completed vs Active Orders</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Popular items */}
      <Card className="p-5">
        <h2 className="font-semibold mb-4">Popular Food Items</h2>
        {popularItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={popularItems} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
