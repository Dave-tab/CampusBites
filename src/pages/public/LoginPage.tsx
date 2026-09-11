import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { CampusBiteLogo } from '../../components/ui/CampusBiteLogo';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemoRole, isLoggedIn, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthLoading) return null;
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email);
      if (success) {
        navigate('/'); // Will redirect to the correct dashboard via RoleBasedRedirect
      } else {
        setError('No account found with this email. Please try a demo login or sign up.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'STUDENT' | 'VENDOR' | 'RIDER' | 'ADMIN') => {
    loginAsDemoRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link to="/" className="mb-6">
          <CampusBiteLogo size="lg" />
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-amber-600 hover:text-amber-500 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all"
                  placeholder="you@campus.edu"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Fast Demo Login</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin('STUDENT')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Student
              </button>
              <button
                onClick={() => handleDemoLogin('VENDOR')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Vendor
              </button>
              <button
                onClick={() => handleDemoLogin('RIDER')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Rider
              </button>
              <button
                onClick={() => handleDemoLogin('ADMIN')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
