import React, { useState } from 'react';
import { Order, VendorOrder } from '../../types';
import { DataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Star, CheckCircle2, MessageSquare, Utensils } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onReviewSubmitted,
}) => {
  const { currentUser } = useAuth();
  const existingReviews = DataService.getReviewsForOrder(order.id);

  // Default to first vendor order if available
  const [selectedVendorOrder, setSelectedVendorOrder] = useState<VendorOrder>(
    order.vendor_orders[0]
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Check if current selected vendor order already has a review
  const hasReviewedSelectedVendor = existingReviews.some(
    (r) => r.vendor_id === selectedVendorOrder?.vendor_id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedVendorOrder) return;

    setIsSubmitting(true);
    DataService.submitReview({
      order_id: order.id,
      order_reference: order.order_reference,
      student_id: currentUser.id,
      student_name: currentUser.full_name || 'Student',
      vendor_id: selectedVendorOrder.vendor_id,
      vendor_name: selectedVendorOrder.vendor_name || 'Vendor',
      meal_id: selectedVendorOrder.items[0]?.meal_id,
      meal_name: selectedVendorOrder.items[0]?.meal_name_snapshot,
      rating,
      comment: comment.trim() || 'Great food and fast service!',
    });

    setIsSubmitting(false);
    setSubmittedSuccess(true);
    if (onReviewSubmitted) onReviewSubmitted();

    setTimeout(() => {
      setSubmittedSuccess(false);
      setComment('');
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review & Rate Order ${order.order_reference}`}
    >
      <div className="space-y-5">
        {/* Multi-Vendor Selector if order has multiple vendors */}
        {order.vendor_orders.length > 1 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Select Kitchen Vendor to Review:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {order.vendor_orders.map((vo) => {
                const isSelected = selectedVendorOrder?.id === vo.id;
                const isReviewed = existingReviews.some((r) => r.vendor_id === vo.vendor_id);

                return (
                  <button
                    key={vo.id}
                    type="button"
                    onClick={() => {
                      setSelectedVendorOrder(vo);
                      setSubmittedSuccess(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all text-xs font-bold flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-amber-600" />
                      <span>{vo.vendor_name}</span>
                    </div>
                    {isReviewed && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Reviewed
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {submittedSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Thank You for Your Review! 🎉</h3>
            <p className="text-xs text-slate-600">
              Your feedback helps {selectedVendorOrder?.vendor_name || 'vendors'} maintain top quality food and service.
            </p>
          </div>
        ) : hasReviewedSelectedVendor ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>You have already reviewed {selectedVendorOrder?.vendor_name}!</span>
            </div>
            {existingReviews
              .filter((r) => r.vendor_id === selectedVendorOrder?.vendor_id)
              .map((r) => (
                <div key={r.id} className="p-3 bg-white rounded-xl border border-amber-100 text-xs space-y-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="font-bold text-slate-900 ml-1.5">{r.rating}/5</span>
                  </div>
                  <p className="text-slate-700 italic">"{r.comment}"</p>
                </div>
              ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Rating for {selectedVendorOrder?.vendor_name}:
              </span>

              {/* Interactive Star Picker */}
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-black text-amber-900 ml-2">
                  {rating === 5 ? '5.0 - Excellent! 🔥' : rating === 4 ? '4.0 - Very Good 👌' : rating === 3 ? '3.0 - Good 👍' : rating === 2 ? '2.0 - Fair 😐' : '1.0 - Poor 😞'}
                </span>
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                Write Your Experience & Meal Feedback:
              </label>
              <textarea
                rows={3}
                placeholder="How was the food taste, temperature, packaging, and speed? (e.g. Jollof was piping hot & tasty!)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
