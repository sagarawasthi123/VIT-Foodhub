import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Download, MapPin, Clock, ArrowRight } from 'lucide-react';
import { getOrderById } from '../../services/orderService';
import type { Order } from '../../types';
import { QRCodeCard } from '../../components/common/QRCodeCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = (location.state as { orderId?: string })?.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId).then((o) => setOrder(o ?? null));
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No order to display.</p>
        <Link to="/student"><Button className="mt-4">Go Home</Button></Link>
      </div>
    );
  }

  if (!order) return <div className="p-4">Loading...</div>;

  const qrValue = JSON.stringify({
    orderId: order.id,
    token: order.token,
    shop: order.shopName,
    amount: order.totalAmount,
  });

  function handleDownload() {
    const receipt = `
VIT FoodHub - Payment Receipt
============================
Order ID: ${order!.id.slice(0, 8)}
Token: ${order!.token}
Shop: ${order!.shopName}
Payment Method: ${order!.paymentMethod.toUpperCase()}
Payment Status: ${order!.paymentStatus.toUpperCase()}
Estimated Pickup: ${order!.estimatedPickupTime}

Items:
${order!.items.map((i) => `  ${i.quantity}× ${i.name} - ₹${i.price * i.quantity}`).join('\n')}

Total: ₹${order!.totalAmount}

Thank you for using VIT FoodHub!
`;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order!.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mt-1">Your order has been confirmed. Show your token at pickup.</p>
      </div>

      {/* Token card */}
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Your Token Number</p>
        <p className="text-4xl font-bold text-primary my-2">{order.token}</p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" /> Estimated Pickup: {order.estimatedPickupTime}
        </div>
      </Card>

      {/* Order details */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Order ID</p>
            <p className="font-medium">#{order.id.slice(0, 8)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Shop</p>
            <p className="font-medium">{order.shopName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment Method</p>
            <p className="font-medium uppercase">{order.paymentMethod}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment Status</p>
            <p className="font-medium text-green-600 capitalize">{order.paymentStatus}</p>
          </div>
        </div>
        <div className="border-t mt-4 pt-4">
          <p className="text-sm font-medium mb-2">Items</p>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1">
              <span>{item.quantity}× {item.name}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </Card>

      {/* QR Code */}
      <Card className="p-6 text-center">
        <h2 className="font-semibold mb-4">QR Code Token</h2>
        {showQR ? (
          <QRCodeCard value={qrValue} />
        ) : (
          <Button variant="outline" onClick={() => setShowQR(true)}>View QR Code</Button>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" /> Save Receipt
        </Button>
        <Button className="flex-1" onClick={() => navigate(`/student/orders/${order.id}`)}>
          Track Order <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
