// Custom Service Worker logic bundled by @ducanh2912/next-pwa

// Listen for push notifications
self.addEventListener('push', (event: any) => {
  let data: any = { title: 'YKS Yıldızı ✨', body: 'Yeni bir bildiriminiz var!', url: '/dashboard' };

  if (event.data) {
    try {
      data = { ...data, ...JSON.parse(event.data.text()) };
    } catch (_) {
      try {
        data.body = event.data.text();
      } catch (__) {}
    }
  }

  if ('setAppBadge' in navigator) {
    (navigator as any).setAppBadge().catch(() => {});
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
    (self as any).registration.showNotification(data.title, options)
  );
});

// Message handlers
self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SHOW_LOCAL_NOTIFICATION') {
    const { title, options } = event.data;
    if ('setAppBadge' in navigator) {
      (navigator as any).setAppBadge().catch(() => {});
    }
    event.waitUntil(
      (self as any).registration.showNotification(title || 'YKS Yıldızı', {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200, 100, 200],
        renotify: true,
        ...options,
      })
    );
  } else if (event.data && event.data.type === 'UPDATE_TIMER_NOTIFICATION') {
    const { title, body, tag, actions, silent } = event.data;
    event.waitUntil(
      (self as any).registration.showNotification(title || '🍅 Odaklanma Devam Ediyor', {
        body: body || 'Kalan süre hesaplanıyor...',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: tag || 'yks-live-timer',
        renotify: false,
        silent: silent !== undefined ? silent : true,
        vibrate: [],
        data: {
          url: '/dashboard?tab=focus',
          dateOfArrival: Date.now(),
        },
        actions: actions || [
          { action: 'open_focus', title: '⏱️ Odaklanmaya Dön' },
        ],
        // Android keeps sticky in notification shade while timer is running
        ongoing: true,
      })
    );
  } else if (event.data && event.data.type === 'CLEAR_TIMER_NOTIFICATION') {
    const tagToClose = event.data.tag || 'yks-live-timer';
    event.waitUntil(
      (self as any).registration.getNotifications({ tag: tagToClose }).then((notifications: any[]) => {
        notifications.forEach((n) => n.close());
      })
    );
  } else if (event.data && event.data.type === 'CLEAR_BADGE') {
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge().catch(() => {});
    }
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  if ('clearAppBadge' in navigator) {
    (navigator as any).clearAppBadge().catch(() => {});
  }

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/dashboard?tab=focus';

  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any[]) => {
      for (const client of clientList) {
        if (client.url.includes((self as any).location.origin) && 'focus' in client) {
          try {
            client.postMessage({ type: 'NAVIGATE_TAB', tab: 'focus' });
          } catch (_) {}
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(targetUrl);
      }
    })
  );
});
