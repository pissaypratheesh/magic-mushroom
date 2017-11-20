/**
 * Created by sharadkumar on 21/8/17.
 */
var _ = require('underscore');
_.mixin(require('./mixins'));
function imageFormatter(url, dimension){
    let resolutions=[],multiplier,customMultiplier=1.5;
     multiplier = window.devicePixelRatio;
    let deviceWidth = screen.width * multiplier;

     if(deviceWidth<361){
       customMultiplier = 1;
     }else if(deviceWidth>=361 && deviceWidth <541){
       customMultiplier = 1.5;
     }else if(deviceWidth>=541 && deviceWidth<1080){
       customMultiplier = 2;
     }else if(deviceWidth>=1080){
       customMultiplier = 3;
     }

     if(url==undefined && dimension==undefined){
       return 360 * customMultiplier+'x100_60';
     }

      let webp = url && url.replace("_DHQ_",'60').replace("#DH_EMB_IMG_REP#", (Math.round(dimension.width * customMultiplier) + 'x' + Math.round(dimension.height * customMultiplier)));
      let jpg = webp && webp.replace('.webp', '.jpg');
      return {webp,jpg};
}

module.exports = imageFormatter;
