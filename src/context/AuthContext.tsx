import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { DataService } from '../services/dataService';
import { INITIAL_PROFILES } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  userRole: UserRole | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  login: (email: string) => Promise<boolean>;
  register: (data: { full_name: string; email: string; phone: string; role: UserRole }) => Promise<boolean>;
  loginAsDemoRole: (role: UserRole, vendorOwnerId?: string) => void;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'campusbites_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Disable Supabase integration temporarily since it is throwing database errors
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) return parsed;
      }
    } catch (e) {
      console.error('Error loading current user:', e);
    }
    return null;
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Sync Supabase Auth session if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !currentUser) {
        const metadata = session.user.user_metadata;
        const profile: UserProfile = {
          id: session.user.id,
          full_name: metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: metadata?.phone || '',
          role: (metadata?.role as UserRole) || 'STUDENT',
          created_at: session.user.created_at,
        };
        setCurrentUser(profile);
      }
    }).catch(err => {
      console.error('Session check failed', err);
    }).finally(() => {
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        if (session?.user) {
          const metadata = session.user.user_metadata;
          const profile: UserProfile = {
            id: session.user.id,
            full_name: metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            phone: metadata?.phone || '',
            role: (metadata?.role as UserRole) || 'STUDENT',
            created_at: session.user.created_at,
          };
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error handling auth state change:', err);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      // Use Magic Link for email verification flow
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        if (error.message.includes('Database error saving new user')) {
          throw new Error('Supabase Auth configuration error: Please go to your Supabase Dashboard -> Authentication -> Providers and ensure "Enable Email Signup" is ON. Also check if you have any failing Postgres triggers on the auth.users table.');
        }
        throw new Error(error.message);
      }
      // Tell user to check their email
      alert('A secure login link has been sent to your email. Please check your inbox to complete verification.');
      return false; // Wait for magic link
    } else {
      // Fallback local mock authentication
      const profiles = DataService.getProfiles();
      const user = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    }
  };

  const register = async (data: { full_name: string; email: string; phone: string; role: UserRole }): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      // Use Supabase Auth with OTP for verified email signups
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
            role: data.role,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        if (error.message.includes('Database error saving new user')) {
          throw new Error('Supabase Auth configuration error: Please go to your Supabase Dashboard -> Authentication -> Providers and ensure "Enable Email Signup" is ON. Also check if you have any failing Postgres triggers on the auth.users table.');
        }
        throw new Error(error.message);
      }
      
      alert('Verification required: We have sent a confirmation link to your email address. Please click it to verify your university account.');
      return true; // Return true to indicate the registration process (email sending) was successful
    } else {
      // Fallback mock logic for local environment without Supabase keys
      const newProfile: UserProfile = {
        id: `user-${Date.now()}`,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        created_at: new Date().toISOString(),
      };
      DataService.saveProfile(newProfile);
      setCurrentUser(newProfile);
      return true;
    }
  };

  const loginAsDemoRole = (role: UserRole, vendorOwnerId?: string) => {
    if (isSupabaseConfigured) {
      alert('Demo login is disabled when Supabase Auth is strictly enforced.');
      return;
    }
    const profiles = DataService.getProfiles();
    let targetUser: UserProfile | undefined;

    if (role === 'VENDOR' && vendorOwnerId) {
      targetUser = profiles.find((p) => p.id === vendorOwnerId);
    } else if (role === 'VENDOR') {
      targetUser = profiles.find((p) => p.role === 'VENDOR');
    } else {
      targetUser = profiles.find((p) => p.role === role);
    }

    if (!targetUser) {
      const initMatch = INITIAL_PROFILES.find((p) =>
        role === 'VENDOR' && vendorOwnerId ? p.id === vendorOwnerId : p.role === role
      );
      if (initMatch) {
        targetUser = initMatch;
        DataService.saveProfile(initMatch);
      } else {
        targetUser = {
          id: role === 'RIDER' ? 'user-rider-1' : `user-${role.toLowerCase()}-${Date.now()}`,
          full_name:
            role === 'RIDER'
              ? 'Tunde Bakare'
              : role === 'ADMIN'
              ? 'System Administrator'
              : role === 'VENDOR'
              ? 'Mama Cass Owner'
              : 'David Ayantade',
          email: `${role.toLowerCase()}@campusbites.edu`,
          phone: '+234 812 345 6789',
          role: role,
          created_at: new Date().toISOString(),
        };
        DataService.saveProfile(targetUser);
      }
    }

    setCurrentUser(targetUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole: currentUser?.role || null,
        isLoggedIn: !!currentUser,
        isAuthLoading,
        login,
        register,
        loginAsDemoRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
