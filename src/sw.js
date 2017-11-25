var appVersion = "1.0.9";
var sw = self && self.toolbox;
var CACHE_NAME = 'dh-cache';
var urlsToCache = [
  'index.html?mode=pwa&v='+appVersion
];
var cacheArray = ['dhapis', 'dh-cache'];// ['dhimagecaches','dhapis','dhassets'];

if(self && self.importScripts){
  self.importScripts('assets/sw-toolbox/sw-toolbox.js?mode=pwa', 'assets/sw-toolbox/toolbox-script.js?mode=pwa&v='+appVersion);

  // sw-offline-google-analytics *must* be imported and initialized before
  // sw-toolbox, because its 'fetch' event handler needs to run first.
  /* self.importScripts('/sw-offline-google-analytics/offline-google-analytics-import.js');
   goog.offlineGoogleAnalytics.initialize();*/
}

function fetchAndCache(url) {
    return fetch(url)
      .then(function(response) {
        // Check if we received a valid response
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(url, response.clone());
            return response;
          });
      })
      .catch(function(error) {
        //console.log('Request failed:', error);
        // You could return a custom offline 404 page here
      });
}


function fetchOnly(url) {
    return fetch(url)
      .then(function(response) {
        // Check if we received a valid response
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .catch(function(error) {
        //console.log('Request failed:', error);
        // You could return a custom offline 404 page here
      });
}



if(self) {
  self.addEventListener('install', function (event) {
    self.skipWaiting();
    if(event) {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function (cache) {
            return cache.addAll(urlsToCache);
          })
      );
    }
  });

  self.addEventListener('activate', function (event) {
    self.skipWaiting();
    event.waitUntil(
      caches.keys().then(function(keys){
        return Promise.all(keys.map(function(key, i){
          if(cacheArray.includes(key)){
            caches.delete(keys);
          }
        }))
      })
    )
  });

  self.addEventListener('fetch', function (event) {
    if(event) {
      var re1 = new RegExp("^https?://" + location.host,"g");
      var re2 = new RegExp("^https?://" + "[A-Za-z0-9.]*\.newshunt\.com","g");
      if(event.request && event.request.method !== "GET"){
        return event.respondWith(fetchOnly(event.request));
      }

      if(event.request.url.match(re1) || event.request.url.match(re2)){
        return event.respondWith(
          caches.match(event.request)
            .then(function (response) {
              if(response){
                fetchAndCache(event.request);
                return response;
              }
              return fetchAndCache(event.request);
            })
        );
     }
      return;
    }
  });

  self.addEventListener('message', function (event) {
    //console.log('From SW: message Event------->', event);
  });

  var body = 'Received a push notification';
  var title = 'Push Notification';
  var icon = '/assets/img/homescreen144.svg';
  var targetUrl = 'https://m.dailyhunt.in/';

  self.addEventListener('push', function (e) {

    if (e.data) {
      var obj = e.data.json();
      title = obj.title;
      body = obj.body;
      icon = obj.icon;
      targetUrl = obj.targetUrl;
    }

    var options = {
      body: body,
      tag: 'id1',
      icon: icon,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore', title: 'Go to the site',
          icon: '/assets/img/checkmark.png'
        },
        {
          action: 'close', title: 'Close the notification',
          icon: '/assets/img/xmark.png'
        },
      ]
    };

    e.waitUntil(
      self.registration.showNotification(title, options)
    );
  });

  self.addEventListener('notificationclose', function (e) {
    var notification = e.notification;
    var primaryKey = notification.data.primaryKey;

    //console.log('Closed notification: ' + primaryKey);
  });

  self.addEventListener('notificationclick', function (event) {
    let url = event.currentTarget.targetUrl;
    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          // If so, just focus it.
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, then open the target URL in a new window/tab.
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });


//APIs
  if (sw) {
    sw.router.get("/dist/(.*)", sw.networkFirst, {
      origin: "/",
      cache: {name: "dist"}
    });

    sw.router.get("/apis/news?langCode=en", function (a, b) {
      //console.log(" in router get -->", a, b)
    });

    sw.router.get("/news/:country/:lang", function (a, b, c) {
      event.respondWith(caches.match(a).catch(function (watever) {
        //console.log(" watver-->", watever, event.request);
        return fetch(event.request);
      }).then(function (response) {
        caches.open('v1').then(function (cache) {
          //console.log(" wth happening cache event,event.req,res-->", cache, event, event.request, response)
          //cache.put(event.request, response);
        });
        return response.clone();
      }).catch(function () {
        return caches.match('/assets/img/dailyhunt.svg');
      }));
    })
    /*    sw.router.get("/assets/(.*)", sw.cacheFirst, {
     origin: "/",
     cache: {name: "assets"}
     });*/
  }

}
