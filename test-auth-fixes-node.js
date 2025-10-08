// Node.js compatible authentication test script
const fetch = require('node-fetch'); // May need to use import in newer Node versions

const BASE_URL = 'http://localhost:3001';

console.log('🧪 Testing authentication fixes (Node.js)...');

async function testAuthenticationFixes() {
    const tests = [];
    
    // Test 1: Database Health (no auth required)
    try {
        console.log('📞 Testing /api/health/database...');
        const healthResponse = await fetch(`${BASE_URL}/api/health/database`);
        const healthResult = {
            endpoint: '/api/health/database',
            status: healthResponse.status,
            ok: healthResponse.ok,
            data: healthResponse.ok ? await healthResponse.json() : await healthResponse.text()
        };
        tests.push(healthResult);
        console.log(`${healthResponse.ok ? '✅' : '❌'} Database Health:`, healthResult);
    } catch (error) {
        tests.push({
            endpoint: '/api/health/database',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Database Health error:', error.message);
    }
    
    // Test 2: Profile API (requires auth - will show 401 if not authenticated)
    try {
        console.log('📞 Testing /api/user/profile...');
        const profileResponse = await fetch(`${BASE_URL}/api/user/profile`);
        const profileResult = {
            endpoint: '/api/user/profile',
            status: profileResponse.status,
            ok: profileResponse.ok,
            data: profileResponse.status === 401 ? 'Unauthorized (expected without login)' : 
                  profileResponse.ok ? await profileResponse.json() : await profileResponse.text()
        };
        tests.push(profileResult);
        console.log(`${profileResponse.status === 401 ? '✅' : '❓'} Profile API:`, profileResult);
    } catch (error) {
        tests.push({
            endpoint: '/api/user/profile',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Profile API error:', error.message);
    }
    
    // Test 3: Usage API (requires auth - will show 401 if not authenticated)
    try {
        console.log('📞 Testing /api/usage...');
        const usageResponse = await fetch(`${BASE_URL}/api/usage`);
        const usageResult = {
            endpoint: '/api/usage',
            status: usageResponse.status,
            ok: usageResponse.ok,
            data: usageResponse.status === 401 ? 'Unauthorized (expected without login)' : 
                  usageResponse.ok ? await usageResponse.json() : await usageResponse.text()
        };
        tests.push(usageResult);
        console.log(`${usageResponse.status === 401 ? '✅' : '❓'} Usage API:`, usageResult);
    } catch (error) {
        tests.push({
            endpoint: '/api/usage',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Usage API error:', error.message);
    }
    
    // Summary
    const healthPassed = tests.find(t => t.endpoint === '/api/health/database')?.ok;
    const authEndpointsResponding = tests.filter(t => t.status === 401 || t.ok).length;
    
    console.log(`\n📊 Test Summary:`);
    console.log(`- Database Health: ${healthPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Auth Endpoints Responding: ${authEndpointsResponding}/3`);
    
    if (healthPassed && authEndpointsResponding >= 2) {
        console.log('🎉 Authentication system is responding correctly!');
        console.log('💡 Auth endpoints show 401 (expected without login)');
    } else {
        console.log('⚠️ Some issues detected. Check results above.');
    }
    
    return {
        healthPassed,
        authEndpointsResponding,
        tests
    };
}

// Auto-run the test
testAuthenticationFixes().catch(console.error);