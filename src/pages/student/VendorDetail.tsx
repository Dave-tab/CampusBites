import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Meal } from '../../types';
import {
  MapPin,
  Phone,
  Star,
  ShieldCheck,
  Plus,
  Check,
  ArrowLeft,
  Utensils,
  Info,
} from 'lucide-react';

export const VendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vendor = DataService.getVendorById(id || '');
  const meals = vendor ? DataService.getMealsByVendor(vendor.id) : [];

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [addedMealId, setAddedMealId] = useState<string | null>(null);

  const { addToCart } = useCart();
  const categories = DataService.getCategories();

  if (!vendor) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Vendor Not Found</h2>
        <p className="text-xs text-slate-500">The requested food vendor does not exist or has been removed.</p>
        <Link to="/student/vendors">
          <Button variant="outline" size="sm">Back to Vendors</Button>
        </Link>
      </div>
    );
  }

  const filteredMeals = meals.filter(
    (m) => selectedCategory === 'ALL' || m.category_id === selectedCategory
  );

  const handleAddToCart = (meal: Meal) => {
    addToCart(meal, vendor, 1);
    setAddedMealId(meal.id);
    setTimeout(() => setAddedMealId(null), 1500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Back Button */}
      <Link
        to="/student/vendors"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vendors List
      </Link>

      {/* Vendor Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="relative h-48 sm:h-64 bg-slate-900">
          <img
            src={vendor.banner_image}
            alt={vendor.business_name}
            loading="lazy"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge status={vendor.location_type} />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/90 text-white text-xs font-bold rounded-full backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Vendor
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {vendor.business_name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {vendor.description}
              </p>
            </div>
            {vendor.rating && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl shrink-0">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <div>
                  <span className="text-lg font-black text-amber-900">{vendor.rating}</span>
                  <span className="text-[10px] text-amber-700 block font-medium">Customer Rating</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Address / Location:</span>
                <span>{vendor.address}</span>
                {vendor.location_description && (
                  <span className="block text-slate-400 text-[11px] mt-0.5">
                    ({vendor.location_description})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Vendor Phone:</span>
                <span>{vendor.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Menu & Available Dishes</h2>
          <span className="text-xs font-semibold text-slate-500">{filteredMeals.length} meals</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            All Dishes ({meals.length})
          </button>
          {categories.map((cat) => {
            const count = meals.filter((m) => m.category_id === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeals.map((meal) => (
            <Card key={meal.id} className="overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                    src={meal.image_url}
                    alt={meal.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge status={meal.availability} />
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{meal.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{meal.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <div>
                  <span className="text-xs text-slate-400 block font-normal">Price</span>
                  <span className="text-base font-black text-slate-900">₦{meal.price.toLocaleString()}</span>
                </div>

                <Button
                  size="sm"
                  disabled={meal.availability === 'UNAVAILABLE'}
                  onClick={() => handleAddToCart(meal)}
                  className={addedMealId === meal.id ? 'bg-emerald-600 border-emerald-600' : ''}
                  leftIcon={
                    addedMealId === meal.id ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />
                  }
                >
                  {addedMealId === meal.id ? 'Added!' : 'Add to Cart'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-8 space-y-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                Customer Ratings & Reviews
              </h2>
              <p className="text-xs text-slate-500">
                Verified reviews from campus students who ordered from {vendor.business_name}
              </p>
            </div>
            {vendor.rating && (
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">{vendor.rating} / 5.0</span>
                <span className="text-[10px] text-slate-400 block">Overall Vendor Rating</span>
              </div>
            )}
          </div>

          {(() => {
            const reviews = DataService.getReviewsForVendor(vendor.id);
            if (reviews.length === 0) {
              return (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                  No student reviews submitted yet for {vendor.business_name}. Order a meal to leave the first review!
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <Card key={rev.id} className="p-4 space-y-2 border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          {rev.student_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{rev.student_name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-black text-xs text-amber-900">{rev.rating}.0</span>
                      </div>
                    </div>

                    {rev.meal_name && (
                      <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md inline-block">
                        Ordered: {rev.meal_name}
                      </div>
                    )}

                    <p className="text-xs text-slate-700 italic leading-relaxed">"{rev.comment}"</p>
                  </Card>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
