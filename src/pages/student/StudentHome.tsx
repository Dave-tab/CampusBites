import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import { Meal, Vendor } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  Utensils,
  Store,
  Plus,
  Check,
  Star,
  MapPin,
  Sparkles,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Zap,
  Flame,
  ShoppingBag,
  ShieldCheck,
  Bike,
  ChefHat,
  X,
  Compass,
  ChevronLeft,
} from 'lucide-react';

import jollofRiceImg from '../../assets/images/jollof_rice_1786625986094.jpg';
import amalaSoupImg from '../../assets/images/amala_soup_1786625999578.jpg';
import ewaAganyinImg from '../../assets/images/ewa_aganyin_dodo_1786681507247.jpg';
import afangSoupImg from '../../assets/images/afang_soup_swallow_1786681531076.jpg';
import catfishPepperSoupImg from '../../assets/images/catfish_pepper_soup_1786681518573.jpg';
import boliGrilledFishImg from '../../assets/images/boli_grilled_fish_1786681552486.jpg';
import gizdodoImg from '../../assets/images/gizdodo_plantain_gizzard_1786681542208.jpg';
import shawarmaImg from '../../assets/images/chicken_shawarma_1786626039847.jpg';

// Preset Campus Delivery Locations
const CAMPUS_LOCATIONS = [
  { id: 'hall1', name: 'Hall 1 Hostel', desc: 'Main Campus Quad' },
  { id: 'hall2', name: 'Hall 2 Hostel', desc: 'North Wing' },
  { id: 'med_hostel', name: 'Medical Hostel', desc: 'Health Sciences' },
  { id: 'sci_block', name: 'Science Complex', desc: 'Lecture Block B' },
  { id: 'eng_hall', name: 'Engineering Block', desc: 'Faculty Annex' },
  { id: 'library', name: 'University Central Library', desc: 'Study Hub' },
];

