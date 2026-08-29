import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import { getFoodCourt, getShopsByFoodCourt } from '../../services/foodService';
import type { FoodCourt, Shop } from '../../types';
import { ShopCard } from '../../components/common/ShopCard';
import { EmptyState } from '../../components/common/EmptyState';

export function FoodCourtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [foodCourt, setFoodCourt] = useState<FoodCourt | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    if (!id) return;
    getFoodCourt(id).then((fc) => setFoodCourt(fc ?? null));
    getShopsByFoodCourt(id).then(setShops);
  }, [id]);

  if (!foodCourt) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/student/food-courts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Food Courts
        </Link>
        <h1 className="text-2xl font-bold">{foodCourt.name}</h1>
        <p className="text-muted-foreground mt-1">{foodCourt.location}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Shops ({shops.length})</h2>
        {shops.length === 0 ? (
          <EmptyState icon={<Store className="h-8 w-8" />} title="No shops in this food court" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
