import { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import { getFoodCourts } from '../../services/foodService';
import type { FoodCourt } from '../../types';
import { FoodCourtCard } from '../../components/common/FoodCourtCard';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';

export function FoodCourtsPage() {
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getFoodCourts().then(setFoodCourts);
  }, []);

  const filtered = foodCourts.filter(
    (fc) =>
      fc.name.toLowerCase().includes(search.toLowerCase()) ||
      fc.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Food Courts</h1>
        <p className="text-muted-foreground mt-1">Browse all food courts on campus</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search food courts..." className="max-w-md" />

      {filtered.length === 0 ? (
        <EmptyState icon={<Store className="h-8 w-8" />} title="No food courts found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fc) => (
            <FoodCourtCard key={fc.id} foodCourt={fc} />
          ))}
        </div>
      )}
    </div>
  );
}
