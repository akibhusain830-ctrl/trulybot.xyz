// Simple authentication debugging script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuth() {
  console.log('🔍 Debugging Authentication Flow...\n');

  try {
    // Check current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('📋 Current Session Status:');
    console.log('Has Session:', !!session);
    console.log('Has User:', !!session?.user);
    console.log('User ID:', session?.user?.id || 'N/A');
    console.log('User Email:', session?.user?.email || 'N/A');
    console.log('Provider:', session?.user?.app_metadata?.provider || 'N/A');
    console.log('Session Error:', error?.message || 'None');
    
    if (session?.user) {
      console.log('\n👤 User Details:');
      console.log('Created At:', session.user.created_at);
      console.log('Email Confirmed:', !!session.user.email_confirmed_at);
      console.log('Last Sign In:', session.user.last_sign_in_at);
      
      // Check if user has a profile
      console.log('\n🔗 Checking User Profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      console.log('Profile Exists:', !!profile);
      console.log('Profile Error:', profileError?.message || 'None');
      
      if (profile) {
        console.log('Workspace ID:', profile.workspace_id);
        console.log('Role:', profile.role);
        console.log('Trial Status:', profile.trial_status);
        console.log('Trial Ends At:', profile.trial_ends_at);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  }
}

debugAuth();