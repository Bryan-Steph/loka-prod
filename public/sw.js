const CACHE = 'loka-v1'
const STATIC = ['/', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return  // never cache API calls
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  )
})

// ─── Push notifications ──────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'LOKA', body: event.data.text(), url: '/' }
  }

  const options = {
    body:    payload.body,
    icon:    '/icons/icon-192.png',
    badge:   '/icons/icon-192.png',
    data:    { url: payload.url || '/' },
    vibrate: [100, 50, 100],
    // Keep the notification visible until the user acts on it
    requireInteraction: false,
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing tab if the URL matches
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open a new tab
        return clients.openWindow(targetUrl)
      })
  )
})