import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Smartphone, Wallet, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import { processPayment } from '../../services/paymentService';
import { getShop } from '../../services/foodService';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';

const PAYMENT_METHODS = [
  { id: 'upi' as const, label: 'UPI', icon: <Smartphone className="h-5 w-5" /> },
  { id: 'card' as const, label: 'Card', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'cashless' as const, label: 'Cashless Demo', icon: <Wallet className="h-5 w-5" /> },
];

export function CheckoutPage() {
  const { items, subtotal, totalItems, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'upi' | 'card' | 'cashless'>('upi');
  const [processing, setProcessing] = useState(false);
  const [shopName, setShopName] = useState('');

  const deliveryFee = Math.round(subtotal * 0.05);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  // All items should be from same shop for simplicity; get shop name
  useEffect(() => {
    if (items.length > 0) {
      getShop(items[0].item.shopId).then((s) => s && setShopName(s.name));
    }
  }, [items]);

  async function handlePay() {
    if (!user || items.length === 0) return;
    setProcessing(true);
    try {
      const shopId = items[0].item.shopId;
      const shop = await getShop(shopId);
      const prepTime = items.reduce((sum, i) => sum + i.item.preparationTime, 0);
      const pickup = new Date(Date.now() + prepTime * 60000);
      const pickupTime = pickup.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const orderItems = items.map((ci) => ({
        itemId: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
        image: ci.item.image,
      }));

      const order = await createOrder({
        userId: user.id,
        userName: user.name,
        shopId,
        shopName: shop?.name ?? 'Shop',
        items: orderItems,
        totalAmount: total,
        paymentMethod: method,
        estimatedPickupTime: pickupTime,
      });

      await processPayment({ orderId: order.id, method, amount: total });
      clear();
      navigate('/student/order-confirmation', { state: { orderId: order.id } });
    } catch (err) {
      setProcessing(false);
      alert(err instanceof Error ? err.message : 'Payment failed');
    }
  }

  if (items.length === 0 && !processing) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => navigate('/student/food-courts')}>Browse Food</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Student info */}
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Student Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={user?.name ?? ''} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email ?? ''} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Registration No.</Label>
                <Input value={user?.regNo ?? ''} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Shop</Label>
                <Input value={shopName} readOnly />
              </div>
            </div>
          </Card>

          {/* Order items */}
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Order Items ({totalItems})</h2>
            <div className="space-y-2">
              {items.map((ci) => (
                <div key={ci.item.id} className="flex items-center justify-between text-sm">
                  <span>{ci.quantity}× {ci.item.name}</span>
                  <span className="font-medium">₹{ci.item.price * ci.quantity}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Payment Method</h2>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  disabled={processing}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all',
                    method === m.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              This is a demo payment. No real transaction will occur.
            </p>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="p-5 sticky top-20">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span>₹{taxes}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handlePay} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Pay ₹{total}
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
