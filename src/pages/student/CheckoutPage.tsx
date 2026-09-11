import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { DataService } from '../../services/dataService';
import { FulfillmentMethod } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  FileText,
  Building,
  CheckCircle2,
  ArrowLeft,
  Store,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { cartItems, cartItemsByVendor, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('DELIVERY');
  const [deliveryLocation, setDeliveryLocation] = useState('Fajuyi Hall of Residence, Block C, Room 102');
  const [locationDescription, setLocationDescription] = useState('1st Floor, Right Wing near Common Room');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+234 801 234 5678');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Please call upon arrival at hall gate.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/student/home">
          <Button size="sm">Explore Meals</Button>
        </Link>
      </div>
    );
  }

  const deliveryFee = fulfillmentMethod === 'DELIVERY' ? 300 : 0;
  const finalTotal = cartSubtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!currentUser) return;

    if (fulfillmentMethod === 'DELIVERY' && (!deliveryLocation || !contactPhone)) {
      setErrorMsg('Please enter your delivery location and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const order = DataService.createMultiVendorOrder({
        student_id: currentUser.id,
        student_name: currentUser.full_name,
        student_phone: contactPhone,
        fulfillment_method: fulfillmentMethod,
        cartItems,
        delivery_details:
          fulfillmentMethod === 'DELIVERY'
            ? {
                delivery_location: deliveryLocation,
                location_description: locationDescription,
                contact_phone: contactPhone,
                delivery_instructions: deliveryInstructions,
              }
            : undefined,
      });

      clearCart();
      setIsSubmitting(false);
      navigate(`/student/orders/${order.id}/confirmation`);
    } catch (err) {
      console.error('Error placing order:', err);
      setIsSubmitting(false);
      setErrorMsg('An error occurred while placing your order. Please try again.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <Link to="/student/cart" className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout Order</h1>
          <p className="text-xs text-slate-500">Select fulfillment method and confirm delivery details</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fulfillment Method Selector */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" />
              1. Choose Fulfillment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setFulfillmentMethod('DELIVERY')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  fulfillmentMethod === 'DELIVERY'
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600" /> Campus Delivery
                  </span>
                  <input
                    type="radio"
                    checked={fulfillmentMethod === 'DELIVERY'}
                    onChange={() => setFulfillmentMethod('DELIVERY')}
                    className="accent-amber-600 w-4 h-4"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Delivered directly to your hostel, hall of residence, or department on campus (+₦300 delivery fee).
                </p>
              </div>

              <div
                onClick={() => setFulfillmentMethod('CAMPUS_PICKUP')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  fulfillmentMethod === 'CAMPUS_PICKUP'
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-600" /> Campus Pickup
                  </span>
                  <input
                    type="radio"
                    checked={fulfillmentMethod === 'CAMPUS_PICKUP'}
                    onChange={() => setFulfillmentMethod('CAMPUS_PICKUP')}
                    className="accent-amber-600 w-4 h-4"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pick up your order in person from the vendor stall(s) when ready. No extra delivery fee.
                </p>
              </div>
            </div>
          </Card>

          {/* Delivery Information Form */}
          {fulfillmentMethod === 'DELIVERY' && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                2. Delivery Location Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Delivery Location (Hall / Hostel / Block / Room)*"
                  placeholder="e.g. Fajuyi Hall, Block B, Room 204"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                />

                <Input
                  label="Location Description / Landmark"
                  placeholder="e.g. 2nd Floor, Left Wing near stairs"
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />

                <Input
                  label="Contact Phone Number*"
                  placeholder="e.g. +234 801 234 5678"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Delivery Instructions for Rider"
                  placeholder="e.g. Call when at gate or leave at porter lodge"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  leftIcon={<FileText className="w-4 h-4" />}
                />
              </div>
            </Card>
          )}

          {/* Multi-Vendor Order Breakdown */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600" />
              3. Items Breakdown by Vendor
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {cartItemsByVendor.map(({ vendor, items, subtotal }) => (
                <div key={vendor.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-xs text-slate-900">{vendor.business_name}</span>
                    <span className="text-xs font-black text-slate-900">Subtotal: ₦{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="pl-2 space-y-1 text-xs text-slate-600">
                    {items.map((it) => (
                      <div key={it.meal.id} className="flex justify-between">
                        <span>
                          {it.quantity}x {it.meal.name}
                        </span>
                        <span className="font-semibold text-slate-900">
                          ₦{(it.meal.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Summary & Final Submit */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4 sticky top-24 bg-white border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Checkout Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">₦{cartSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Fulfillment Method:</span>
                <span className="font-bold text-slate-900">
                  {fulfillmentMethod === 'DELIVERY' ? 'Campus Delivery' : 'Campus Pickup'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span className="font-bold text-slate-900">
                  {deliveryFee > 0 ? `₦${deliveryFee}` : 'Free (Pickup)'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Amount</span>
                <span className="text-2xl font-black text-amber-700">₦{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
              onClick={handlePlaceOrder}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Place Order Now
            </Button>

            <p className="text-[11px] text-slate-400 text-center">
              No immediate online payment required. Pay on pickup or delivery according to vendor policy.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
