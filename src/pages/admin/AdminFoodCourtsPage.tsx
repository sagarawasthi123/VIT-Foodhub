import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin } from 'lucide-react';
import { getAllFoodCourtsAdmin, createFoodCourt, updateFoodCourt, deleteFoodCourt } from '../../services/adminService';
import type { FoodCourt, CrowdLevel } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { CrowdBadge } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';

const emptyForm = {
  name: '',
  location: '',
  description: '',
  status: 'open' as 'open' | 'closed',
  crowd: 'low' as CrowdLevel,
};

export function AdminFoodCourtsPage() {
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    load();
  }, []);

  function load() {
    getAllFoodCourtsAdmin().then(setFoodCourts);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(fc: FoodCourt) {
    setEditingId(fc.id);
    setForm({
      name: fc.name,
      location: fc.location,
      description: fc.description,
      status: fc.status,
      crowd: fc.crowd,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name) return;
    if (editingId) {
      await updateFoodCourt(editingId, form);
    } else {
      await createFoodCourt(form);
    }
    setDialogOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    await deleteFoodCourt(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Food Courts</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Food Court
        </Button>
      </div>

      {foodCourts.length === 0 ? (
        <EmptyState icon={<Building2 className="h-8 w-8" />} title="No food courts" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodCourts.map((fc) => (
            <Card key={fc.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{fc.name}</h3>
                <CrowdBadge crowd={fc.crowd} />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {fc.location}
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{fc.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm">{fc.shopCount} shops</span>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${fc.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {fc.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(fc)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(fc.id)}>
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
            <DialogTitle>{editingId ? 'Edit Food Court' : 'Add Food Court'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Food Court Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
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
