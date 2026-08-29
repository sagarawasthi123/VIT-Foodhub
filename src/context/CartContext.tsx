import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { CartItem, FoodItem } from '../types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; item: FoodItem; quantity?: number }
  | { type: 'REMOVE'; itemId: string }
  | { type: 'INCREMENT'; itemId: string }
  | { type: 'DECREMENT'; itemId: string }
  | { type: 'CLEAR' };

const STORAGE_KEY = 'vit-foodhub-cart';

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.item.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.item.id === action.item.id
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { item: action.item, quantity: action.quantity ?? 1 }],
      };
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.item.id !== action.itemId) };
    case 'INCREMENT':
      return {
        items: state.items.map((i) =>
          i.item.id === action.itemId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case 'DECREMENT':
      return {
        items: state.items
          .map((i) =>
            i.item.id === action.itemId
              ? { ...i, quantity: i.quantity - 1 }
              : i
          )
          .filter((i) => i.quantity > 0),
      };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: FoodItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          parsed.forEach((ci) => dispatch({ type: 'ADD', item: ci.item, quantity: ci.quantity }));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.quantity * i.item.price,
    0
  );

  const value: CartContextValue = {
    items: state.items,
    totalItems,
    subtotal,
    addItem: (item, quantity) => dispatch({ type: 'ADD', item, quantity }),
    removeItem: (itemId) => dispatch({ type: 'REMOVE', itemId }),
    increment: (itemId) => dispatch({ type: 'INCREMENT', itemId }),
    decrement: (itemId) => dispatch({ type: 'DECREMENT', itemId }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
