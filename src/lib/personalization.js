import Fingerprint2 from 'fingerprintjs2';
import idb from 'idb';
import {makeRequest} from '../lib/makeRequest'
var deviceInfo = require('./deviceDetect');

var ClientJS = require('clientjs/dist/client.min');
var _ = require('underscore');
var cookie = require('js-cookie');
var time = 36500; // 100 years in days

_.mixin(require('./mixins'));


let personalization = {
  // 1.Creates the fingerprint
  // 2.Makes n/w call to get the clientid for the fingerprint
  // 3.Stores the fingerprint and clientid in localStorage and cookie and returns the same
  getFingerprint(store, callback){
    let uniqueFp;
    let context = this;
    this.getFromFingerprintjs(function (fpFromFpjs, comp) {
      var client = context.getClientData(fpFromFpjs);
      uniqueFp = fpFromFpjs; // Replace with fingerprint to use clientjs fingerprint
      var urlObj = {urlList:[{url:'/apis/getclientid', source:"client", method:'get',body:context.getClientidBody(store, client)}]};
      makeRequest(urlObj,function (err, resp) {
        let respHeaders = _.at(resp,'0.headers');
        let clientid =  _.at(resp,'0.data.clientid');
        if(err || !clientid){
          return callback(err || "no clientid", null);
        }
        clientid && (client.clientid = clientid);
        _.extend(client,{ip: respHeaders.ip, clientData:respHeaders.clientData});
        context.storeData({
          clientId: clientid,
          fingerprint: uniqueFp
        })
        callback(null,{
          clientId: _.at(resp,'0.data.clientid'),
          client: client
        })
      })
    })
  },

  storeData(data){
    idb.open('personalization',1,(upgradedb)=>{
      var store = upgradedb.createObjectStore('signature',{
        keyPath: 'id'
      })
      _.each(data,(val,key)=>{
        cookie.set(key, val, time);
        window.localStorage.setItem(key, val);
        store.put({id:key,val:val})
      });
    })

    /*  //Code to read from indexdb
        const dbPromise = idb.open('personalization',1,(db)=>{
          db.createObjectStore('signature')
        })
        const idbKeyval = {
          get(key) {
            return dbPromise.then(db => {
              return db.transaction('signature')
                .objectStore('signature').get(key);
            });
          },
        }
       idbKeyval.get('fingerprint').then(val => console.log("first-->",val));//{id: "fingerprint", val: "01e84c38a1f3f2392ca421c779bffbf9"}
       idbKeyval.get('clientId').then(val => console.log("sec===>",val))//{id: "clientId", val: "pratheesh"}
    */
  },

  // Should be used while the app is running and NOT at the start of the app
  fetchDataFromStorage(){
    let clientid = cookie.get('clientid'),
      fingerprint = cookie.get('fingerprint');
    if(!clientid || !fingerprint){
      !clientid && (clientid = window.localStorage.getItem('clientid'))
      !fingerprint && (fingerprint = window.localStorage.getItem('fingerprint'))
    }
    if(clientid && fingerprint)
      return {clientid, fingerprint};

    return this.getDataFromIndexDb((err, data)=>{
      if(err){
        //Case when clientid/fingerprint is not present in cookie or localStorage or indexDb
        /*return this.getFingerprint((err,data)=>{
          if(!err){
            return {
              clientid: data.clientId,
              fingerprint: data.client.fingerprint
            }
          }
        });*/
      }
      return data;
    })
  },

  getDataFromIndexDb(callback){
    const dbPromise = idb.open('personalization',1,(db)=>{
      db.createObjectStore('signature')
    });
    let data = {};
    const idbKeyval = {
      get(key) {
        return dbPromise.then(db => {
          return db.transaction('signature')
            .objectStore('signature').get(key);
        });
      },
    };
    return idbKeyval.get('fingerprint').then(fingerprint => {
      idbKeyval.get('clientId').then(clientid => {
        callback(null, {
          fingerprint: fingerprint.val,
          clientid: clientid.val
        })
      }).catch((err)=>{
        callback(err,null)
      })
    }).catch((err)=>{
      callback(err,null)
    });
  },

  getClientidBody(store, client){
    let clientId = client.clientid;
    /*if(!clientId){
      let storage = this.fetchDataFromStorage();
      clientId = storage && storage.clientid;
    }*/
    let body = {
      "cp": {
        "al": store.selectedLang,
        "av": store.appVersion,
        "os": "pwa",
        "e": "india",
        "h": _.at(client,'deviceInfo.deviceSize.height'),
        "l": store.selectedLang,
        "osv": "os version if applicable>",
        "w": _.at(client,'deviceInfo.deviceSize.width'),
        "udid": client.fingerprint
      },
      "instType": "INSTALL",
      'rfr':"utm_source=DailyHuntHome"
    }
    clientId && (body.cp.cid = clientId);
    return body;
  },

  // Should be used at the start of the app and NOT  while the app is running
  fetchData(){
   /* return this.getFingerprint((err,data)=>{
      if(!err){
        return {
          clientid: data.clientId,
          fingerprint: data.client.fingerprint
        }
      }
    })*/
  },

  getFromFingerprintjs(callback){
    new Fingerprint2().get((fingerprint, components) => {
      callback(fingerprint, components);
    })
  },

  getClientData(fingerprint){
    let client = new ClientJS();
    return {
      fingerprint: fingerprint,
      deviceInfo: deviceInfo
    }
  },

  sendInstrumentData(data){
    //Create body and make call
    var urlObj = {urlList:[{url:'/apis/getclientid?fp=' + data, source:"client", method:'get'}]};
    makeRequest(urlObj,function (err, resp) {
      if(err){
        console.error(" error sending instrumentation data");
        return;
      }
      console.log("Successfully sent instrument data:",data);
    })
  },

  getLocation(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        callback(null, {lat: pos.coords.latitude, long: pos.coords.longitude})
      }, (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            callback("User denied the request for Geolocation", null);
            break;
          case error.POSITION_UNAVAILABLE:
            callback("Location information is unavailable", null);
            break;
          case error.TIMEOUT:
            callback("The request to get user location timed out", null);
            break;
          case error.UNKNOWN_ERROR:
            callback("An unknown error occurred", null);
            break;
        }
      });
    } else {
      console.log("Geolocation is not supported by this browser", null);
    }
  },
}

