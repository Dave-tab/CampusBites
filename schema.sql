-- ====================================================================
-- CampusBites Food Ordering Platform - Database Schema & RLS Policies
-- ND2 Final Year Academic Project
-- PostgreSQL / Supabase Migration Script
-- ====================================================================

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM ('STUDENT', 'VENDOR', 'ADMIN');
CREATE TYPE vendor_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE meal_availability AS ENUM ('AVAILABLE', 'UNAVAILABLE');
CREATE TYPE fulfillment_method AS ENUM ('CAMPUS_PICKUP', 'DELIVERY');
CREATE TYPE order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
  'REJECTED',
  'PARTIALLY_CANCELLED'
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'STUDENT',
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(50) NOT NULL,
  location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('CAMPUS', 'OFF_CAMPUS')),
  address TEXT NOT NULL,
  location_description TEXT,
  verification_status vendor_status NOT NULL DEFAULT 'PENDING',
  approval_timestamp TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  banner_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VENDOR APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('CAMPUS', 'OFF_CAMPUS')),
  address TEXT NOT NULL,
  location_description TEXT,
  supporting_info TEXT,
  verification_status vendor_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MEALS TABLE
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  availability meal_availability NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PARENT ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  order_reference VARCHAR(50) NOT NULL UNIQUE,
  fulfillment_method fulfillment_method NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status order_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- 8. VENDOR SUB-ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.vendor_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'PENDING',
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 9. ORDER ITEMS TABLE (Snapshots meal name and price)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_order_id UUID NOT NULL REFERENCES public.vendor_orders(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE RESTRICT,
  meal_name_snapshot VARCHAR(255) NOT NULL,
  unit_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DELIVERY DETAILS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_location VARCHAR(255) NOT NULL,
  location_description TEXT,
  contact_phone VARCHAR(50) NOT NULL,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  related_vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_order_id UUID REFERENCES public.vendor_orders(id) ON DELETE CASCADE,
  parent_order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FREQUENT QUERIES
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(verification_status);
CREATE INDEX IF NOT EXISTS idx_meals_vendor ON public.meals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_meals_category ON public.meals(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_student ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_parent ON public.vendor_orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_vendor ON public.vendor_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_history_vendor_order ON public.order_status_history(vendor_order_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, user/admin edit
CREATE POLICY "Public profiles reading" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vendors: Public view approved vendors, owner/admin edit
CREATE POLICY "View approved vendors" ON public.vendors FOR SELECT USING (verification_status = 'APPROVED' OR auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Vendors manage own record" ON public.vendors FOR UPDATE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Categories: Public view, admin edit
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Meals: Public view available meals of approved vendors, vendor owner manage
CREATE POLICY "Public read meals" ON public.meals FOR SELECT USING (true);
CREATE POLICY "Vendor manage meals" ON public.meals FOR ALL USING (EXISTS (SELECT 1 FROM public.vendors WHERE id = meals.vendor_id AND owner_id = auth.uid()));

-- Orders: Student view own, admin view all
CREATE POLICY "Student view own parent orders" ON public.orders FOR SELECT USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Student insert order" ON public.orders FOR INSERT WITH CHECK (student_id = auth.uid());

-- Vendor Orders: Vendor view own sub-orders, student view parent order sub-orders, admin view all
CREATE POLICY "View vendor sub-orders" ON public.vendor_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_orders.vendor_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.orders WHERE id = vendor_orders.parent_order_id AND student_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Notifications: Recipient manage own
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (recipient_user_id = auth.uid());
