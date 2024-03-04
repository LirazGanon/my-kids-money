self.addEventListener("install", (event) => {
  // Precache the index.html
  event.waitUntil(
    caches.open("precache").then((cache) => {
      return cache.add("index.html");
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // Immediately take control of the page
});

self.addEventListener("fetch", (event) => {
  // Respond with cached resources or fetch from network and cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open("runtime").then((cache) => {
        return fetch(event.request).then((response) => {
          // Don't cache post requests or non-get requests
          if (
            event.request.method === "GET" &&
            !event.request.url.includes("/assets/")
          ) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
