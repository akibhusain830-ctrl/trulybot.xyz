// Authentication test script
// Open this in browser console to verify fixes

console.log('🧪 Testing authentication fixes...');

async function testAuthenticationFixes() {
    const tests = [];
    
    // Test 1: Profile API
    try {
        console.log('📞 Testing /api/user/profile...');
        const profileResponse = await fetch('/api/user/profile');
        const profileResult = {
            endpoint: '/api/user/profile',
            status: profileResponse.status,
            ok: profileResponse.ok,
            data: profileResponse.ok ? await profileResponse.json() : await profileResponse.text()
        };
        tests.push(profileResult);
        console.log(`${profileResponse.ok ? '✅' : '❌'} Profile API:`, profileResult);
    } catch (error) {
        tests.push({
            endpoint: '/api/user/profile',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Profile API error:', error);
    }
    
    // Test 2: Usage API
    try {
        console.log('📞 Testing /api/usage...');
        const usageResponse = await fetch('/api/usage');
        const usageResult = {
            endpoint: '/api/usage',
            status: usageResponse.status,
            ok: usageResponse.ok,
            data: usageResponse.ok ? await usageResponse.json() : await usageResponse.text()
        };
        tests.push(usageResult);
        console.log(`${usageResponse.ok ? '✅' : '❌'} Usage API:`, usageResult);
    } catch (error) {
        tests.push({
            endpoint: '/api/usage',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Usage API error:', error);
    }
    
    // Test 3: Database Health
    try {
        console.log('📞 Testing /api/health/database...');
        const healthResponse = await fetch('/api/health/database');
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
        console.error('❌ Database Health error:', error);
    }
    
    // Summary
    const passed = tests.filter(t => t.ok || t.status === 200).length;
    const total = tests.length;
    
    console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All authentication tests passed!');
    } else {
        console.log('⚠️ Some tests failed. Check individual results above.');
    }
    
    return {
        summary: `${passed}/${total} passed`,
        tests,
        allPassed: passed === total
    };
}

// Auto-run the test
testAuthenticationFixes();