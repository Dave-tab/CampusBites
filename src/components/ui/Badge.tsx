import React from 'react';
import { OrderStatus, VendorStatus } from '../../types';

interface BadgeProps {
  status?: OrderStatus | VendorStatus | 'CAMPUS' | 'OFF_CAMPUS' | 'AVAILABLE' | 'UNAVAILABLE' | string;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', children }) => {
  let styleClasses = 'bg-slate-100 text-slate-800 border-slate-200';
  let label = children || status;

  if (status) {
    switch (status) {
      // Order & Vendor statuses
      case 'PENDING':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
        label = children || 'Pending';
        break;
      case 'APPROVED':
      case 'CONFIRMED':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        label = children || (status === 'APPROVED' ? 'Approved' : 'Confirmed');
        break;
      case 'PREPARING':
        styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/80 animate-pulse';
        label = children || 'Preparing';
        break;
      case 'READY_FOR_PICKUP':
        styleClasses = 'bg-teal-50 text-teal-700 border-teal-200/80 font-semibold';
        label = children || 'Ready for Pickup';
        break;
      case 'OUT_FOR_DELIVERY':
        styleClasses = 'bg-blue-50 text-blue-700 border-blue-200/80 font-semibold';
        label = children || 'Out for Delivery';
        break;
      case 'DELIVERED':
      case 'PICKED_UP':
        styleClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
        label = children || (status === 'DELIVERED' ? 'Delivered' : 'Picked Up');
        break;
      case 'CANCELLED':
      case 'REJECTED':
      case 'SUSPENDED':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
        label = children || (status === 'CANCELLED' ? 'Cancelled' : status === 'REJECTED' ? 'Rejected' : 'Suspended');
        break;
      case 'PARTIALLY_CANCELLED':
        styleClasses = 'bg-orange-50 text-orange-700 border-orange-200/80';
        label = children || 'Partially Cancelled';
        break;

      // Location
      case 'CAMPUS':
        styleClasses = 'bg-amber-100/70 text-amber-900 border-amber-300';
        label = children || 'On Campus';
        break;
      case 'OFF_CAMPUS':
        styleClasses = 'bg-purple-50 text-purple-700 border-purple-200/80';
        label = children || 'Off Campus';
        break;

      // Meal Availability
      case 'AVAILABLE':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = children || 'Available';
        break;
      case 'UNAVAILABLE':
        styleClasses = 'bg-slate-100 text-slate-500 border-slate-200';
        label = children || 'Unavailable';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap transition-colors ${styleClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {label}
    </span>
  );
};
