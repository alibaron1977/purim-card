const CACHE="purim-donate-sign-v2";
const ASSETS=[
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/sw.js",
  "/assets/wizo-logo.png",
  "/assets/card-bg-portrait.png",
  "/assets/purim-card.png",
  "/assets/og.png",
  "/data/signatures.json"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request))));
