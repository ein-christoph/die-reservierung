// Establish a cache name
const cacheName = "DIERESERVIERUNG_v1";

self.addEventListener("fetch", event => {
    event.respondWith(caches.open(cacheName).then(cache => {
        //Hit the network
        return fetch(event.request).then(fetchedResponse => {
          // Return the network response
          return fetchedResponse;
        });
    }));
});

self.addEventListener("install", function (event) {
    console.log("SW installed 🤙");
  });
  
self.addEventListener('activate', (event) => {
event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
    await self.registration.navigationPreload.enable();
    }
})());

// Tell the active service worker to take control of the page immediately.
self.clients.claim();
});