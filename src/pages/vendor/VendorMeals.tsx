import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Meal, MealAvailability } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Utensils, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Image as ImageIcon } from 'lucide-react';

export const VendorMeals: React.FC = () => {
  const { currentUser } = useAuth();
  const vendor = currentUser ? DataService.getVendorByOwnerId(currentUser.id) : undefined;

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Form states
  const [mealName, setMealName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [availability, setAvailability] = useState<MealAvailability>('AVAILABLE');

  const meals = vendor ? DataService.getMealsByVendor(vendor.id) : [];
  const categories = DataService.getCategories();

  if (!vendor) return null;

  const handleOpenAddModal = () => {
    setEditingMeal(null);
    setMealName('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80');
    setAvailability('AVAILABLE');
    setModalOpen(true);
  };

  const handleOpenEditModal = (meal: Meal) => {
    setEditingMeal(meal);
    setMealName(meal.name);
    setCategoryId(meal.category_id);
    setPrice(meal.price.toString());
    setDescription(meal.description);
    setImageUrl(meal.image_url);
    setAvailability(meal.availability);
    setModalOpen(true);
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName || !price || !categoryId) return;

    const numPrice = parseFloat(price);
    const catObj = categories.find((c) => c.id === categoryId);

    if (editingMeal) {
      DataService.saveMeal({
        ...editingMeal,
        name: mealName,
        category_id: categoryId,
        category_name: catObj?.name,
        price: numPrice,
        description,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
        availability,
      });
    } else {
      const newMeal: Meal = {
        id: `meal-${Date.now()}`,
        vendor_id: vendor.id,
        vendor_name: vendor.business_name,
        category_id: categoryId,
        category_name: catObj?.name,
        name: mealName,
        description,
        price: numPrice,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
        availability,
      };
      DataService.saveMeal(newMeal);
    }

    setModalOpen(false);
  };

  const handleToggleAvailability = (mealId: string) => {
    DataService.toggleMealAvailability(mealId);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteMeal = (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal item?')) {
      DataService.deleteMeal(mealId);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const filtered = meals.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-amber-600" /> Meal & Menu Management
          </h1>
          <p className="text-xs text-slate-500">
            Create, edit, change prices, and toggle meal availability for {vendor.business_name}
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Meal Item
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-900 rounded-xl outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      {/* Meals Grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-400 space-y-3">
          <p>No meals found in your menu.</p>
          <Button size="sm" variant="outline" onClick={handleOpenAddModal}>
            Add Meal Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((meal) => (
            <Card key={meal.id} className="overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img src={meal.image_url} alt={meal.name} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge status={meal.availability} />
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{meal.name}</h3>
                    <span className="text-base font-black text-slate-900">₦{meal.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{meal.description}</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  onClick={() => handleToggleAvailability(meal.id)}
                  className="text-xs font-semibold flex items-center gap-1 text-slate-700 hover:text-amber-600"
                >
                  {meal.availability === 'AVAILABLE' ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-600" /> Available
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" /> Unavailable
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(meal)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg"
                    title="Edit Meal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Meal Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMeal ? 'Edit Meal Item' : 'Add New Meal Item'}>
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <Input
            label="Meal Name*"
            placeholder="e.g. Party Jollof Rice with Peppered Chicken"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            required
          />

          <Select
            label="Food Category*"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            required
          />

          <Input
            label="Price (₦)*"
            type="number"
            placeholder="e.g. 1800"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe ingredients, taste profile, sides included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          <Input
            label="Meal Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            leftIcon={<ImageIcon className="w-4 h-4" />}
          />

          <Select
            label="Availability Status"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as MealAvailability)}
            options={[
              { value: 'AVAILABLE', label: 'AVAILABLE - Can be ordered' },
              { value: 'UNAVAILABLE', label: 'UNAVAILABLE - Hidden from ordering' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {editingMeal ? 'Save Changes' : 'Create Meal Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
