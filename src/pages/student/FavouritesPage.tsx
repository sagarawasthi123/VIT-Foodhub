import { Heart, Trash2, Plus } from 'lucide-react';
import { useFavourites } from '../../context/FavouritesContext';
import { useCart } from '../../context/CartContext';
import { getShop } from '../../services/foodService';
import { useState, useEffect } from 'react';
import type { Shop } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/common/EmptyState';
import { VegIndicator } from '../../components/common/Badges';

export function FavouritesPage() {
  const { favourites, toggleFavourite } = useFavourites();
  const { addItem } = useCart();
  const [shopNames, setShopNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const shopIds = [...new Set(favourites.map((f) => f.shopId))];
    shopIds.forEach(async (id) => {
      const shop = await getShop(id);
      if (shop) setShopNames((prev) => ({ ...prev, [id]: shop.name }));
    });
  }, [favourites]);

  if (favourites.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Favourites</h1>
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="No favourites yet"
          description="Tap the heart icon on any food item to save it here for quick reordering."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Favourites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favourites.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex gap-3">
              <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{shopNames[item.shopId] ?? 'Shop'}</p>
                  </div>
                  <VegIndicator type={item.type} />
                </div>
                <p className="text-sm font-bold mt-1">₹{item.price}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="flex-1" onClick={() => addItem(item)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleFavourite(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
