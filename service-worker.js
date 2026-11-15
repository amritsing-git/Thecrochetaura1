const CACHE_NAME = 'crochet-aura-v1';

const FILES = [
 './',
 './index.html',
 './shop.html',
 './product.html',
 './about.html',
 './custom-orders.html',
 './contact.html',
 './login.html',
 './signup.html',
 './account.html',
 './cart.html',
 './checkout.html',
 './admin.html',
 './style.css',
 './admin.css',
 './app.js',
 './admin.js',
 './manifest.json'
];

self.addEventListener('install',event=>{
 event.waitUntil(
  caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES))
 );
 self.skipWaiting();
});

self.addEventListener('activate',event=>{
 event.waitUntil(
  caches.keys().then(keys=>
   Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
  )
 );
 self.clients.claim();
});

self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 event.respondWith(
  caches.match(event.request).then(cached=>
   cached||fetch(event.request)
  )
 );
});