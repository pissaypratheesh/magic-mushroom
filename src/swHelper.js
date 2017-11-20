/**
 * Created on 22/5/17.
 */
var isSubscribed = false;
var applicationServerPublicKey = "BHgQFissFxXid62unZLcaLguw9GkC3yW0CqQgYFfMUwMRpONtn3FCZy1f8Sn1jbPZkHJBRJQne0avDvM_65OmW4";
var appVersion = "1.0.9";
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isFirefox = typeof InstallTrigger !== 'undefined';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js?mode=pwa&v='+appVersion, { insecure: true, scope:'/news'}).then(function(reg) {
    //console.log('Service Worker is registered', reg);
    //subscribe();
    initialiseState();
  }).catch(function(err) {
    console.error('Service Worker Error', err);
  });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function initialiseState() {
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    // Do we already have a push message subscription?
    serviceWorkerRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      isSubscribed = (subscription !== null);

      if (isSubscribed) {
        //console.log('User IS subscribed.');
      } else {
        //console.log('User is NOT subscribed.');
        //subscribeUser();
      }

      //updateBtn();
    });
  });
}

function subscribeUser() {
  var applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      // Do we already have a push message subscription?
      serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(applicationServerPublicKey)
      })
      .then(function(subscription) {
        // console.log(subscription);
        // console.log('User is subscribed:', JSON.stringify(subscription));
        /*if(isFirefox) {
          //console.log(base64url.encode(subscription.getKey('p256dh')));
          console.log(JSON.stringify(subscription.getKey('p256dh')));
          //console.log(subscription.getKey('auth'));
        }*/
        isSubscribed = true;
      })
      .catch(function(err) {
        if (Notification.permission === 'denied') {
          console.warn('Permission for notifications was denied');
        } else {
          console.error('Failed to subscribe the user: ', err);
        }
        //updateBtn();
      });
  });
}


function urlB64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

var base64url = {
  _strmap: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  encode: function(data) {
    data = new Uint8Array(data);
    var len = Math.ceil(data.length * 4 / 3);
    return chunkArray(data, 3).map(chunk => [
      chunk[0] >>> 2,
      ((chunk[0] & 0x3) << 4) | (chunk[1] >>> 4),
      ((chunk[1] & 0xf) << 2) | (chunk[2] >>> 6),
      chunk[2] & 0x3f
    ].map(v => base64url._strmap[v]).join('')).join('').slice(0, len);
  },
  _lookup: function(s, i) {
    return base64url._strmap.indexOf(s.charAt(i));
  },
  decode: function(str) {
    var v = new Uint8Array(Math.floor(str.length * 3 / 4));
    var vi = 0;
    for (var si = 0; si < str.length;) {
      var w = base64url._lookup(str, si++);
      var x = base64url._lookup(str, si++);
      var y = base64url._lookup(str, si++);
      var z = base64url._lookup(str, si++);
      v[vi++] = w << 2 | x >>> 4;
      v[vi++] = x << 4 | y >>> 2;
      v[vi++] = y << 6 | z;
    }
    return v;
  }
};
