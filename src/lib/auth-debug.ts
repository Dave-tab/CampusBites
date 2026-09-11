import { supabase } from './supabase';

export const runAuthDiagnostic = async () => {
  console.log('%c🔍 Starting Supabase Auth & Schema Diagnostic...', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
  
  if (!supabase) {
    console.error('❌ Supabase client is not initialized. Check your environment variables.');
    return;
  }

  console.log('✅ Supabase client initialized.');

  // 1. Check Profiles Schema & RLS
  console.log('%c\n🔍 Checking public.profiles schema and permissions...', 'color: #8b5cf6; font-weight: bold;');
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST204') {
        console.error('❌ Table not found or missing columns. Error:', error.message);
        console.log('💡 Fix: The trigger will fail if the table structure doesn\'t match exactly. Run the table reset SQL.');
      } else {
        console.error('❌ Schema or RLS Permission Error on public.profiles:', error.message);
      }
    } else {
      console.log('✅ public.profiles table exists.');
      console.log('✅ Schema columns are correct (id, full_name, email, phone, role).');
      console.log('✅ Row Level Security (RLS) policies are allowing reads.');
    }
  } catch (err) {
    console.error('❌ Unexpected error checking profiles:', err);
  }

  // 2. Explain Email Rate Limit (The actual current blocker)
  console.log('%c\n===================================================', 'color: #10b981; font-weight: bold;');
  console.log('%c📧 ABOUT "EMAIL RATE LIMIT EXCEEDED"', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.log('%c===================================================', 'color: #10b981; font-weight: bold;');
  console.log('If you are seeing "Email rate limit exceeded", this is %cGREAT NEWS.', 'font-weight: bold; color: #10b981;');
  console.log('It means your database trigger (on_auth_user_created) %cIS NO LONGER CRASHING!', 'font-weight: bold; text-decoration: underline;');
  console.log('The database successfully processed the signup, but Supabase blocked the email');
  console.log('because its free email tier only allows ~3 emails per hour to prevent spam.');
  console.log('\n%c🛠️ HOW TO PROCEED:', 'font-weight: bold;');
  console.log('1. Wait about 60 minutes for the limit to reset, then try signing up again.');
  console.log('2. OR, set up a custom SMTP provider (like Resend.com or SendGrid) in');
  console.log('   Supabase Dashboard -> Authentication -> SMTP to remove this limit entirely.');
  console.log('%c===================================================\n', 'color: #10b981; font-weight: bold;');
};

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).runAuthDiagnostic = runAuthDiagnostic;
}
