import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Hash, LogOut, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByUser } from '../../services/orderService';
import { mockReviews } from '../../data/mockData';
import type { Order } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RatingStars } from '../../components/common/RatingStars';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    getOrdersByUser(user.id).then(setOrders);
  }, [user]);

  if (!user) return null;

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const userReviews = mockReviews.filter((r) => r.userId === user.id);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
          {user.regNo && (
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>{user.regNo}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span>Joined {user.createdAt}</span>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 text-center">
          <p className="text-3xl font-bold text-primary">{completedOrders.length}</p>
          <p className="text-sm text-muted-foreground">Completed Orders</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-3xl font-bold text-primary">{userReviews.length}</p>
          <p className="text-sm text-muted-foreground">Reviews Given</p>
        </Card>
      </div>

      {/* My reviews */}
      {userReviews.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold mb-3">My Reviews</h2>
          <div className="space-y-3">
            {userReviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order #{review.orderId}</span>
                  <RatingStars rating={review.rating} size={14} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{review.feedback}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" /> Logout
      </Button>
    </div>
  );
}
