import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { getFoodItemsByShop, createFoodItem, updateFoodItem, deleteFoodItem } from '../../services/shopService';
import type { FoodItem, Availability, FoodType } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../components/ui/dialog';
import { AvailabilityBadge, VegIndicator } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';

const SHOP_ID = 's1';

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  category: '',
  type: 'veg' as FoodType,
  availability: 'available' as Availability,
  preparationTime: 10,
  image: '',
};

export function ShopkeeperMenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadItems();
  }, []);

  function loadItems() {
    getFoodItemsByShop(SHOP_ID).then(setItems);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: FoodItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      type: item.type,
      availability: item.availability,
      preparationTime: item.preparationTime,
      image: item.image,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || form.price <= 0) return;
    if (editingId) {
      await updateFoodItem(editingId, { ...form, shopId: SHOP_ID });
    } else {
      await createFoodItem({ ...form, shopId: SHOP_ID });
    }
    setDialogOpen(false);
    loadItems();
  }

  async function handleDelete(id: string) {
    await deleteFoodItem(id);
    loadItems();
  }

  async function toggleAvailability(item: FoodItem) {
    const next: Availability =
      item.availability === 'available' ? 'out_of_stock' : 'available';
    await updateFoodItem(item.id, { availability: next });
    loadItems();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<UtensilsCrossed className="h-8 w-8" />} title="No menu items" description="Add your first food item." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <VegIndicator type={item.type} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                  <p className="text-sm font-bold mt-1">₹{item.price}</p>
                  <div className="mt-1">
                    <AvailabilityBadge availability={item.availability} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleAvailability(item)}>
                  Toggle
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Item Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masala Dosa" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price (₹)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Prep Time (min)</Label>
                <Input type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="South Indian" />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as FoodType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Availability</Label>
              <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v as Availability })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Image URL</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? 'Save Changes' : 'Add Item'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
