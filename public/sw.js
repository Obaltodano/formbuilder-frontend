// Service Worker para FormBuilder Pro PWA
// Versión del cache - incrementar para forzar actualización
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `formbuilder-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `formbuilder-dynamic-${CACHE_VERSION}`;

// Archivos a cachear en la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs de API que NO deben cachearse
const API_URLS = [
  '/api/',
  '/auth/',
  '/formularios',
  '/respuestas',
  '/usuarios'
];

// ============================================
// EVENTO: INSTALL
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando assets estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Assets cacheados correctamente');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Error cacheando assets:', err);
      })
  );
});

// ============================================
// EVENTO: ACTIVATE
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('formbuilder-') && 
                     !name.includes(CACHE_VERSION);
            })
            .map((name) => {
              console.log('[SW] Eliminando cache antiguo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Cache limpiado, tomando control...');
        return self.clients.claim();
      })
  );
});

// ============================================
// EVENTO: FETCH (Network First con fallback)
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones no GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar chrome-extension y peticiones de analytics
  if (url.protocol === 'chrome-extension:' || 
      url.hostname.includes('google-analytics') ||
      url.hostname.includes('firebase')) {
    return;
  }
  
  // ⭐ CRÍTICO: Ignorar peticiones cross-origin (backend en diferente puerto)
  // El SW solo debe manejar peticiones del mismo origen para evitar problemas CORS
  if (url.origin !== self.location.origin) {
    console.log('[SW] Ignorando petición cross-origin:', url.origin);
    return;
  }
  
  // Estrategia para API calls (mismo origen): Network First
  if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Estrategia para assets estáticos: Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Estrategia por defecto: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ============================================
// ESTRATEGIAS DE CACHE
// ============================================

// Network First: Intenta red, falla a cache (para APIs)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Fallo red, buscando en cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si es una navegación y no hay cache, mostrar offline page
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Cache First: Intenta cache, falla a red (para assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error fetch:', error);
    throw error;
  }
}

// Stale While Revalidate: Devuelve cache, actualiza en background
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Fallo revalidación:', error);
    });
  
  return cachedResponse || fetchPromise;
}

// ============================================
// HELPERS
// ============================================

function isAPIRequest(url) {
  return API_URLS.some(apiPath => url.pathname.includes(apiPath));
}

function isStaticAsset(url) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', 
    '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json'
  ];
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// ============================================
// EVENTO: PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: true,
    actions: data.actions || [],
    data: data.payload || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'FormBuilder Pro', 
      options
    )
  );
});

// ============================================
// EVENTO: NOTIFICATION CLICK
// ============================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const notificationData = event.notification.data;
  let url = '/';
  
  if (notificationData && notificationData.url) {
    url = notificationData.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ============================================
// EVENTO: SYNC (Background Sync)
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-respuestas') {
    event.waitUntil(syncRespuestasPendientes());
  }
});

async function syncRespuestasPendientes() {
  // Implementar lógica de sincronización de respuestas pendientes
  console.log('[SW] Sincronizando respuestas pendientes...');
  
  const db = await openDB('formbuilder-offline', 1);
  const respuestasPendientes = await db.getAll('respuestas-pendientes');
  
  for (const respuesta of respuestasPendientes) {
    try {
      await fetch('/api/respuestas', {
        method: 'POST',
        body: respuesta.formData
      });
      await db.delete('respuestas-pendientes', respuesta.id);
    } catch (error) {
      console.error('[SW] Error sincronizando respuesta:', error);
    }
  }
}

// ============================================
// MENSAJES DESDE LA APP
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('[SW] Service Worker cargado correctamente');
