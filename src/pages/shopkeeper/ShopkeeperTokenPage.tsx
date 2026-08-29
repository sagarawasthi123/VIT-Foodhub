import { useState, useEffect } from 'react';
import { QrCode, Search, CheckCircle2, XCircle, User, ShoppingBag, Clock } from 'lucide-react';
import { getOrdersByShop, updateOrderStatus } from '../../services/orderService';
import { getShopByShopkeeper } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import type { Order } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { StatusBadge } from '../../components/common/Badges';

export function ShopkeeperTokenPage() {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [result, setResult] = useState<Order | null | 'not_found'>(null);
  const [shopOrders, setShopOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    getShopByShopkeeper(user.id).then((shop) => {
      if (shop) {
        getOrdersByShop(shop.id).then(setShopOrders);
      }
    });
  }, [user]);

  async function verifyToken() {
    if (!token.trim()) return;
    const order = shopOrders.find(
      (o) => o.token.toLowerCase() === token.trim().toLowerCase()
    );
    setResult(order ?? 'not_found');
  }

  async function markCompleted() {
    if (!result || result === 'not_found') return;
    await updateOrderStatus(result.id, 'completed');
    setResult({ ...result, status: 'completed' });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Token Verification</h1>
        <p className="text-muted-foreground mt-1">Enter a token number to verify the order</p>
      </div>

      {/* Input */}
      <Card className="p-6">
        <div className="space-y-3">
          <Label htmlFor="token">Token Number</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. FH-001"
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && verifyToken()}
              />
            </div>
            <Button onClick={verifyToken}>
              <QrCode className="h-4 w-4 mr-1" /> Verify
            </Button>
          </div>
        </div>
      </Card>

      {/* Result */}
      {result === 'not_found' && (
        <Card className="p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-7 w-7" />
          </div>
          <p className="font-semibold text-red-600">Invalid Token</p>
          <p className="text-sm text-muted-foreground mt-1">No order found with token "{token}" for your shop.</p>
        </Card>
      )}

      {result && result !== 'not_found' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-green-600">Valid Order</p>
              <p className="text-sm text-muted-foreground">Token verified successfully</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-medium">#{result.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Customer</span>
              <span className="font-medium">{result.userName}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> Items</span>
              <span className="font-medium">{result.items.length} items</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Pickup</span>
              <span className="font-medium">{result.estimatedPickupTime}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold">₹{result.totalAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={result.status} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {result.items.map((it, i) => (
              <span key={i} className="text-xs bg-muted rounded-full px-2 py-0.5">
                {it.quantity}× {it.name}
              </span>
            ))}
          </div>

          {result.status !== 'completed' && (
            <Button className="w-full mt-4" onClick={markCompleted}>
              Mark as Completed
            </Button>
          )}
          {result.status === 'completed' && (
            <p className="text-center text-sm text-green-600 font-medium mt-4">Order already completed</p>
          )}
        </Card>
      )}
    </div>
  );
}
