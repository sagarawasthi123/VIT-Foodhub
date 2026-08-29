import { Link } from 'react-router-dom';
import { MapPin, Store } from 'lucide-react';
import type { FoodCourt } from '../../types';
import { Card } from '../ui/card';
import { CrowdBadge } from './Badges';

interface FoodCourtCardProps {
  foodCourt: FoodCourt;
}

export function FoodCourtCard({ foodCourt }: FoodCourtCardProps) {
  return (
    <Link to={`/student/food-courts/${foodCourt.id}`}>
      <Card className="overflow-hidden p-0 transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <Store className="h-12 w-12 text-white" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{foodCourt.name}</h3>
            <CrowdBadge crowd={foodCourt.crowd} />
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {foodCourt.location}
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{foodCourt.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium">{foodCourt.shopCount} Shops</span>
            <span
              className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                foodCourt.status === 'open'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {foodCourt.status === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
