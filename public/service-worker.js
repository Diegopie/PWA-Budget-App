

// * Global Variables
const cacheFileName = "budget-cache-v1.0";
const cacheDataName = "data-v1.0"
const filesToCache = [
    "/",
    "/assets/styles.css",
    "/assets/index.js",
    "/assets/manifest.webmanifest",
    "/assets/icons/icon-192x192.png",
    "/assets/icons/icon-512x512.png",
  ];


// * Event Listeners
// ** On SW Install, Catch Files for Offline Use
self.addEventListener('install', (e) => {
    console.log("Hit sw install");
    e.waitUntil(
        caches
            .open(cacheFileName)
            .then(cache => {
                return cache.addAll(filesToCache)
            })
            .catch(err => console.log("On SW Install, caching error: ", err))
    );
    self.skipWaiting();
});

// ** On SW Activation, Check For cacheFileName Change and Delete Old File
self.addEventListener('activate', (e) => {
    console.log("hit sw activation");
    e.waitUntil(
        caches
            .keys()
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== cacheFileName && key !== cacheDataName) {
                            console.log("Deleting Key: ", key);
                            return caches.delete(key);
                        }
                    })
                )
            })
            .catch(err => console.log("On SW Activation, key delete error: ", err))
    );
    self.clients.claim();
})
