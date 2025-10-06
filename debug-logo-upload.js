// Logo Upload Debug Script
// Run this in browser console on the settings page to see the exact error

console.log('🔍 Debugging Logo Upload Issue...');

// Override console.error to catch all errors
const originalError = console.error;
const errors = [];
console.error = function(...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

// Check Supabase client
if (window.supabase) {
  console.log('✅ Supabase client available');
  
  // Test storage bucket access
  window.supabase.storage.from('chatbot-assets').list()
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Storage bucket error:', error);
      } else {
        console.log('✅ Storage bucket accessible');
      }
    });
} else {
  console.log('❌ Supabase client not available');
}

// Monitor file input changes
document.addEventListener('change', (e) => {
  if (e.target.type === 'file' && e.target.accept && e.target.accept.includes('image')) {
    console.log('📁 File selected for logo upload:', e.target.files[0]?.name);
    
    // Monitor the upload process
    setTimeout(() => {
      console.log('Recent errors during upload:');
      errors.forEach(error => console.log('❌', error));
      if (errors.length === 0) {
        console.log('✅ No errors detected during upload');
      }
    }, 2000);
  }
});

console.log('🎯 Now try uploading a logo and check the output above.');