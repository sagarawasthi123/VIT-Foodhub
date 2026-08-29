import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RatingStarsProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function RatingStars({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: RatingStarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(interactive && 'cursor-pointer hover:scale-110 transition-transform')}
        >
          <Star
            size={size}
            className={cn(
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}
