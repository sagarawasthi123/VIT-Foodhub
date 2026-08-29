import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Store } from 'lucide-react';
import { getShop, getFoodItemsByShop } from '../../services/foodService';
import type { Shop, FoodItem } from '../../types';
import { FoodCard } from '../../components/common/FoodCard';
import { SearchBar } from '../../components/common/SearchBar';
import { CrowdBadge } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';

export function ShopMenuPage() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'veg' | 'non_veg'>('all');

  useEffect(() => {
    if (!id) return;
    getShop(id).then((s) => setShop(s ?? null));
    getFoodItemsByShop(id).then(setItems);
  }, [id]);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (!shop) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/student/food-courts/${shop.foodCourtId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to shops
        </Link>
      </div>

      {/* Shop header */}
      <div className="rounded-2xl overflow-hidden border">
        <div className="h-40 bg-muted relative">
          <img src={shop.image} alt={shop.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            <p className="text-sm text-white/80">{shop.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{shop.rating.toFixed(1)}</span>
          </div>
          <CrowdBadge crowd={shop.crowd} />
          <span
            className={`text-xs font-medium rounded-full px-2 py-0.5 ${
              shop.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {shop.status === 'open' ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search menu..." className="flex-1" />
        <div className="flex gap-2">
          {(['all', 'veg', 'non_veg'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                filter === f
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {f === 'all' ? 'All' : f === 'veg' ? 'Veg' : 'Non-Veg'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Store className="h-8 w-8" />} title="No items found" description="Try a different search or filter." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
