import { useState, useEffect } from 'react';
import { Users, Store, Building2, ShoppingBag, CheckCircle2, IndianRupee, Activity } from 'lucide-react';
import { getAdminStats } from '../../services/adminService';
import { getAllOrders } from '../../services/orderService';
import type { Order } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/ui/card';
import { StatusBadge } from '../../components/common/Badges';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalStudents: number;
    totalShops: number;
    totalFoodCourts: number;
    todayOrders: number;
    completedOrders: number;
    revenue: number;
    activeOrders: number;
  } | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    getAdminStats().then(setStats);
    getAllOrders().then(setRecentOrders);
  }, []);

  if (!stats) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of VIT FoodHub system</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="h-6 w-6" />} />
        <StatCard title="Total Shops" value={stats.totalShops} icon={<Store className="h-6 w-6" />} accent="blue" />
        <StatCard title="Food Courts" value={stats.totalFoodCourts} icon={<Building2 className="h-6 w-6" />} accent="orange" />
        <StatCard title="Today's Orders" value={stats.todayOrders} icon={<ShoppingBag className="h-6 w-6" />} accent="green" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Completed" value={stats.completedOrders} icon={<CheckCircle2 className="h-6 w-6" />} />
        <StatCard title="Active Orders" value={stats.activeOrders} icon={<Activity className="h-6 w-6" />} accent="orange" />
        <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<IndianRupee className="h-6 w-6" />} accent="green" />
      </div>

      {/* Recent orders */}
      <Card className="p-5">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-2">
          {recentOrders.slice(0, 6).map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">#{order.id}</span>
                <span className="text-muted-foreground">{order.userName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground hidden sm:inline">{order.shopName}</span>
                <span className="font-medium">₹{order.totalAmount}</span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