export const StudentHome: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<'ALL' | 'CAMPUS' | 'OFF_CAMPUS'>('ALL');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [addedMealId, setAddedMealId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Address Selector state
  const [deliveryLocation, setDeliveryLocation] = useState('Hall 1 Hostel, Main Campus');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Flash deal timer countdown simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 42, seconds: 18 });
  const [heroIndex, setHeroIndex] = useState(0);

  const POPULAR_HERO_DISHES = [
    {
      id: 'meal-1',
      name: 'Smokey Party Jollof Rice',
      subtitle: 'Firewood smoked with fried chicken & dodo',
      tag: 'Jollof Rice',
      price: 2200,
      image: jollofRiceImg,
      vendorName: 'Mama Cass Kitchen',
      badge: '🔥 Campus #1 Bestseller',
    },
    {
      id: 'meal-2',
      name: 'Special Amala Shoki (Abula)',
      subtitle: 'Smooth Gbegiri, Ewedu & assorted meat',
      tag: 'Abula Amala',
      price: 2200,
      image: amalaSoupImg,
      vendorName: 'Buka Express',
      badge: '🍲 Authentic Oyo Abula',
    },
    {
      id: 'meal-11',
      name: 'Ewa Aganyin + Dodo & Bread',
      subtitle: 'Rich spicy Aganyin sauce with sweet plantain',
      tag: 'Ewa Aganyin',
      price: 1800,
      image: ewaAganyinImg,
      vendorName: 'Mama Cass Kitchen',
      badge: '✨ Student Morning Fav',
    },
    {
      id: 'meal-13',
      name: 'Calabar Afang Soup + Swallow',
      subtitle: 'Ukazi, waterleaf, kpomo & goat meat',
      tag: 'Afang Soup',
      price: 2800,
      image: afangSoupImg,
      vendorName: 'Mama Cass Kitchen',
      badge: '👑 Rich Native Pot',
    },
    {
      id: 'meal-14',
      name: 'Fresh Catfish Pepper Soup',
      subtitle: 'Spicy Point & Kill broth with scent leaves',
      tag: 'Catfish Pepper Soup',
      price: 3000,
      image: catfishPepperSoupImg,
      vendorName: 'Mama Cass Kitchen',
      badge: '🌶️ Hot & Peppery',
    },
    {
      id: 'meal-15',
      name: 'Grilled Whole Fish + Boli',
      subtitle: 'Charcoal croaker with roasted sweet plantain',
      tag: 'Boli & Fish',
      price: 3500,
      image: boliGrilledFishImg,
      vendorName: 'Campus Grills & Shawarma',
      badge: '🔥 Charcoal Special',
    },
    {
      id: 'meal-12',
      name: 'Gizdodo Peppered Bowl',
      subtitle: 'Spicy chicken gizzards tossed in sweet dodo',
      tag: 'Gizdodo',
      price: 2200,
      image: gizdodoImg,
      vendorName: 'Mama Cass Kitchen',
      badge: '⭐ Crowd Pleaser',
    },
    {
      id: 'meal-7',
      name: 'Double Sausage Shawarma',
      subtitle: 'Loaded grilled chicken, sausage & garlic mayo',
      tag: 'Shawarma',
      price: 2500,
      image: shawarmaImg,
      vendorName: 'Campus Grills & Shawarma',
      badge: '🌯 Giant Wrap',
    },
  ];

  const { addToCart, cartCount } = useCart();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  // Hero dish rotation interval
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % POPULAR_HERO_DISHES.length);
    }, 4500);
    return () => clearInterval(heroTimer);
  }, []);

  useEffect(() => {
    // Simulate initial network fetch
    const loadData = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(loadData);
  }, []);

  useEffect(() => {
    const handleStorage = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Flash deal countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = DataService.getCategories();
  const approvedVendors = DataService.getApprovedVendors();
  const availableMeals = DataService.getAvailableMeals();

  // Active student orders
  const studentOrders = currentUser ? DataService.getOrdersByStudent(currentUser.id) : [];
  const activeOrders = studentOrders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const isSearching = searchQuery.trim().length > 0 || selectedCategory !== 'ALL';

  // Filter meals
  const filteredMeals = availableMeals.filter((m) => {
    const matchesSearch =
      !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (m.vendor_name && m.vendor_name.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (m.category_name && m.category_name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesCategory = selectedCategory === 'ALL' || m.category_id === selectedCategory;

    const vendor = approvedVendors.find((v) => v.id === m.vendor_id);
    const matchesLocation =
      selectedLocation === 'ALL' || (vendor && vendor.location_type === selectedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Matching Vendors when searching
  const matchingVendors = searchQuery.trim().length > 0
    ? approvedVendors.filter((v) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = v.business_name.toLowerCase().includes(query);
        const matchesDesc = v.description.toLowerCase().includes(query);
        const matchesAddr = v.address.toLowerCase().includes(query);
        const matchesLoc = selectedLocation === 'ALL' || v.location_type === selectedLocation;
        return (matchesName || matchesDesc || matchesAddr) && matchesLoc;
      })
    : [];

  // Featured Flash Deal Meals (First 3 meals with discount calculation)
  const flashDealMeals = availableMeals.slice(0, 3).map((m, idx) => ({
    ...m,
    discountPercent: [25, 20, 15][idx % 3],
    originalPrice: Math.round(m.price * (1 + [0.25, 0.2, 0.15][idx % 3])),
  }));

  const handleAddToCart = (meal: Meal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vendor = DataService.getVendorById(meal.vendor_id);
    if (!vendor) return;

    addToCart(meal, vendor, selectedQuantity);
    setAddedMealId(meal.id);
    setTimeout(() => setAddedMealId(null), 1500);
    setSelectedMeal(null);
    setSelectedQuantity(1);
  };

  // Category Icon Mapping for Glovo Bubbles
  const getCategoryBubbleStyle = (catId: string, index: number) => {
    switch (catId) {
      case 'cat-1':
        return { bg: 'from-amber-500 to-orange-600', icon: '🍚', ring: 'ring-amber-400' };
      case 'cat-2':
        return { bg: 'from-emerald-600 to-teal-700', icon: '🍲', ring: 'ring-emerald-400' };
      case 'cat-3':
        return { bg: 'from-red-600 to-orange-600', icon: '🍢', ring: 'ring-red-400' };
      case 'cat-4':
        return { bg: 'from-amber-600 to-yellow-600', icon: '🥘', ring: 'ring-yellow-400' };
      case 'cat-5':
        return { bg: 'from-orange-400 to-amber-500', icon: '🥟', ring: 'ring-orange-400' };
      case 'cat-6':
        return { bg: 'from-cyan-600 to-blue-600', icon: '🥤', ring: 'ring-cyan-400' };
      default: {
        const styles = [
          { bg: 'from-amber-400 to-amber-600', icon: '🍛', ring: 'ring-amber-400' },
          { bg: 'from-orange-500 to-red-500', icon: '🍲', ring: 'ring-orange-400' },
          { bg: 'from-emerald-400 to-teal-600', icon: '🥤', ring: 'ring-emerald-400' },
          { bg: 'from-rose-500 to-pink-600', icon: '🍢', ring: 'ring-rose-400' },
          { bg: 'from-indigo-500 to-purple-600', icon: '🥘', ring: 'ring-indigo-400' },
        ];
        return styles[index % styles.length];
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* Glovo-Style Energetic Hero Canvas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white p-6 sm:p-12 shadow-2xl">
        {/* Background Decorative Circles */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-10 -bottom-20 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Search */}
          <div className="lg:col-span-7 space-y-5">
            {/* Campus Location Bar */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30 shadow-xs">
              <MapPin className="w-4 h-4 text-amber-200 animate-bounce" />
              <span>Deliver to:</span>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="underline hover:text-amber-100 flex items-center gap-1 font-extrabold cursor-pointer"
              >
                {deliveryLocation} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Authentic Nigerian meals,{' '}
              <span className="text-amber-200 underline decoration-amber-300/60 decoration-wavy">
                delivered across campus.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-amber-100 font-medium max-w-xl leading-relaxed">
              Order Smokey Jollof, Hot Abula, Ewa Aganyin, Catfish Pepper Soup, Boli & Grilled Fish directly from campus kitchens to your hostel or lecture block.
            </p>

            {/* Glovo Search Input & Search Action Form */}
            <div className="relative max-w-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="relative flex items-center"
              >
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search food, vendors, or soup (e.g. Amala, Ewa Aganyin, Afang, Boli, Suya)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-900 placeholder-slate-400 text-sm font-medium rounded-2xl shadow-xl border-0 focus:ring-4 focus:ring-amber-300 outline-none transition-all"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Popular Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <span className="text-[11px] text-amber-200 font-bold">Popular:</span>
              {['Jollof Rice', 'Abula Amala', 'Ewa Aganyin', 'Afang Soup', 'Catfish Pepper Soup', 'Boli & Fish', 'Gizdodo', 'Shawarma'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    setSelectedCategory('ALL');
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
                      ? 'bg-white text-amber-900 shadow-xs scale-105'
                      : 'bg-black/20 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick Hero Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <Zap className="w-4 h-4 text-amber-300" /> ~15 Min Campus Express
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified Kitchens Only
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <ShoppingBag className="w-4 h-4 text-rose-300" /> Multi-Vendor Cart
              </span>
            </div>
          </div>

          {/* Right Floating Food Graphics (Authentic Nigerian Campus Favorites Showcase) */}
          <div className="lg:col-span-5 relative hidden sm:flex flex-col justify-center items-center min-h-[300px]">
            {/* Main Floating Food Card */}
            {(() => {
              const currentHeroDish = POPULAR_HERO_DISHES[heroIndex];
              const matchedMeal = availableMeals.find((m) => m.id === currentHeroDish.id) || availableMeals[0];

              return (
                <div
                  className="relative z-10 bg-white text-slate-900 p-4 rounded-3xl shadow-2xl border border-amber-100 max-w-sm w-full space-y-3.5 hover:-translate-y-1 transition-all duration-300 group"
                  onClick={() => matchedMeal && setSelectedMeal(matchedMeal)}
                >
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                    <img
                      src={currentHeroDish.image}
                      alt={currentHeroDish.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span>{currentHeroDish.badge}</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                      {heroIndex + 1} of {POPULAR_HERO_DISHES.length}
                    </div>

                    {/* Prev / Next controls */}
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeroIndex(
                            (prev) => (prev - 1 + POPULAR_HERO_DISHES.length) % POPULAR_HERO_DISHES.length
                          );
                        }}
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center pointer-events-auto transition-colors cursor-pointer"
                        title="Previous Popular Dish"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeroIndex((prev) => (prev + 1) % POPULAR_HERO_DISHES.length);
                        }}
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center pointer-events-auto transition-colors cursor-pointer"
                        title="Next Popular Dish"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                      <span className="bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-amber-200">
                        {currentHeroDish.vendorName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                        {currentHeroDish.name}
                      </h4>
                      <span className="text-amber-600 font-black text-sm">
                        ₦{currentHeroDish.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                      {currentHeroDish.subtitle}
                    </p>
                  </div>

                  {/* Actions & Pagination Dots */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    {/* Dots */}
                    <div className="flex items-center gap-1">
                      {POPULAR_HERO_DISHES.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroIndex(i);
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            heroIndex === i ? 'w-5 bg-amber-600' : 'w-1.5 bg-slate-200 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>

                    {matchedMeal && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(matchedMeal, e);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer ${
                          addedMealId === matchedMeal.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        {addedMealId === matchedMeal.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Quick Add</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Small Floating Badge Top-Right */}
            <div className="absolute -top-3 -right-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-bold z-20 hover:scale-105 transition-all duration-300">
              <Bike className="w-4 h-4 text-amber-400" />
              <span>Express Delivery Active</span>
            </div>

            {/* Small Floating Badge Bottom-Left */}
            <div className="absolute -bottom-3 -left-3 bg-emerald-700 text-white px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold z-20 hover:scale-105 transition-all duration-300">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>100% Verified Kitchens</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-12 animate-pulse pt-4">
          {/* Categories Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-48" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-slate-200 rounded-full shrink-0" />
                  <div className="w-16 h-3 bg-slate-200 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Meals/Vendors Grid Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl h-72 flex flex-col p-4 space-y-4">
                  <div className="w-full h-32 bg-slate-200 rounded-2xl" />
                  <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
                  <div className="w-1/2 h-4 bg-slate-200 rounded-md" />
                  <div className="mt-auto flex justify-between items-center">
                    <div className="w-1/3 h-6 bg-slate-200 rounded-md" />
                    <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isSearching ? (
        /* ================= SEARCH RESULTS VIEW (Immediately Visible, Hides unrequested sections) ================= */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Search Results Summary & Refinement Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {searchQuery.trim() ? (
                      <>Search Results for <span className="text-amber-600 font-black">"{searchQuery}"</span></>
                    ) : (
                      <>Craving Category: <span className="text-amber-600 font-black">{categories.find(c => c.id === selectedCategory)?.name || 'Selected Craving'}</span></>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Found {filteredMeals.length} meal{filteredMeals.length === 1 ? '' : 's'}
                    {matchingVendors.length > 0 && ` and ${matchingVendors.length} matching vendor${matchingVendors.length === 1 ? '' : 's'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedLocation('ALL');
                  }}
                  leftIcon={<X className="w-4 h-4" />}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  Clear Search & View All
                </Button>
              </div>
            </div>

            {/* Category and Location refinement pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-bold scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Location Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedLocation('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedLocation === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Stalls
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLocation('CAMPUS')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedLocation === 'CAMPUS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  On Campus
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLocation('OFF_CAMPUS')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedLocation === 'OFF_CAMPUS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Off Campus
                </button>
              </div>
            </div>
          </div>

          {/* Matching Vendors Strip (if vendors match query) */}
          {matchingVendors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" />
                Matching Campus Vendors ({matchingVendors.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {matchingVendors.map((vendor) => (
                  <Link key={vendor.id} to={`/student/vendors/${vendor.id}`}>
                    <Card className="p-3.5 hover:border-amber-400 group transition-all flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={vendor.banner_image}
                          alt={vendor.business_name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 truncate">
                          {vendor.business_name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{vendor.address}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ★ {vendor.rating || 4.8}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {vendor.location_type === 'CAMPUS' ? 'On-Campus' : 'Off-Campus'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Meals Results Grid */}
          {filteredMeals.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-600" />
                Matching Meals ({filteredMeals.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMeals.map((meal) => (
                  <Card
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal)}
                    className="overflow-hidden group flex flex-col justify-between hover:shadow-xl transition-all duration-300 border-slate-200/80 cursor-pointer"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={meal.image_url}
                          alt={meal.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          {meal.category_name || 'Meal'}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                            {meal.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{meal.description}</p>
                        <p className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                          by {meal.vendor_name}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                      <div>
                        <span className="text-xs text-slate-400 block font-normal">Price</span>
                        <span className="text-base font-black text-slate-900">₦{meal.price.toLocaleString()}</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(meal, e)}
                        className={addedMealId === meal.id ? 'bg-emerald-600 border-emerald-600' : ''}
                        leftIcon={addedMealId === meal.id ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      >
                        {addedMealId === meal.id ? 'Added!' : 'Add to Cart'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : matchingVendors.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Utensils className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">No dishes or vendors matched "{searchQuery}"</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any campus meals or kitchens matching that keyword. Try one of our popular searches below:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['Jollof', 'Shawarma', 'Amala', 'Chicken', 'Smoothie', 'Fried Rice', 'Mama Cass'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setSearchQuery(sug);
                      setSelectedCategory('ALL');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    🔍 {sug}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedLocation('ALL');
                  }}
                >
                  Clear Search & View Full Menu
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* ================= FULL DISCOVERY HOME VIEW (When not actively searching) ================= */
        <>
          {/* Glovo Signature Interactive Category Bubbles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600" />
                  Explore Cravings
                </h2>
                <p className="text-xs text-slate-500 font-medium">Tap any category to filter instantly</p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setSelectedLocation('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedLocation === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All Locations
                </button>
                <button
                  onClick={() => setSelectedLocation('CAMPUS')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedLocation === 'CAMPUS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  On Campus
                </button>
                <button
                  onClick={() => setSelectedLocation('OFF_CAMPUS')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedLocation === 'OFF_CAMPUS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Off Campus
                </button>
              </div>
            </div>

            {/* Glovo Circular Bubbles Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 pt-2">
              {/* "All Items" Bubble */}
              <div
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 text-center ${
                  selectedCategory === 'ALL' && !searchQuery
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg ring-2 ring-slate-900 ring-offset-2'
                    : 'bg-white text-slate-800 border-slate-200/80 hover:border-amber-300 hover:shadow-md'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-2xl flex items-center justify-center shadow-md">
                  ✨
                </div>
                <span className="text-xs font-extrabold line-clamp-1">All Cravings</span>
                <span className="text-[10px] opacity-75 font-semibold">({availableMeals.length})</span>
              </div>

              {/* Dynamic Category Bubbles */}
              {categories.map((cat, idx) => {
                const style = getCategoryBubbleStyle(cat.id, idx);
                const isSelected = selectedCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 text-center ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-lg ring-2 ring-amber-500 ring-offset-2'
                        : 'bg-white text-slate-800 border-slate-200/80 hover:border-amber-300 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${style.bg} text-2xl flex items-center justify-center shadow-md`}
                    >
                      {style.icon}
                    </div>
                    <span className="text-xs font-extrabold line-clamp-1">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{cat.meal_count || 10}+ items</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact Active Order Status Bar (keeps home page clean & focused on discovery) */}
          {activeOrders.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-3 sm:p-4 px-4 sm:px-5 shadow-lg border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-amber-400 text-xs">{activeOrders[0].order_reference}</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md uppercase">
                      {activeOrders[0].status.replace(/_/g, ' ')}
                    </span>
                    {activeOrders.length > 1 && (
                      <span className="text-[10px] text-amber-200 font-bold bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-500/20">
                        +{activeOrders.length - 1} more active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">
                    {activeOrders[0].status === 'CONFIRMED' && '🎉 Order confirmed directly by vendor! Kitchen prep starting.'}
                    {activeOrders[0].status === 'PREPARING' && '🍳 Kitchen vendors are actively preparing your food fresh.'}
                    {activeOrders[0].status === 'READY_FOR_PICKUP' && '🎒 Ready for pickup at vendor stall!'}
                    {activeOrders[0].status === 'OUT_FOR_DELIVERY' && '🛵 Dispatch rider en route to your campus block!'}
                    {activeOrders[0].status === 'PENDING' && '⏳ Order received. Awaiting vendor confirmation.'}
                  </p>
                </div>
              </div>

              <Link to={`/student/orders/${activeOrders[0].id}`} className="shrink-0 self-end sm:self-auto">
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                  <span>Track Live Status Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}

          {/* Glovo "Flash Deals" Live Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white">
                  <Flame className="w-6 h-6 text-yellow-300 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">🔥 Flash Deals & Campus Combos</h2>
                  <p className="text-xs text-rose-100 font-medium">Limited time meal discounts from top campus vendors</p>
                </div>
              </div>

              {/* Countdown Clock */}
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-200 border border-white/10 self-start sm:self-auto">
                <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>
                  Ends in: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Flash Deals Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashDealMeals.map((meal) => (
                <Card
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal)}
                  className="p-4 border border-rose-100 hover:border-rose-400 group relative overflow-hidden bg-gradient-to-b from-rose-50/30 to-white cursor-pointer"
                >
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={meal.image_url}
                      alt={meal.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" /> {meal.discountPercent}% OFF
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-rose-600 transition-colors line-clamp-1">
                        {meal.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{meal.description}</p>
                    <p className="text-[11px] font-bold text-amber-700">by {meal.vendor_name}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-rose-600">₦{meal.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 line-through">₦{meal.originalPrice.toLocaleString()}</span>
                      </div>

                      <Button
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700 border-rose-600"
                        onClick={(e) => handleAddToCart(meal, e)}
                        leftIcon={addedMealId === meal.id ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      >
                        {addedMealId === meal.id ? 'Added' : 'Grab Deal'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Verified Campus Vendors Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-600" />
                  Verified Campus Vendors
                </h2>
                <p className="text-xs text-slate-500 font-medium">Administrator-vetted campus kitchens and food stalls</p>
              </div>
              <Link
                to="/student/vendors"
                className="text-xs font-extrabold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                View All ({approvedVendors.length}) <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedVendors.map((vendor) => (
                <Link key={vendor.id} to={`/student/vendors/${vendor.id}`}>
                  <Card className="h-full hover:border-amber-400 group overflow-hidden transition-all hover:shadow-lg">
                    <div className="relative h-36 overflow-hidden bg-slate-100">
                      <img
                        src={vendor.banner_image}
                        alt={vendor.business_name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <Badge status={vendor.location_type} />
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                          {vendor.business_name}
                        </h3>
                        {vendor.rating && (
                          <span className="flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {vendor.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{vendor.description}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{vendor.address}</span>
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Available Meals Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Available Meals</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Showing {filteredMeals.length} dish{filteredMeals.length === 1 ? '' : 'es'}
                </p>
              </div>
            </div>

            {filteredMeals.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No meals found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try adjusting your search or resetting category & location filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedLocation('ALL');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMeals.map((meal) => (
                  <Card
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal)}
                    className="overflow-hidden group flex flex-col justify-between hover:shadow-xl transition-all duration-300 border-slate-200/80 cursor-pointer"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={meal.image_url}
                          alt={meal.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          {meal.category_name || 'Meal'}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                            {meal.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{meal.description}</p>
                        <p className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                          by {meal.vendor_name}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                      <div>
                        <span className="text-xs text-slate-400 block font-normal">Price</span>
                        <span className="text-base font-black text-slate-900">₦{meal.price.toLocaleString()}</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(meal, e)}
                        className={addedMealId === meal.id ? 'bg-emerald-600 border-emerald-600' : ''}
                        leftIcon={addedMealId === meal.id ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      >
                        {addedMealId === meal.id ? 'Added!' : 'Add to Cart'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* How CampusBites Works (Glovo Animated Pipeline) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Simple & Fast</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">How CampusBites Works</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Get your favourite campus meals delivered in three quick steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-black">
                  1
                </div>
                <h3 className="font-black text-white text-base">Select Your Craving</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Browse 15+ verified campus vendors or combine dishes from multiple spots into one single cart.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-black">
                  2
                </div>
                <h3 className="font-black text-white text-base">Vendors Prepare Fresh</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Your order is immediately sent to campus kitchens for fresh, hygienic preparation.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-black">
                  3
                </div>
                <h3 className="font-black text-white text-base">Express Hostel Delivery</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Campus dispatch riders deliver directly to your hall door or lecture hall with live updates.
                </p>
              </div>
            </div>
          </div>

          {/* Dual Partner Banner (Courier Rider & Vendor Join CTA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rider Banner - High-contrast, crystal clear typography & connected to Rider Registration Console */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white space-y-5 shadow-xl relative overflow-hidden border border-amber-400/30">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 shadow-md flex items-center justify-center">
                  <Bike className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 backdrop-blur-xs text-amber-200 px-3 py-1 rounded-full border border-white/15">
                  Fleet Onboarding
                </span>
              </div>

              <div className="space-y-1.5 relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Become a Campus Rider</h3>
                <p className="text-xs text-amber-50 font-medium leading-relaxed">
                  Earn steady student income delivering food to fellow students across hostels with complete schedule flexibility.
                </p>
              </div>

              {/* Quick Perks Chips */}
              <div className="flex flex-wrap gap-2 text-[11px] font-bold relative z-10">
                <span className="bg-black/25 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg border border-white/10">
                  💰 ₦1,000+ per delivery
                </span>
                <span className="bg-black/25 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg border border-white/10">
                  ⚡ Instant Payouts
                </span>
                <span className="bg-black/25 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg border border-white/10">
                  🚴 Any Ride (Bicycle/Foot)
                </span>
              </div>

              <div className="pt-2 relative z-10">
                <Link to="/rider/registration" className="inline-block">
                  <button
                    type="button"
                    className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 hover:gap-3 cursor-pointer group"
                  >
                    <span>Launch Rider Registration Console</span>
                    <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Vendor Partner Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white space-y-5 shadow-xl border border-slate-700/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                  Partner Kitchens
                </span>
              </div>

              <div className="space-y-1.5 relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Own a Campus Food Spot?</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Grow your sales and reach thousands of students on campus by joining as an administrator-vetted vendor.
                </p>
              </div>

              {/* Quick Perks Chips */}
              <div className="flex flex-wrap gap-2 text-[11px] font-bold relative z-10">
                <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                  📈 3x More Daily Orders
                </span>
                <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                  🍲 Multi-Vendor Stalls
                </span>
                <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                  📊 Real-time Analytics
                </span>
              </div>

              <div className="pt-2 relative z-10">
                <Link to="/vendor/application" className="inline-block">
                  <button
                    type="button"
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 hover:gap-3 cursor-pointer group"
                  >
                    <span>Register Your Kitchen</span>
                    <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Campus Location Selection Modal */}
      <Modal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} title="Select Delivery Address">
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">Choose your primary hostel hall or campus building:</p>

          <div className="space-y-2">
            {CAMPUS_LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  setDeliveryLocation(`${loc.name}, ${loc.desc}`);
                  setIsLocationModalOpen(false);
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{loc.name}</h4>
                    <p className="text-[11px] text-slate-500">{loc.desc}</p>
                  </div>
                </div>
                {deliveryLocation.includes(loc.name) && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Meal Detail Modal */}
      <Modal isOpen={!!selectedMeal} onClose={() => setSelectedMeal(null)} maxWidth="lg">
        {selectedMeal && (
          <div className="space-y-4">
            <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100 -mt-2">
              <img src={selectedMeal.image_url} alt={selectedMeal.name} loading="lazy" className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  {selectedMeal.category_name}
                </span>
                <span className="text-lg font-black text-slate-900">₦{selectedMeal.price.toLocaleString()}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedMeal.name}</h3>
              <p className="text-xs font-medium text-slate-500">Prepared by {selectedMeal.vendor_name}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedMeal.description}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
              <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  -
                </button>
                <span className="text-sm font-bold text-slate-900 min-w-6 text-center">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={() => handleAddToCart(selectedMeal)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Add {selectedQuantity} to Cart (₦{(selectedMeal.price * selectedQuantity).toLocaleString()})
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

