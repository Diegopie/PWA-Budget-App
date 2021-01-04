// * Global Variables
const cacheFileName = "budget-cache-v1.5";
const cachedDataFile = "data-v1.1"
const filesToCache = [
    "/",
    "/assets/styles.css",
    "/assets/js/index.js",    
    "/assets/js/db.js",    
    "/assets/manifest.webmanifest",
    "/assets/icons/icon-192x192.png",
    "/assets/icons/icon-512x512.png",
  ];



// * Event Listeners
// ** On SW Install, Catch Files for Offline Use
self.addEventListener('install', (e) => {
    // console.log("Hit sw install");
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
                        if (key !== cacheFileName && key !== cachedDataFile) {
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


// ** On All Fetch Request, Intercept and Serve Through SW; If Offline, Serve Cached offline.html Page
self.addEventListener('fetch', (e) => {
    console.log("Fetch Listener Intercept: ", e.request);
    // Handle API Reqs
    if (e.request.url.includes("/api")) {
        return e.respondWith(
            caches
                .open(cachedDataFile)
                .then(dataCache => {
                   return fetch(e.request)
                    .then(res => {
                        if (res.status === 200) {
                            dataCache.put(e.request.url, res.clone());
                        }
                        return res;
                    })
                    .catch(err => {
                        console.log("On SW Fetch API Intercept, response error: ", err);
                        return dataCache.match(e.request);
                    })
                })
                .catch(err => console.log("On SW API Open Cache Error: ", err))
        )
    }
    // Handle All Other Reqs
    e.respondWith(
        caches
            .match(e.request)
            .then(res => {
                return res || fetch(e.request)                
            })
            .catch(err => console.log("Handle other reqs err: ", err))                
    )
});