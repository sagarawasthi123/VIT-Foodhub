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
];

function GooglePayLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <g transform="translate(4, 4)">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

function PhonePeLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#5F259F" />
      <rect x="7" y="10" width="15" height="2.2" rx="1.1" fill="white" />
      <path d="M16 10.5L19.5 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M11 10v4.5A2.5 2.5 0 0 0 13.5 17h2.2"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M18 10v13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PaytmLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#002E6E" />
      <path
        d="M6 10h4.5c2 0 3.5 1.1 3.5 2.8s-1.5 2.8-3.5 2.8H8.5V22H6V10zm2.5 3.8h2c.8 0 1.4-.4 1.4-1s-.6-1-1.4-1h-2v2z"
        fill="#FFFFFF"
      />
      <path
        d="M15 15.5c0-1.2 1-2 2.5-2h1.5v-0.3c0-.6-.4-1-1.2-1-.7 0-1.2.3-1.3.8H15c.1-1.3 1.2-2 2.8-2 1.9 0 2.7.9 2.7 2.2V22h-1.4v-1.1c-.5.8-1.3 1.2-2.3 1.2-1.2 0-2.1-.8-2.1-2.1zm4-1.2h-1.2c-.8 0-1.3.4-1.3 1s.5 1 1.2 1c.8 0 1.3-.4 1.3-1.1v-.9z"
        fill="#FFFFFF"
      />
      <path
        d="M21 14h1.6l1.4 4.5 1.4-4.5H27l-2.4 7.2c-.6 1.8-1.5 2.4-2.8 2.4h-1v-1.2h.7c.7 0 1.1-.3 1.4-1.2l.2-.5L21 14z"
        fill="#00B9F1"
      />
    </svg>
  );
}

export function CheckoutPage() {
  const { items, subtotal, totalItems, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
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
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
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

            {method === 'upi' && (
              <div className="space-y-3 border-t pt-3">
                <Label className="text-xs font-semibold">Select UPI App</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gpay' as const, label: 'Google Pay', icon: <GooglePayLogo className="w-7 h-7" /> },
                    { id: 'phonepe' as const, label: 'PhonePe', icon: <PhonePeLogo className="w-7 h-7" /> },
                    { id: 'paytm' as const, label: 'Paytm', icon: <PaytmLogo className="w-7 h-7" /> },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-xs font-medium text-center transition-all',
                        upiApp === app.id
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {app.icon}
                      <span>{app.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3 border-t pt-3">
                <Label className="text-xs font-semibold">Card Details</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Card Number (e.g. 4111 2222 3333 4444)"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails((p) => ({ ...p, number: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails((p) => ({ ...p, expiry: e.target.value }))}
                    />
                    <Input
                      placeholder="CVV"
                      type="password"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails((p) => ({ ...p, cvv: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Card Holder Name"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              This is a demo payment screen for demonstration. No real transaction will occur.
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


