import { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getFoodItemsByShop, updateFoodItem } from '../../services/shopService';
import type { FoodItem, Availability } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AvailabilityBadge, VegIndicator } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';

const SHOP_ID = 's1';

export function ShopkeeperInventoryPage() {
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  function loadItems() {
    getFoodItemsByShop(SHOP_ID).then(setItems);
  }

  async function changeAvailability(item: FoodItem, availability: Availability) {
    await updateFoodItem(item.id, { availability });
    loadItems();
  }

  const lowStock = items.filter((i) => i.availability === 'low_stock');
  const outOfStock = items.filter((i) => i.availability === 'out_of_stock');
  const available = items.filter((i) => i.availability === 'available');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground mt-1">Manage food availability and stock levels</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2"><CheckCircle2 className="h-6 w-6 text-green-600" /></div>
          <p className="text-2xl font-bold text-green-600">{available.length}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2"><AlertTriangle className="h-6 w-6 text-orange-500" /></div>
          <p className="text-2xl font-bold text-orange-500">{lowStock.length}</p>
          <p className="text-xs text-muted-foreground">Low Stock</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2"><Boxes className="h-6 w-6 text-red-600" /></div>
          <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </Card>
      </div>

      {/* Inventory table */}
      {items.length === 0 ? (
        <EmptyState icon={<Boxes className="h-8 w-8" />} title="No items" />
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <VegIndicator type={item.type} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{item.category}</td>
                  <td className="py-3">₹{item.price}</td>
                  <td className="py-3"><AvailabilityBadge availability={item.availability} /></td>
                  <td className="py-3">
                    <Select
                      value={item.availability}
                      onValueChange={(v) => changeAvailability(item, v as Availability)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
