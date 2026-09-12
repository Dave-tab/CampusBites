# CampusBites - Campus Food Ordering & Delivery Platform

CampusBites is a multi-role food ordering and delivery web application designed for university campuses. It connects students, verified campus food vendors, student delivery riders, and campus administrators into a unified system with real-time tracking, multi-vendor cart, OTP delivery verification, and rider earnings wallet.

---

## 🚀 Key Features

### 🎓 Students & Staff
- **Vendor Marketplace:** Browse campus restaurants, food stalls, and cafeteria menus.
- **Multi-Vendor Cart & Checkout:** Seamless ordering with flexible delivery options.
- **Real-Time Order Tracking:** Track preparation, rider pickup, and live delivery stages.
- **Secure OTP Verification:** Delivery handover authenticated with a secure 4-digit OTP.
- **Order History & Favorites:** Quickly reorder past favorite meals.

### 🏪 Campus Vendors
- **Vendor Dashboard:** Manage live orders, accepted tickets, and meal preparation times.
- **Menu Management:** Add, edit, toggle availability, and set pricing for menu items.
- **Sales Analytics:** View daily/weekly revenue and order volume.

### 🚴 Campus Delivery Riders
- **Order Dispatch Board:** View nearby delivery requests across campus halls and faculties.
- **OTP Delivery Verification:** Enter the customer's OTP upon delivery to complete the order.
- **Earnings Wallet:** Track completed deliveries, tips, and daily balance.

### 🛡️ Campus Administrators
- **Platform Analytics:** Overview of active vendors, daily order counts, and system metrics.
- **Vendor Approvals:** Verify new vendors and manage platform compliance.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons, Motion
- **Charts & Metrics:** Recharts
- **Database & Authentication:** Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **AI Assist:** Google GenAI SDK (`@google/genai`)

---

## 📋 Prerequisites

- **Node.js** >= 18.x
- **npm** or **pnpm**
- A **Supabase** account ([supabase.com](https://supabase.com))
- *(Optional for Production Emails)* A **Resend** account ([resend.com](https://resend.com)) or custom SMTP provider

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Gemini AI (Optional / Server-side)
GEMINI_API_KEY="your-gemini-api-key"
