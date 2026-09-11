export type UserRole = 'STUDENT' | 'VENDOR' | 'ADMIN' | 'RIDER';

export type RiderVehicleType = 'BICYCLE' | 'MOTORBIKE' | 'SCOOTER' | 'ON_FOOT';

export interface RiderProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email?: string;
  profile_image?: string;
  vehicle_type: RiderVehicleType;
  vehicle_plate?: string;
  campus_zone: string;
  is_online: boolean;
  rating: number;
  total_deliveries: number;
  today_deliveries: number;
  total_earnings: number;
  today_earnings: number;
  wallet_balance: number;
  created_at: string;
  updated_at?: string;
}

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type MealAvailability = 'AVAILABLE' | 'UNAVAILABLE';

export type FulfillmentMethod = 'CAMPUS_PICKUP' | 'DELIVERY';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'PARTIALLY_CANCELLED';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vendor {
  id: string;
  owner_id: string;
  business_name: string;
  description: string;
  phone: string;
  location_type: 'CAMPUS' | 'OFF_CAMPUS';
  address: string;
  location_description?: string;
  verification_status: VendorStatus;
  approval_timestamp?: string;
  approved_by?: string;
  rejection_reason?: string;
  banner_image?: string;
  rating?: number;
  total_orders?: number;
  created_at: string;
  updated_at?: string;
}

export interface VendorApplication {
  id: string;
  applicant_id: string;
  applicant_name?: string;
  applicant_email?: string;
  business_name: string;
  description: string;
  phone: string;
  location_type: 'CAMPUS' | 'OFF_CAMPUS';
  address: string;
  location_description?: string;
  supporting_info?: string;
  verification_status: VendorStatus;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  meal_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: string;
  vendor_id: string;
  vendor_name?: string;
  category_id: string;
  category_name?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  availability: MealAvailability;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  meal: Meal;
  quantity: number;
  vendor: Vendor;
}

export interface DeliveryDetails {
  id?: string;
  parent_order_id?: string;
  delivery_location: string;
  location_description?: string;
  contact_phone: string;
  delivery_instructions?: string;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  vendor_order_id: string;
  meal_id: string;
  meal_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
  created_at?: string;
}

export interface VendorOrder {
  id: string;
  parent_order_id: string;
  vendor_id: string;
  vendor_name?: string;
  status: OrderStatus;
  subtotal: number;
  rejection_reason?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface Order {
  id: string;
  student_id: string;
  student_name?: string;
  student_phone?: string;
  order_reference: string;
  fulfillment_method: FulfillmentMethod;
  total_amount: number;
  status: OrderStatus;
  vendor_orders: VendorOrder[];
  delivery_details?: DeliveryDetails;
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  rider_vehicle_type?: string;
  delivery_fee?: number;
  delivery_otp?: string;
  rider_assigned_at?: string;
  rider_picked_up_at?: string;
  rider_delivered_at?: string;
  delivery_proof_note?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface OrderStatusHistory {
  id: string;
  vendor_order_id?: string;
  parent_order_id?: string;
  previous_status?: OrderStatus;
  new_status: OrderStatus;
  actor_user_id?: string;
  actor_name?: string;
  note?: string;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  order_reference?: string;
  student_id: string;
  student_name: string;
  vendor_id: string;
  vendor_name?: string;
  meal_id?: string;
  meal_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_user_id: string;
  type: 'ORDER_STATUS' | 'NEW_ORDER' | 'VENDOR_VERIFICATION' | 'SYSTEM';
  title: string;
  message: string;
  related_order_id?: string;
  related_vendor_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface PlatformAnalytics {
  total_students: number;
  total_approved_vendors: number;
  pending_vendor_applications: number;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  rejected_orders: number;
  total_revenue: number;
  avg_confirmation_time_mins: number;
  avg_preparation_time_mins: number;
  avg_fulfillment_time_mins: number;
  orders_by_status: { status: string; count: number }[];
  orders_by_fulfillment: { method: string; count: number }[];
  orders_over_time: { date: string; orders: number; revenue: number }[];
  popular_meals: { id: string; name: string; vendor_name: string; order_count: number; revenue: number }[];
  popular_vendors: { id: string; name: string; order_count: number; completion_rate: number }[];
}
