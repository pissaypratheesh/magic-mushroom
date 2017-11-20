import { comscoreIds } from "../config/constants";
var _ = require('underscore');
_.mixin(require('./mixins'));
var appendQuery = require('append-query');
module.exports = comscore;

function comscore(obj){
  let su = _.at(obj,'publisherStoryUrl') && encodeURIComponent(appendQuery(obj.publisherStoryUrl,{sr:'dailyhunt_test'}));
  let sKey = _.at(obj,'sourceKey') &&  obj.sourceKey;
  let u = encodeURIComponent(window.location.href || document.URL);
  let comId = sKey && comscoreIds[sKey]
  let comContainer = document.getElementById("comsContainer");
  let s = document.createElement("script"),
    el = document.getElementsByTagName("script")[0],
    s1 = document.createElement("noscript");
  if(comId && comContainer){
    comContainer.innerHTML = '<img src="https://sb.scorecardresearch.com/p?c1=2&c2='+comId+'&c4='+su+'&c9=pwa.dailyhunt.in" />';
    setTimeout(function() {
      comContainer.innerHTML = '<img src="https://sb.scorecardresearch.com/p?c1=2&c2=21733245&c4='+u+'&c9=pwa.dailyhunt.in" />';
    }, 5000);
    return;
  }else{
    comContainer.innerHTML = '<img src="https://sb.scorecardresearch.com/p?c1=2&c2=21733245&c4='+u+'&c9=pwa.dailyhunt.in" />';
  }

}
