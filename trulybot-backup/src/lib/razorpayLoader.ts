// Lazy loader for Razorpay checkout script
// Ensures the external script is only inserted when a payment is initiated.
// Provides a single shared promise to avoid duplicate script tags / race conditions.

let razorpayLoadPromise: Promise<any> | null = null;

export function loadRazorpay(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('WINDOW_UNAVAILABLE'));
  }
  // If already present, resolve immediately.
  if ((window as any).Razorpay) {
    return Promise.resolve((window as any).Razorpay);
  }
  if (razorpayLoadPromise) return razorpayLoadPromise;

  razorpayLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => {
        if ((window as any).Razorpay) resolve((window as any).Razorpay); else reject(new Error('RAZORPAY_SDK_LOAD_FAILED'));
      });
      existing.addEventListener('error', () => reject(new Error('RAZORPAY_SDK_NETWORK_ERROR')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).Razorpay) {
        resolve((window as any).Razorpay);
      } else {
        reject(new Error('RAZORPAY_SDK_LOAD_FAILED'));
      }
    };
    script.onerror = () => reject(new Error('RAZORPAY_SDK_NETWORK_ERROR'));
    document.head.appendChild(script);
    // Timeout safeguard
    setTimeout(() => {
      if (!(window as any).Razorpay) {
        reject(new Error('RAZORPAY_SDK_TIMEOUT'));
      }
    }, 15000);
  });
  return razorpayLoadPromise;
}

export function resetRazorpayLoaderForTests() {
  razorpayLoadPromise = null;
}
