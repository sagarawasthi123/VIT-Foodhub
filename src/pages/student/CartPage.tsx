import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/common/EmptyState';

export function CartPage() {
  const { items, subtotal, totalItems, increment, decrement, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const deliveryFee = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
  const taxes = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + deliveryFee + taxes;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Your cart is empty"
          description="Browse food courts and add items to your cart."
          action={
            <Link to="/student/food-courts">
              <Button>Browse Food Courts</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Button variant="ghost" size="sm" onClick={clear}>Clear all</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((ci) => (
            <Card key={ci.item.id} className="p-3 flex items-center gap-3">
              <img src={ci.item.image} alt={ci.item.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{ci.item.name}</h3>
                <p className="text-xs text-muted-foreground">₹{ci.item.price} each</p>
                <p className="text-sm font-semibold mt-0.5">₹{ci.item.price * ci.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decrement(ci.item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-medium">{ci.quantity}</span>
                <button
                  onClick={() => increment(ci.item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeItem(ci.item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card className="p-5 sticky top-20">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items ({totalItems})</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service fee (5%)</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => navigate('/student/checkout')}>
              Proceed to Checkout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
