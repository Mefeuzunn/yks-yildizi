// YKS Yıldızı - Custom Service Worker
// @ducanh2912/next-pwa bu dosyayı otomatik kullanır

const CACHE_NAME = 'yks-yildizi-v5';
const STATIC_ASSETS = [
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/widgets/yks-summary-template.json',
];

// Install: statik varlıkları ve offline fallback sayfasını önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Cache addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: eski cache'leri temizle ve kullanıcı ekranındaki eski sayaç bildirimlerini otomatik kapat
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      // iOS ve mobilde kilit ekranında birikmiş eski sayaç balonlarını temizle
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((n) => {
          if (n.tag === 'yks-live-timer' || (n.title && (n.title.includes('Odak') || n.title.includes('🍅')))) {
            n.close();
          }
        });
      }).catch(() => {}),
    ])
  );
  self.clients.claim();
});

// Push bildirimi al
self.addEventListener('push', (event) => {
  let data = { title: 'YKS Yıldızı ✨', body: 'Yeni bir bildiriminiz var!', url: '/dashboard' };
  
  if (event.data) {
    try {
      data = { ...data, ...JSON.parse(event.data.text()) };
    } catch (_) {
      try {
        data.body = event.data.text();
      } catch (__) {}
    }
  }

  // App Badge desteği (iOS PWA & Android)
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge().catch(() => {});
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    tag: data.tag || 'yks-yildizi',
    renotify: true,
    vibrate: [200, 100, 200, 100, 250],
    data: {
      url: data.url || '/dashboard',
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: data.actions || [
      { action: 'open', title: '🚀 Görüntüle' },
      { action: 'close', title: '✕ Kapat' },
    ],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Doğrudan sayfadan / context'ten gelen yerel bildirim mesajları (örn: Pomodoro süresi bittiğinde)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_LOCAL_NOTIFICATION') {
    const { title, options } = event.data;
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge().catch(() => {});
    }
    event.waitUntil(
      self.registration.showNotification(title || 'YKS Yıldızı', {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200, 100, 200],
        renotify: true,
        ...options,
      })
    );
  } else if (event.data && event.data.type === 'UPDATE_TIMER_NOTIFICATION') {
    // iOS APNs ve mobil kilit ekranında her 5 saniyede bir bildirim baloncuğu basılmasını engelliyoruz.
    // Canlı ilerleme kilit ekranında yerel MediaSession ve sekme başlığı ile yönetilir.
    // Eski veya açık kalmış sayaç bildirimi varsa sadece kapatıyoruz:
    const tagToClose = event.data.tag || 'yks-live-timer';
    event.waitUntil(
      self.registration.getNotifications({ tag: tagToClose }).then((notifications) => {
        notifications.forEach((n) => n.close());
      }).catch(() => {})
    );
  } else if (event.data && event.data.type === 'CLEAR_TIMER_NOTIFICATION') {
    const tagToClose = event.data.tag || 'yks-live-timer';
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((n) => {
          if (n.tag === tagToClose || (n.title && (n.title.includes('Odak') || n.title.includes('🍅')))) {
            n.close();
          }
        });
      }).catch(() => {})
    );
  } else if (event.data && event.data.type === 'CLEAR_BADGE') {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  } else if (event.data && event.data.type === 'UPDATE_WIDGET') {
    updatePWAWidget(event.data.tag || 'yks-summary-widget');
  }
});

// Bildirime tıklandığında yönlendir
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Rozeti temizle
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge().catch(() => {});
  }
  
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/dashboard?tab=focus';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Açık sekme varsa ona odaklan ve yönlendir
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          try {
            client.postMessage({ type: 'NAVIGATE_TAB', tab: 'focus' });
          } catch (_) {}
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Yoksa yeni sekme aç
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Fetch: network-first with offline page fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API ve socket isteklerini cache'leme
  if (url.pathname.startsWith('/api/')) return;

  // Sayfa gezintileri (navigation) için: Ağdan dene, ağ yoksa /offline sayfasını sun
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline').then((offlineRes) => {
          return offlineRes || caches.match('/');
        });
      })
    );
    return;
  }

  // Diğer statik varlıklar: Cache first -> Network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((networkRes) => {
        return networkRes;
      }).catch(() => cached);
    })
  );
});

// ─── PWA WIDGETS DESTEĞİ (Android Chromium / Windows PWA) ───
async function updatePWAWidget(widgetTag = 'yks-summary-widget') {
  if (!('widgets' in self)) return;
  try {
    const [templateRes, dataRes] = await Promise.all([
      fetch('/widgets/yks-summary-template.json'),
      fetch('/api/widget/data')
    ]);
    const template = await templateRes.text();
    const data = await dataRes.text();

    await self.widgets.updateByTag(widgetTag, {
      template,
      data
    });
  } catch (err) {
    console.warn('PWA widget update error:', err);
  }
}

self.addEventListener('widgetinstall', (event) => {
  if ('widgets' in self) {
    const tag = event.widget?.definition?.tag || 'yks-summary-widget';
    event.waitUntil(updatePWAWidget(tag));
  }
});

self.addEventListener('widgetresume', (event) => {
  if ('widgets' in self) {
    const tag = event.widget?.definition?.tag || 'yks-summary-widget';
    event.waitUntil(updatePWAWidget(tag));
  }
});

self.addEventListener('widgetclick', (event) => {
  const verb = event.action;
  let targetUrl = '/dashboard';

  if (verb === 'focus') {
    targetUrl = '/dashboard?tab=focus';
  } else if (verb === 'addQuestions') {
    targetUrl = '/dashboard?tab=focus&action=add-questions';
  } else if (verb === 'openApp' || !verb) {
    targetUrl = '/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (verb === 'focus') {
            try { client.postMessage({ type: 'NAVIGATE_TAB', tab: 'focus' }); } catch (_) {}
          }
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

