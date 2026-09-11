import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Store,
  ArrowRight,
  ArrowLeft,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cartItemsByVendor, cartSubtotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartCount === 0) {
    return (
      <div className="py-12 animate-in fade-in duration-200">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-slate-300" />}
          title="Your Cart is Empty"
          description="You haven't added any delicious meals to your cart yet. Explore vendors and discover what's cooking!"
          action={
            <Link to="/student/home">
              <Button leftIcon={<UtensilsCrossed className="w-4 h-4" />}>
                Explore Campus Meals
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
            Your Multi-Vendor Cart
          </h1>
          <p className="text-xs text-slate-500">
            {cartCount} item{cartCount === 1 ? '' : 's'} across {cartItemsByVendor.length} vendor
            {cartItemsByVendor.length === 1 ? '' : 's'}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Empty Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Grouped by Vendor */}
        <div className="lg:col-span-2 space-y-6">
          {cartItemsByVendor.map(({ vendor, items, subtotal }) => (
            <Card key={vendor.id} className="overflow-hidden border border-slate-200">
              {/* Vendor Section Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{vendor.business_name}</h3>
                    <p className="text-[10px] text-slate-500">{vendor.address}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Vendor Subtotal</span>
                  <span className="text-sm font-black text-slate-900">₦{subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 p-4 space-y-3">
                {items.map((item) => (
                  <div key={item.meal.id} className="flex items-center justify-between gap-3 pt-3 first:pt-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.meal.image_url}
                        alt={item.meal.name}
                        loading="lazy"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{item.meal.name}</h4>
                        <span className="text-xs font-semibold text-amber-700 block mt-0.5">
                          ₦{item.meal.price.toLocaleString()} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.meal.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 min-w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.meal.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-black text-slate-900 min-w-16 text-right">
                        ₦{(item.meal.price * item.quantity).toLocaleString()}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.meal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary & Checkout Sidebar */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4 bg-white border border-slate-200 sticky top-24">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Order Total Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">₦{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Vendors:</span>
                <span className="font-bold text-slate-900">{cartItemsByVendor.length} Vendors</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Delivery / Fee:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Calculated at Checkout</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Payable</span>
                <span className="text-xl font-black text-slate-900">₦{cartSubtotal.toLocaleString()}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/student/checkout')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>

            <Link
              to="/student/home"
              className="block text-center text-xs font-semibold text-slate-500 hover:text-amber-600"
            >
              ← Add More Items from Vendors
            </Link>

            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-[11px] text-amber-900 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Multi-Vendor Sub-Orders</span>
              </div>
              <p className="text-slate-600">
                When you place this order, sub-orders will be generated for each respective vendor so they can process your items independently!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
