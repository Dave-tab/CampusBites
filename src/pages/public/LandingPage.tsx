import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CampusBiteLogo } from '../../components/ui/CampusBiteLogo';
import { ArrowRight, Utensils, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Footer } from '../../components/layout/Footer';
import { PageLoader } from '../../components/ui/PageLoader';

export const LandingPage: React.FC = () => {
  const { isLoggedIn, isAuthLoading } = useAuth();

  // If already logged in, skip landing page
  if (isAuthLoading) {
    return <PageLoader />;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <CampusBiteLogo size="md" />
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm shadow-amber-500/20"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Campus food delivery, <br className="hidden sm:block" />
            <span className="text-amber-500">simplified and fast.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
            Get your favorite meals from campus kitchens delivered directly to your hostel or lecture block. 
            No more waiting in lines between classes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-2xl text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-700 px-8 py-3.5 rounded-2xl text-base font-bold transition-all border border-slate-200 text-center"
            >
              Log In to Account
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
              <Utensils className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Kitchens</h3>
            <p className="text-slate-500">Only approved and hygienic campus vendors make it to our platform.</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Fast Delivery</h3>
            <p className="text-slate-500">Student riders ensure your food gets to you hot and exactly on time.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Payments</h3>
            <p className="text-slate-500">Pay securely online or choose cash on delivery for complete peace of mind.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
