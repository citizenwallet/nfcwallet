// Define a cache name
const cacheName = "my-pwa-cache-v1";

// Function to fetch the Next.js build manifest
async function fetchBuildManifest() {
  try {
    const response = await fetch("/_next/static/webpack/*/_buildManifest.js");
    if (response.ok) {
      const manifest = await response.json();
      return manifest;
    }
  } catch (error) {
    console.error("Failed to fetch build manifest:", error);
  }
  return null;
}

// Function to generate the list of files to cache
async function generateCacheList() {
  const buildManifest = await fetchBuildManifest();
  if (!buildManifest) {
    return [];
  }

  const cacheList = Object.values(buildManifest)
    .filter(entry => entry && entry["file"])
    .map(entry => entry["file"]);

  // Add additional URLs to cache as needed
  cacheList.push("/", "/manifest.json");

  return cacheList;
}

// Install event: Cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return generateCacheList().then(cacheList => {
        return cache.addAll(cacheList);
      });
    }),
  );
});

// Fetch event: Serve cached files or fetch from network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }),
  );
});

// Activate event: Clean up old caches (optional)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== cacheName) {
            return caches.delete(name);
          }
        }),
      );
    }),
  );
});
