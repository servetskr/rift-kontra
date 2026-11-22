/* Rift Kontra çevrimdışı önbelleği
 * - Görseller: önce önbellek (değişmez dosyalar)
 * - Sayfa, kod ve veriler: önce ağ, ağ yoksa önbellek (her yamada yeni veri hemen gelsin)
 */
const CACHE = "rk-v12";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.includes("/img/")) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
      return r;
    })));
    return;
  }
  // no-store: tarayıcının HTTP önbelleği (GitHub Pages 10 dk) atlanır, internet varken hep en yeni sürüm gelir
  e.respondWith(fetch(e.request, { cache: "no-store" }).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./"))));
});
