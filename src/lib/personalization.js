import Fingerprint2 from 'fingerprintjs2';
import {makeRequest} from '../lib/makeRequest'
import {pushGeneric} from './instrumentation';
import {appVersion} from '../config/constants'
import {idbArrToJson,indexedDb} from './indexedDb';

var deviceInfo = require('./deviceDetect');
var ClientJS = require('clientjs/dist/client.min');
var _ = require('underscore');
var cookie = require('js-cookie');
var time = 36500; // 100 years in days
var dbFns = indexedDb('personalization','signature');

_.mixin(require('./mixins'));

let personalization = {

  // 1.Creates the fingerprint
  // 2.Makes n/w call to get the clientid for the fingerprint
  // 3.Stores the fingerprint and clientid in localStorage and cookie and returns the same

  getFingerprint(store, callback){
    let uniqueFp;
    let context = this;
    this.getFromFingerprintjs(function (fpFromFpjs, comp) {
      var client = context.getClientData(fpFromFpjs),
          calltype = "handshake";
      uniqueFp = fpFromFpjs; // Replace with fingerprint to use clientjs fingerprint
      context.fetchDataFromStorage((err, storageResp)=>{
        if(err || _.isEmpty(storageResp)){
          calltype = 'install';
        }
        client.calltype = calltype;
        storageResp && _.extend(client,{clientid: storageResp.clientId,signature:storageResp.signature,fingerprint:storageResp.fingerprint || fpFromFpjs});
        context.addGlobalParams(client,store)
        var urlObj = {
          urlList:[{
              url:'/apis/getclientid?calltype='+calltype,
              method:'post',
              body:context.getClientidBody(store, client)
            }],
          source:'client',
          store:context.store
        };
        makeRequest(urlObj,function (err, resp) {
          let respHeaders = _.at(resp,'0.headers');
          let clientid =  _.at(resp,'0.data.data.clientId');
          let signature = respHeaders && respHeaders.cookie;

          if(err || !clientid){
            // Sending offline instrumentation calls
            context.instrumentationCalls(client);
            return callback(err || "no clientid", null);
          }
          clientid && (client.clientid = clientid);
          _.extend(client,{ip: _.at(respHeaders,'ip'), clientData:_.at(respHeaders,'clientData')});

          // Instrumentation calls
          context.instrumentationCalls(client);

          //update global data
          window.__dhpwa__.commonParams.client_id = clientid;
          window.__dhpwa__.clientData.clientid = clientid;
          window.__dhpwa__.clientData.signature = signature;

          //store the updated data in cookie/localstorage/indexeddb
          context.storeData({
            clientId: clientid,
            fingerprint: uniqueFp,
            signature: signature
          });

          callback(null,{
            clientId: clientid,
            client: client
          })
        })

      })
    })
  },

  addGlobalParams(client, store){
    let os = _.at(client,'deviceInfo.os') || _.at(client,'deviceInfo.browserInfo.os');
    let osFamily = os && (os.family || os.name);
    let browser = _.at(client,'deviceInfo.browserInfo.browser')
    let device = _.at(client,'deviceInfo.browserInfo.device')
    var commonParams = {
      user_app_ver: appVersion,
      user_connection: navigator.connection.effectiveType || navigator.connection.type,
      user_language_primary: store.selectedLang,
      user_os_platform: osFamily ? ('pwa_' + osFamily.toLowerCase()) : 'pwa_unknown',
      user_os_version: os ? os.version : undefined,
      user_browser: browser ? (browser.name + ' ' + browser.major) : undefined,
      user_browser_ver: browser ? browser.version : undefined,
      user_agent: _.at(client,'deviceInfo.browserInfo.ua'),
      user_type: 'pwa',
      user_handset_maker: _.at(device,'vendor'),
      user_handset_model:_.at(device,'model'),
      user_device_screen_resolution: _.screenResRoundOff(_.at(client,'deviceInfo.resolution')),
      user_device_memory: undefined,
      user_os_name: osFamily && osFamily.toLowerCase(),
      client_id: client.clientid,
      event_section: 'pwa_news',
      utm_raw: undefined,
      utm_source:undefined,
      utm_medium:undefined,
      utm_term:undefined,
      utm_content:undefined,
      event_name:undefined,
    };
    window.__dhpwa__ = _.deepExtend({},
      window.__dhpwa__ || {},
      {commonParams : commonParams},
      {clientData:_.pick(client,'fingerprint','signature','clientid')}
    )
  },

  instrumentationCalls(client){
    // TODO : add gcm_id
    pushGeneric({
      event_section:'pwa_app',
      client_id: client.clientid,
      device_id: client.fingerprint,
      gcm_id: 'to_be_added'
    },'DEVICE_GOOGLE_IDS')
  },

  storeData(data){
    dbFns.clear().then((data1)=>{
      _.each(data,(val,key)=>{
        //Remove
        cookie.remove(key);
        window.localStorage.removeItem(key);

        //add
        cookie.set(key, val, time);
        window.localStorage.setItem(key, val);
        dbFns.set(key,val)
      });
    }).catch((err)=>{
      console.error("Error clearing db:",err)
    })
  },

  // Should be used while the app is running and NOT at the start of the app
  fetchDataFromStorage(callback){
    let clientid = cookie.get('clientid'),
      fingerprint = cookie.get('fingerprint'),
      signature = cookie.get('signature');
    if(!clientid || !fingerprint || !signature){
      !clientid && (clientid = window.localStorage.getItem('clientid'))
      !fingerprint && (fingerprint = window.localStorage.getItem('fingerprint'))
      !signature && (signature = window.localStorage.getItem('signature'))
    }
    if(clientid && fingerprint && signature)
      return callback(null,{clientid, fingerprint, signature});

    return dbFns.getAll().then((data) => {
        return callback(null,idbArrToJson(data));
    }).catch((err)=>{
      return callback(err,null)
    })
  },

  getClientidBody(store, client){
    let body = {
      "clientInfo": {
        "appId":"in.dailyhunt.pwa",
        "appLanguage": store.selectedLang,
        "appVersion": store.appVersion,
        "device": "pwa",
        "edition": "india",
        "height": _.at(client,'deviceInfo.deviceSize.height'),
        "primaryLanguage": store.selectedLang,
        "width": _.at(client,'deviceInfo.deviceSize.width'),
        "udid": client.fingerprint
      },
      "photogallerySupported":true,
      "bcdnImageSupported":true,
      "chronoInboxSupported": true,
      "inboxFeedSupported": true
    };
    return body;
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

  getLocation(callback) {
    callback("Disabled for now",null);
    // Below code for enabling the location permission pop up
    /*if (navigator.geolocation) {
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
      console.error("Geolocation is not supported by this browser", null);
    }*/
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


