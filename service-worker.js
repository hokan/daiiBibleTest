// service-worker.js 改进版本
const CACHE_NAME = 'daii-bible-v1.11-no-copy'; // 修改版本号

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/daiiBibleTest/',
        '/daiiBibleTest/index.html',
        '/daiiBibleTest/style.css?ver=1.10a', // 添加版本参数
        '/daiiBibleTest/script.js?ver=1.10b',
        '/daiiBibleTest/manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 修改后的 fetch 事件处理
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 动态资源不缓存
  if (url.pathname.includes('/bible_data.json')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 核心文件网络优先策略
  if (url.pathname.includes('/daiiBibleTest/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 更新缓存
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 其他请求保持原有逻辑
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
