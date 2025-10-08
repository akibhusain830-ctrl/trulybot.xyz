// Debug script to check your current trial status
// Open browser console and run this to see what's happening

console.log('🔍 Debugging trial status...');

async function checkTrialStatus() {
    try {
        console.log('📞 Fetching current profile...');
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
            console.error('❌ Profile API failed:', response.status);
            return;
        }
        
        const data = await response.json();
        console.log('📋 Full profile data:', data);
        
        const profile = data.profile;
        const subscription = data.subscription;
        
        console.log('👤 Profile info:');
        console.log('- Email:', profile.email);
        console.log('- Subscription Status:', profile.subscription_status);
        console.log('- Trial Ends At:', profile.trial_ends_at);
        console.log('- Has Used Trial:', profile.has_used_trial);
        
        console.log('\n📊 Subscription calculation:');
        console.log('- Status:', subscription.status);
        console.log('- Is Trial Active:', subscription.is_trial_active);
        console.log('- Has Access:', subscription.has_access);
        console.log('- Days Remaining:', subscription.days_remaining);
        
        if (profile.trial_ends_at) {
            const trialEnd = new Date(profile.trial_ends_at);
            const now = new Date();
            const diffMs = trialEnd.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
            
            console.log('\n⏰ Trial date analysis:');
            console.log('- Trial End Date:', trialEnd.toISOString());
            console.log('- Current Date:', now.toISOString());
            console.log('- Difference (ms):', diffMs);
            console.log('- Difference (days):', diffDays);
            console.log('- Is Future:', trialEnd > now);
        }
        
        // Recommend action
        if (subscription.status === 'expired' || !subscription.has_access) {
            console.log('\n💡 ISSUE DETECTED: Trial appears expired');
            console.log('🔧 SOLUTION: Run the SQL fix in Supabase to reset trial');
        } else {
            console.log('\n✅ Trial status looks correct');
        }
        
    } catch (error) {
        console.error('❌ Error checking trial status:', error);
    }
}

checkTrialStatus();