// Service Worker for TrulyBot - Advanced Caching and Performance
const CACHE_NAME = 'trulybot-v1.0.0';
const STATIC_CACHE = 'trulybot-static-v1.0.0';
const DYNAMIC_CACHE = 'trulybot-dynamic-v1.0.0';
const IMAGE_CACHE = 'trulybot-images-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/pricing',
  '/pricing-india',
  '/features',
  '/about',
  '/contact',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/_next/static/css',
  '/_next/static/chunks',
];

// API routes that should be cached
const CACHEABLE_API_ROUTES = [
  '/api/public',
  '/api/widget',
  '/api/pricing',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes('trulybot-v1.0.0')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except for fonts and images
  if (url.origin !== self.location.origin && 
      !request.url.includes('fonts.googleapis.com') &&
      !request.url.includes('fonts.gstatic.com') &&
      !request.url.includes('.jpg') &&
      !request.url.includes('.png') &&
      !request.url.includes('.webp') &&
      !request.url.includes('.svg')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isAPIRoute(request)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Cache strategies
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return await getOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(request) {
  return request.url.includes('/_next/static/') ||
         request.url.includes('.css') ||
         request.url.includes('.js') ||
         request.url.includes('manifest.json') ||
         request.url.includes('favicon.ico') ||
         request.url.endsWith('.svg');
}

function isImage(request) {
  return request.destination === 'image' ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.png') ||
         request.url.includes('.webp') ||
         request.url.includes('.avif') ||
         request.url.includes('.gif');
}

function isAPIRoute(request) {
  return request.url.includes('/api/') &&
         CACHEABLE_API_ROUTES.some(route => request.url.includes(route));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

async function getOfflineFallback(request) {
  if (isNavigationRequest(request)) {
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
  
  if (isImage(request)) {
    const offlineImage = await caches.match('/offline-image.svg');
    return offlineImage || new Response('', { status: 503 });
  }
  
  return new Response('Offline', { status: 503 });
}

// Background sync for analytics and user actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
  
  if (event.tag === 'user-action-sync') {
    event.waitUntil(syncUserActions());
  }
});

async function syncAnalytics() {
  // Sync cached analytics data when online
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const analyticsData = await cache.match('/analytics-queue');
    if (analyticsData) {
      const data = await analyticsData.json();
      // Send to analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      cache.delete('/analytics-queue');
    }
  } catch (error) {
    console.log('Analytics sync failed:', error);
  }
}

async function syncUserActions() {
  // Sync user actions when online
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const actionsData = await cache.match('/actions-queue');
    if (actionsData) {
      const data = await actionsData.json();
      // Send to backend
      await fetch('/api/user-actions', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      cache.delete('/actions-queue');
    }
  } catch (error) {
    console.log('User actions sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/view-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll().then((clientsList) => {
        const hadWindowToFocus = clientsList.some((windowClient) => {
          if (windowClient.url === urlToOpen) {
            windowClient.focus();
            return true;
          }
          return false;
        });

        if (!hadWindowToFocus) {
          clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_DATA') {
    // Store performance data for later sync
    const performanceData = event.data.data;
    caches.open(DYNAMIC_CACHE).then(cache => {
      cache.put('/performance-data', new Response(JSON.stringify(performanceData)));
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache size management
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    // Remove entries older than 30 days
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (responseDate < cutoffTime) {
          await cache.delete(request);
        }
      }
    }
  }
}

// Periodic cache cleanup
setInterval(cleanupOldCaches, 24 * 60 * 60 * 1000); // Once per day