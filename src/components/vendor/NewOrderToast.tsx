import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Eye, X, Utensils, Phone, Truck, Clock, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ToastOrderInfo {
  id: string;
  parentOrderId: string;
  vendorOrderId: string;
  orderRef: string;
  studentName: string;
  studentPhone: string;
  fulfillmentMethod: string;
  items: { quantity: number; mealName: string; subtotal: number }[];
  totalSubtotal: number;
  createdAt: string;
}

interface NewOrderToastProps {
  toasts: ToastOrderInfo[];
  onConfirm: (parentOrderId: string, vendorOrderId: string) => void;
  onDismiss: (toastId: string) => void;
  onReviewDetails?: (parentOrderId: string) => void;
}

export const NewOrderToastContainer: React.FC<NewOrderToastProps> = ({
  toasts,
  onConfirm,
  onDismiss,
  onReviewDetails,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <SingleOrderToast
          key={toast.id}
          toast={toast}
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          onReviewDetails={onReviewDetails}
        />
      ))}
    </div>
  );
};

const SingleOrderToast: React.FC<{
  toast: ToastOrderInfo;
  onConfirm: (parentOrderId: string, vendorOrderId: string) => void;
  onDismiss: (toastId: string) => void;
  onReviewDetails?: (parentOrderId: string) => void;
}> = ({ toast, onConfirm, onDismiss, onReviewDetails }) => {
  const TIMER_DURATION = 15000;
  const [remainingTime, setRemainingTime] = useState(TIMER_DURATION);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingTime);

    return () => {
      clearTimeout(timer);
      const elapsed = Date.now() - startTime;
      setRemainingTime((prev) => Math.max(0, prev - elapsed));
    };
  }, [isPaused, toast.id, onDismiss, remainingTime]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl shadow-2xl border-2 border-amber-500/60 overflow-hidden animate-in slide-in-from-top-6 duration-300 relative group"
    >
      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      {/* Top Animated Banner Header */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2 font-black text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-900"></span>
          </span>
          <Bell className="w-4 h-4 animate-bounce" />
          <span className="uppercase tracking-wide font-extrabold text-[11px]">⚡ REAL-TIME NEW ORDER RECEIVED!</span>
        </div>
        <span className="text-[10px] bg-slate-900 text-amber-300 font-mono px-2 py-0.5 rounded-md">
          Just Now
        </span>
      </div>

      {/* Main Toast Content */}
      <div className="p-4 space-y-3">
        {/* Order Reference & Student Info */}
        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-amber-400 text-base">{toast.orderRef}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                {toast.fulfillmentMethod === 'DELIVERY' ? (
                  <>
                    <Truck className="w-3 h-3" /> Delivery
                  </>
                ) : (
                  <>
                    <Utensils className="w-3 h-3" /> Pickup
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-1.5">
              <span>Customer:</span>
              <span className="font-bold text-white">{toast.studentName}</span>
              <span className="text-slate-400 flex items-center gap-0.5">
                (<Phone className="w-3 h-3" /> {toast.studentPhone})
              </span>
            </p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss Toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ordered Meal Items List */}
        <div className="space-y-1.5 bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
          <div className="flex justify-between font-bold text-amber-300 text-[11px]">
            <span>Requested Items ({toast.items.length}):</span>
            <span>Subtotal: ₦{toast.totalSubtotal.toLocaleString()}</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {toast.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] text-slate-200">
                <span>
                  <span className="font-black text-amber-400">{item.quantity}x</span> {item.mealName}
                </span>
                <span className="font-mono text-slate-300">₦{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Prompt Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-amber-200/80 italic">
            {isPaused ? '⏸️ Auto-close paused' : '⚡ Review order now'}
          </span>

          <div className="flex items-center gap-2">
            {onReviewDetails && (
              <button
                onClick={() => onReviewDetails(toast.parentOrderId)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
            )}

            <button
              onClick={() => onConfirm(toast.parentOrderId, toast.vendorOrderId)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Order Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="h-1 bg-slate-800 w-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
          style={{
            animationName: 'toastShrink',
            animationDuration: `${TIMER_DURATION}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
};
