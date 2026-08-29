import { Heart, Plus, Clock } from 'lucide-react';
import type { FoodItem } from '../../types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AvailabilityBadge, VegIndicator } from './Badges';
import { useCart } from '../../context/CartContext';
import { useFavourites } from '../../context/FavouritesContext';
import { cn } from '../../lib/utils';

interface FoodCardProps {
  item: FoodItem;
}

export function FoodCard({ item }: FoodCardProps) {
  const { addItem } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  const isFav = isFavourite(item.id);
  const disabled = item.availability === 'out_of_stock';

  return (
    <Card className="overflow-hidden p-0 transition-all hover:shadow-md">
      <div className="relative h-36 overflow-hidden bg-muted">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        <button
          onClick={() => toggleFavourite(item.id)}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur hover:bg-white transition-colors"
          aria-label="Toggle favourite"
        >
          <Heart
            className={cn(
              'h-4 w-4',
              isFav ? 'fill-red-500 text-red-500' : 'text-gray-500'
            )}
          />
        </button>
        <div className="absolute top-2 left-2">
          <VegIndicator type={item.type} />
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
          <span className="font-bold text-sm whitespace-nowrap">₹{item.price}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <AvailabilityBadge availability={item.availability} />
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {item.preparationTime}m
          </span>
        </div>
        <Button
          size="sm"
          className="w-full mt-3"
          disabled={disabled}
          onClick={() => addItem(item)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add to Cart
        </Button>
      </div>
    </Card>
  );
}
