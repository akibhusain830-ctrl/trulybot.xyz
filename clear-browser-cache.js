// Browser cache clearing script
// Run this in your browser's developer console to clear all caches

console.log('🧹 Clearing browser cache...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.clear();
  console.log('✅ localStorage cleared');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
}

// Clear IndexedDB (if any)
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    });
    console.log('✅ IndexedDB cleared');
  }).catch(err => {
    console.log('ℹ️ IndexedDB clear not needed:', err);
  });
}

// Clear service worker cache (if any)
if ('serviceWorker' in navigator && 'caches' in window) {
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('✅ Service Worker caches cleared');
  }).catch(err => {
    console.log('ℹ️ Service Worker cache clear not needed:', err);
  });
}

// Force refresh auth state
if (typeof window !== 'undefined' && window.location) {
  console.log('🔄 Dispatching auth refresh event...');
  window.dispatchEvent(new CustomEvent('auth-state-refresh'));
}

console.log('✨ Cache clearing complete! Please refresh the page (Ctrl+F5 or Cmd+Shift+R)');