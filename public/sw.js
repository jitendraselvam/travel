const CACHE='nyc-for-two-static-v8-editorial-3.2';
const ASSETS=['./','./index.html','./style.css?v=3.2','./app.js?v=3.2','./data.js?v=3.2','./board.js?v=3.2','./editor.js?v=3.2','./secret.js?v=3.2','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nyc-for-two-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/healthz')return;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request,{cache:'no-cache'}).catch(()=>caches.open(CACHE).then(c=>c.match('./index.html'))));return;}
 event.respondWith(caches.open(CACHE).then(async c=>{const cached=await c.match(event.request);if(cached)return cached;return fetch(event.request);}));
});
