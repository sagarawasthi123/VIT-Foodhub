import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { FoodItem } from '../types';
import { mockFoodItems } from '../data/mockData';

interface FavouritesContextValue {
  favouriteIds: string[];
  favourites: FoodItem[];
  toggleFavourite: (itemId: string) => void;
  isFavourite: (itemId: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextValue | undefined>(undefined);
const STORAGE_KEY = 'vit-foodhub-favourites';

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavouriteIds(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favouriteIds));
  }, [favouriteIds]);

  function toggleFavourite(itemId: string) {
    setFavouriteIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }

  const favourites = mockFoodItems.filter((f) => favouriteIds.includes(f.id));

  const value: FavouritesContextValue = {
    favouriteIds,
    favourites,
    toggleFavourite,
    isFavourite: (itemId) => favouriteIds.includes(itemId),
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
