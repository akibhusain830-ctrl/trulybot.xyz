// Debug script to test the specific authentication issues
// Run this in browser console to diagnose the errors

console.log('🔍 Starting authentication debug...');

// Test the profile API endpoint that's failing
async function testProfileAPI() {
    try {
        console.log('📞 Testing /api/user/profile...');
        const response = await fetch('/api/user/profile');
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Profile API error:', errorText);
            return null;
        }
        
        const data = await response.json();
        console.log('✅ Profile API success:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Profile API network error:', error);
        return null;
    }
}

// Test Supabase client authentication
async function testSupabaseAuth() {
    try {
        console.log('🔐 Testing Supabase authentication...');
        
        // Check if supabase is available
        if (typeof window !== 'undefined' && window.supabase) {
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Supabase auth error:', error);
                return false;
            }
            
            if (session) {
                console.log('✅ Supabase session active:', {
                    userId: session.user.id,
                    email: session.user.email,
                    exp: new Date(session.expires_at * 1000)
                });
                return true;
            } else {
                console.log('⚠️ No active Supabase session');
                return false;
            }
        } else {
            console.log('⚠️ Supabase client not available');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Supabase auth test failed:', error);
        return false;
    }
}

// Test database connection through API
async function testDatabaseConnection() {
    try {
        console.log('🗄️ Testing database connection...');
        
        const response = await fetch('/api/health/database');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Database connection healthy:', data);
            return true;
        } else {
            console.error('❌ Database connection failed:', response.status);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Database test network error:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running comprehensive authentication debug...');
    
    const results = {
        supabaseAuth: await testSupabaseAuth(),
        profileAPI: await testProfileAPI(),
        databaseConnection: await testDatabaseConnection()
    };
    
    console.log('📋 Test Results Summary:', results);
    
    // Provide recommendations
    if (!results.supabaseAuth) {
        console.log('💡 Recommendation: Check Supabase authentication setup and environment variables');
    }
    
    if (!results.profileAPI) {
        console.log('💡 Recommendation: Check profile API endpoint and database schema');
    }
    
    if (!results.databaseConnection) {
        console.log('💡 Recommendation: Check database connection and Supabase configuration');
    }
    
    return results;
}

// Auto-run the tests
runAllTests();