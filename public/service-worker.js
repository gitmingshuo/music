// 基础的 Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 处理 %PUBLIC_URL% 的替换
  const url = event.request.url;
  if (url.includes('%PUBLIC_URL%')) {
    const newUrl = url.replace(/%PUBLIC_URL%\//g, '');
    event.respondWith(fetch(newUrl));
    return;
  }
  
  event.respondWith(fetch(event.request));
}); 