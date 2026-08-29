import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Store, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrderById, ORDER_FLOW } from '../../services/orderService';
import { mockReviews } from '../../data/mockData';
import type { Order, Review } from '../../types';
import { OrderStatusTracker } from '../../components/common/OrderStatusTracker';
import { StatusBadge } from '../../components/common/Badges';
import { RatingStars } from '../../components/common/RatingStars';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then((o) => {
      setOrder(o ?? null);
      const review = mockReviews.find((r) => r.orderId === id);
      if (review) {
        setExistingReview(review);
        setRating(review.rating);
        setFeedback(review.feedback);
        setSubmitted(true);
      }
    });
  }, [id]);

  function handleSubmitReview() {
    if (!order || !user || rating === 0) return;
    const review: Review = {
      id: `r${Date.now()}`,
      orderId: order.id,
      userId: user.id,
      userName: user.name,
      rating,
      feedback,
      createdAt: new Date().toISOString(),
    };
    mockReviews.push(review);
    setExistingReview(review);
    setSubmitted(true);
  }

  if (!order) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/student/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Track Order</h1>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Order info */}
      <Card className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Order ID</p>
            <p className="font-medium">#{order.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1"><Store className="h-3 w-3" /> Shop</p>
            <p className="font-medium">{order.shopName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Token</p>
            <p className="font-bold text-primary text-lg">{order.token}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Pickup</p>
            <p className="font-medium">{order.estimatedPickupTime}</p>
          </div>
        </div>
      </Card>

      {/* Progress tracker */}
      <Card className="p-6">
        <h2 className="font-semibold mb-6">Order Progress</h2>
        <div className="hidden sm:block">
          <OrderStatusTracker status={order.status} orientation="horizontal" />
        </div>
        <div className="sm:hidden">
          <OrderStatusTracker status={order.status} orientation="vertical" />
        </div>
      </Card>

      {/* Items */}
      <Card className="p-5">
        <h2 className="font-semibold mb-3">Items</h2>
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
      </Card>

      {/* Smart Queue info */}
      <Card className="p-5">
        <h2 className="font-semibold mb-3">Smart Queue</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{ORDER_FLOW.indexOf(order.status) + 1}</p>
            <p className="text-xs text-muted-foreground">Your position</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">8</p>
            <p className="text-xs text-muted-foreground">Avg prep (min)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{order.estimatedPickupTime}</p>
            <p className="text-xs text-muted-foreground">Est. pickup</p>
          </div>
        </div>
      </Card>

      {/* Rating & Feedback */}
      {order.status === 'completed' && (
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Rate Your Experience</h2>
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">Thank you for your feedback!</p>
              <div className="mt-3 flex justify-center">
                <RatingStars rating={rating} size={24} />
              </div>
              {feedback && <p className="mt-2 text-sm text-muted-foreground">"{feedback}"</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">How was your order?</p>
                <RatingStars rating={rating} size={28} interactive onChange={setRating} />
              </div>
              <div>
                <Textarea
                  placeholder="Share your feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmitReview} disabled={rating === 0}>
                Submit Feedback
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
