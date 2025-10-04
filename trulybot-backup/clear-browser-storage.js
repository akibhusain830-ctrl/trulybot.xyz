// Clear all browser storage for localhost:3000 and localhost:3001
// Run this in the browser console

console.log('🧹 Clearing all browser storage...');

// Clear localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear sessionStorage  
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Clear all cookies for this domain
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies cleared');

// Clear IndexedDB (used by Supabase)
if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
        databases.forEach(db => {
            if (db.name && (db.name.includes('supabase') || db.name.includes('auth'))) {
                indexedDB.deleteDatabase(db.name);
                console.log('✅ Cleared IndexedDB:', db.name);
            }
        });
    });
}

console.log('🎉 All browser storage cleared! Please refresh the page.');
console.log('⚠️  Note: You still need real Supabase credentials for full functionality.');

alert('Browser storage cleared! Please refresh the page.');