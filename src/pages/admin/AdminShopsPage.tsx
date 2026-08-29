import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Store, Star } from 'lucide-react';
import { getAllShopsAdmin, createShop, updateShop, deleteShop } from '../../services/adminService';
import { getAllFoodCourtsAdmin } from '../../services/adminService';
import type { Shop, FoodCourt, CrowdLevel } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { CrowdBadge } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';

const emptyForm = {
  name: '',
  foodCourtId: '',
  category: '',
  contact: '',
  status: 'open' as 'open' | 'closed',
  crowd: 'low' as CrowdLevel,
  rating: 0,
  image: '',
};

export function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    load();
    getAllFoodCourtsAdmin().then(setFoodCourts);
  }, []);

  function load() {
    getAllShopsAdmin().then(setShops);
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, foodCourtId: foodCourts[0]?.id ?? '' });
    setDialogOpen(true);
  }

  function openEdit(shop: Shop) {
    setEditingId(shop.id);
    setForm({
      name: shop.name,
      foodCourtId: shop.foodCourtId,
      category: shop.category,
      contact: shop.contact,
      status: shop.status,
      crowd: shop.crowd,
      rating: shop.rating,
      image: shop.image,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.foodCourtId) return;
    if (editingId) {
      await updateShop(editingId, form);
    } else {
      await createShop(form);
    }
    setDialogOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    await deleteShop(id);
    load();
  }

  function fcName(id: string) {
    return foodCourts.find((fc) => fc.id === id)?.name ?? 'Unknown';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shops</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Shop
        </Button>
      </div>

      {shops.length === 0 ? (
        <EmptyState icon={<Store className="h-8 w-8" />} title="No shops" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Card key={shop.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{shop.name}</h3>
                <CrowdBadge crowd={shop.crowd} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{shop.category}</p>
              <p className="text-xs text-muted-foreground mt-1">{fcName(shop.foodCourtId)}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {shop.rating.toFixed(1)}
                </span>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${shop.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {shop.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(shop)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(shop.id)}>
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
            <DialogTitle>{editingId ? 'Edit Shop' : 'Add Shop'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Shop Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Food Court</Label>
              <Select value={form.foodCourtId} onValueChange={(v) => setForm({ ...form, foodCourtId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {foodCourts.map((fc) => (
                    <SelectItem key={fc.id} value={fc.id}>{fc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Contact</Label>
                <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'open' | 'closed' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Crowd Level</Label>
                <Select value={form.crowd} onValueChange={(v) => setForm({ ...form, crowd: v as CrowdLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
