/**
 * Created by sharadkumar on 20/7/17.
 */
var platform = require('platform');
var deviceInfo = platform.parse(navigator.userAgent);
var ClientJS = require('clientjs/dist/client.min');
var client = new ClientJS();

function linksGetApp(os){
  switch (os) {
    case 'Android':
      return "http://acdn.newshunt.com/nhbinaries/binFilesPath/promotion/Install_Dailyhunt_21.apk";
      break;
    case 'iOS':
      return  "https://itunes.apple.com/us/app/apple-store/id338525188?pt=296722&ct=Smartbanner&mt=8";
    case 'Windows Phone':
      return "https://www.microsoft.com/en-in/store/p/dailyhunt-formerly-newshunt/9wzdncrfj1l1?cid=Smartbanner&ocid=badge&rtc=1";
    default:
      return "market://details?id=com.eterno&referrer=utm_source%3DPWAmenu%26utm_content%3DMenu%26utm_campaign%3DPWA";
  }
}

function linksSmartBanner(os){
  switch (os) {
    case 'Android':
      return "http://acdn.newshunt.com/nhbinaries/binFilesPath/promotion/Install_Dailyhunt_20.apk";
      break;
    case 'iOS':
      return  "https://itunes.apple.com/us/app/apple-store/id338525188?pt=296722&ct=Smartbanner&mt=8";
    case 'Windows Phone':
      return "https://www.microsoft.com/en-in/store/p/dailyhunt-formerly-newshunt/9wzdncrfj1l1?cid=Smartbanner&ocid=badge&rtc=1";
    default:
      return "market://details?id=com.eterno&referrer=utm_source%3DPWAmenu%26utm_content%3DMenu%26utm_campaign%3DPWA";
  }
}
module.exports = {
  manufacturer:deviceInfo.manufacturer,
  browserName:deviceInfo.browserName,
  name:deviceInfo.name,
  os:deviceInfo.os,
  browserInfo: client.getBrowserData(),
  utmSrc:function(){
    let str = {'iOS':'pi','Android':'pa','Windows Phone':'pw'}
    return str[deviceInfo.os.family]?str[deviceInfo.os.family]:'pu';
  },
  product:deviceInfo.product,
  linksSmartBanner:linksSmartBanner(deviceInfo.os.family),
  linksGetApp:linksGetApp(deviceInfo.os.family),
  deviceSize:{height:screen.height,width:screen.width,queryStr:`h=${screen.height}&w=${screen.width}`},
  resolution:(Math.round(screen.width*window.devicePixelRatio)+'x'+Math.round(screen.height*window.devicePixelRatio)),
  fontCall:function(lang){
    if(lang=='hi'||lang=='en'){return;}
    return "<"+"style>@font-face {font-family:'dyLang'; src: url('"+window.location.origin+"/assets/fonts/"+lang+"/notoRegular.ttf?mode=pwa') format('truetype');font-weight:normal;font-style:normal;}<style>"
  }
};

  //console.log('{{ USERAGENT }}' ,'name-->'+deviceInfo.name,'>>version--->'+deviceInfo.version,'>>layout--->'+deviceInfo.layout,'>>os--->'+deviceInfo.os,'>>description--->'+deviceInfo.description,'>>product--->'+deviceInfo.product );