export default personalization;


//Client available functions: (https://clientjs.org/)
//      client.getSoftwareVersion();
//
/* client.getBrowserData() looks like:
{
  "ua": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
  "browser": {
  "name": "Chrome",
    "version": "58.0.3029.110",
    "major": "58"
},
  "engine": {
  "version": "537.36",
    "name": "WebKit"
},
  "os": {
  "name": "Android",
    "version": "6.0"
},
  "device": {
  "model": "Nexus 5",
    "vendor": "LG",
    "type": "mobile"
},
  "cpu": {}
}
*/

//      client.getFingerPrint();
//      client.getCustomFingerprint(...);
//
//      client.getUserAgent();
//      client.getUserAgentLowerCase();
//
//      client.getBrowser();
//      client.getBrowserVersion();
//      client.getBrowserMajorVersion();
//      client.isIE();
//      client.isChrome();
//      client.isFirefox();
//      client.isSafari();
//      client.isMobileSafari();
//      client.isOpera();
//
//      client.getEngine();
//      client.getEngineVersion();
//
//      client.getOS();
//      client.getOSVersion();
//      client.isWindows();
//      client.isMac();
//      client.isLinux();
//      client.isUbuntu();
//      client.isSolaris();
//
//      client.getDevice();
//      client.getDeviceType();
//      client.getDeviceVendor();
//
//      client.getCPU();
//
//      client.isMobile();
//      client.isMobileMajor();
//      client.isMobileAndroid();
//      client.isMobileOpera();
//      client.isMobileWindows();
//      client.isMobileBlackBerry();
//
//      client.isMobileIOS();
//      client.isIphone();
//      client.isIpad();
//      client.isIpod();
//
//      client.getScreenPrint();
//      client.getColorDepth();
//      client.getCurrentResolution();
//      client.getAvailableResolution();
//      client.getDeviceXDPI();
//      client.getDeviceYDPI();
//
//      client.getPlugins();
//      client.isJava();
//      client.getJavaVersion();
//      client.isFlash();
//      client.getFlashVersion();
//      client.isSilverlight();
//      client.getSilverlightVersion();
//
//      client.getMimeTypes();
//      client.isMimeTypes();
//
//      client.isFont();
//      client.getFonts();
//
//      client.isLocalStorage();
//      client.isSessionStorage();
//      client.isCookie();
//
//      client.getTimeZone();
//
//      client.getLanguage();
//      client.getSystemLanguage();
//
//      client.isCanvas();
//      client.getCanvasPrint();


