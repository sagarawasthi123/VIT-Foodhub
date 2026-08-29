import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Heart, Clock, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavourites } from '../../context/FavouritesContext';
import { getFoodCourts, getAllFoodItems } from '../../services/foodService';
import { getOrdersByUser as getOrders } from '../../services/orderService';
import type { FoodCourt, FoodItem, Order } from '../../types';

function filterItems(items: FoodItem[], query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter(
    (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );
}
import { FoodCourtCard } from '../../components/common/FoodCourtCard';
import { FoodCard } from '../../components/common/FoodCard';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/common/Badges';

export function StudentHomePage() {
  const { user } = useAuth();
  const { favourites } = useFavourites();
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [popularItems, setPopularItems] = useState<FoodItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getFoodCourts().then(setFoodCourts);
    getAllFoodItems().then((items) => setPopularItems(items.slice(0, 8)));
    if (user) {
      getOrders(user.id).then((orders) => {
        const active = orders.find((o) =>
          ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)
        );
        if (active) setActiveOrder(active);
      });
    }
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Hi, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">What would you like to eat today?</p>
      </div>

      {/* Search */}
      <div className="max-w-xl">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search for dosa, biryani, coffee..."
          className="w-full"
        />
      </div>

      {/* Search results */}
      {search.trim() && (
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Search Results ({filterItems(popularItems, search).length})
          </h2>
          {filterItems(popularItems, search).length === 0 ? (
            <EmptyState icon={<UtensilsCrossed className="h-8 w-8" />} title="No items found" description="Try a different search term." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterItems(popularItems, search).map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Active order quick access */}
      {activeOrder && (
        <Link to={`/student/orders/${activeOrder.id}`}>
          <Card className="p-4 border-primary/30 bg-primary/5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Active Order #{activeOrder.id}</p>
              <p className="text-xs text-muted-foreground">
                {activeOrder.shopName} · Pickup at {activeOrder.estimatedPickupTime}
              </p>
            </div>
            <StatusBadge status={activeOrder.status} />
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </Link>
      )}

      {/* Food Courts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Food Courts
          </h2>
          <Link to="/student/food-courts" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodCourts.map((fc) => (
            <FoodCourtCard key={fc.id} foodCourt={fc} />
          ))}
        </div>
      </section>

      {/* Popular Items */}
      {!search.trim() && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" /> Popular Items
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Favourites */}
      {!search.trim() && <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" /> Your Favourites
          </h2>
          <Link to="/student/favourites" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {favourites.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-8 w-8" />}
            title="No favourites yet"
            description="Tap the heart icon on food items to save them here."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favourites.slice(0, 4).map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>}
    </div>
  );
}
