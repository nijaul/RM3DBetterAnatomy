const CACHE = "racemarket-v42-horse-model-2-enhanced";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./race3d.js",
  "./app.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(ASSETS)
    )
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(
      response =>
        response ||
        fetch(event.request)
    )
  );
});
