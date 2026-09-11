import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { runAuthDiagnostic } from './lib/auth-debug';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './components/layout/MainLayout';
import { PageLoader } from './components/ui/PageLoader';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';

// Lazy-loaded Student Pages
const StudentHome = React.lazy(() =>
  import('./pages/student/StudentHome').then((m) => ({ default: m.StudentHome }))
);
const VendorsList = React.lazy(() =>
  import('./pages/student/VendorsList').then((m) => ({ default: m.VendorsList }))
);
const VendorDetail = React.lazy(() =>
  import('./pages/student/VendorDetail').then((m) => ({ default: m.VendorDetail }))
);
const CartPage = React.lazy(() =>
  import('./pages/student/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = React.lazy(() =>
  import('./pages/student/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const OrderConfirmation = React.lazy(() =>
  import('./pages/student/OrderConfirmation').then((m) => ({ default: m.OrderConfirmation }))
);
const OrdersList = React.lazy(() =>
  import('./pages/student/OrdersList').then((m) => ({ default: m.OrdersList }))
);
const OrderTracker = React.lazy(() =>
  import('./pages/student/OrderTracker').then((m) => ({ default: m.OrderTracker }))
);
const StudentProfile = React.lazy(() =>
  import('./pages/student/StudentProfile').then((m) => ({ default: m.StudentProfile }))
);

// Lazy-loaded Vendor Pages
const VendorDashboard = React.lazy(() =>
  import('./pages/vendor/VendorDashboard').then((m) => ({ default: m.VendorDashboard }))
);
const VendorMeals = React.lazy(() =>
  import('./pages/vendor/VendorMeals').then((m) => ({ default: m.VendorMeals }))
);
const VendorOrders = React.lazy(() =>
  import('./pages/vendor/VendorOrders').then((m) => ({ default: m.VendorOrders }))
);
const VendorApplicationForm = React.lazy(() =>
  import('./pages/vendor/VendorApplicationForm').then((m) => ({ default: m.VendorApplicationForm }))
);
const VendorProfile = React.lazy(() =>
  import('./pages/vendor/VendorProfile').then((m) => ({ default: m.VendorProfile }))
);

// Lazy-loaded Admin Pages
const AdminDashboard = React.lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminPendingVendors = React.lazy(() =>
  import('./pages/admin/AdminPendingVendors').then((m) => ({ default: m.AdminPendingVendors }))
);
const AdminVendorsList = React.lazy(() =>
  import('./pages/admin/AdminVendorsList').then((m) => ({ default: m.AdminVendorsList }))
);
const AdminAnalytics = React.lazy(() =>
  import('./pages/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics }))
);

// Lazy-loaded Rider Pages
const RiderDashboard = React.lazy(() =>
  import('./pages/rider/RiderDashboard').then((m) => ({ default: m.RiderDashboard }))
);
const RiderDeliveries = React.lazy(() =>
  import('./pages/rider/RiderDeliveries').then((m) => ({ default: m.RiderDeliveries }))
);
const RiderEarnings = React.lazy(() =>
  import('./pages/rider/RiderEarnings').then((m) => ({ default: m.RiderEarnings }))
);
const RiderRegistrationConsole = React.lazy(() =>
  import('./pages/rider/RiderRegistrationConsole').then((m) => ({ default: m.RiderRegistrationConsole }))
);

/**
 * Smart Home Redirect based on active user role
 */
const RoleBasedRedirect: React.FC = () => {
  const { userRole, isLoggedIn, isAuthLoading } = useAuth();

  if (isAuthLoading) return <PageLoader />;

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (userRole === 'VENDOR') {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  if (userRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (userRole === 'RIDER') {
    return <Navigate to="/rider/dashboard" replace />;
  }
  return <Navigate to="/student/home" replace />;
};

/**
 * Protected Route Wrapper
 */
const ProtectedRoute: React.FC = () => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  
  if (isAuthLoading) return <PageLoader />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default function App() {
  useEffect(() => {
    // Run auth database diagnostics in development console
    if (process.env.NODE_ENV === 'development') {
      runAuthDiagnostic();
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Unauthenticated Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Router for logged in users */}
                <Route path="/dashboard" element={<RoleBasedRedirect />} />

                {/* Protected App Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    {/* Student Routes */}
                    <Route path="/student/home" element={<StudentHome />} />
                    <Route path="/student/vendors" element={<VendorsList />} />
                    <Route path="/student/vendors/:id" element={<VendorDetail />} />
                    <Route path="/student/cart" element={<CartPage />} />
                    <Route path="/student/checkout" element={<CheckoutPage />} />
                    <Route path="/student/orders" element={<OrdersList />} />
                    <Route path="/student/history" element={<OrdersList historyOnly={true} />} />
                    <Route path="/student/orders/:id" element={<OrderTracker />} />
                    <Route path="/student/orders/:id/confirmation" element={<OrderConfirmation />} />
                    <Route path="/student/profile" element={<StudentProfile />} />

                    {/* Vendor Routes */}
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                    <Route path="/vendor/meals" element={<VendorMeals />} />
                    <Route path="/vendor/orders" element={<VendorOrders />} />
                    <Route path="/vendor/application" element={<VendorApplicationForm />} />
                    <Route path="/vendor/profile" element={<VendorProfile />} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/vendors/pending" element={<AdminPendingVendors />} />
                    <Route path="/admin/vendors" element={<AdminVendorsList />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />

                    {/* Rider Routes */}
                    <Route path="/rider/dashboard" element={<RiderDashboard />} />
                    <Route path="/rider/deliveries" element={<RiderDeliveries />} />
                    <Route path="/rider/earnings" element={<RiderEarnings />} />
                    <Route path="/rider/registration" element={<RiderRegistrationConsole />} />

                    {/* Catch-all Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
