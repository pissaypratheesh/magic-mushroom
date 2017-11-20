/**
 * Created by sharadkumar on 26/9/17.
 */
var deviceDetect = require('./deviceDetect');
var _ = require('underscore');
_.mixin(require('./mixins'));
var ReactGA = require('react-ga');
ReactGA.initialize('UA-64780041-3');
var queryString = require('query-string');
var appendQuery = require('append-query')


function queryClean(url){
  var urlParam = url && url.split("?");
  var getParam = urlParam && queryString.parse(urlParam[1]);
  var itmToRemove = ['index','listname','mode','topicIndex','selId','selIndex','topic','topicTitle']
  var newParam = _.omit(getParam, function(value, key, object) {
    let notPresent = itmToRemove.includes(key);
    if(notPresent){
      return value
    }
  });
  var newUrl = urlParam && appendQuery(urlParam[0], newParam);
  return newUrl;
}

module.exports = {
  gaParmams:function(obj){
    let matchType = _.at(obj,'type');
    let lang = _.at(obj,'language');
    let dimension= {dimension1:lang ||'',dimension2:'',dimension3:'',dimension4:deviceDetect.resolution,dimension5:'PWA'}

    if(matchType && matchType.includes('-epaper-')){
      var npDetail = matchType.split('-epaper-');
      dimension.dimension2 = npDetail && npDetail[0].replace("+", " ");
      return dimension;
    }

    if(matchType && matchType.includes('-topics-')){
      var topicDetail = matchType.split('-topics-');
      dimension.dimension3 = topicDetail && topicDetail[0].replace("+", " ");
      return dimension;
    }

    dimension.dimension3 = matchType && matchType.replace("+", " ")||'';
    return dimension;
  },
  logPageView:function(param,nextPageUrl=false){
    var getUrl = window.location.pathname.replace(/^\//, "");
    var url = nextPageUrl ? getUrl+'/page-'+nextPageUrl : getUrl
    ReactGA.set(param);
    let cleanUrl = queryClean(url)
    let sessParam = JSON.parse(sessionStorage.getItem('gaParam'));
    if(sessParam){
      cleanUrl = appendQuery(cleanUrl,sessParam);
      sessionStorage.removeItem('gaParam');
    }
    ReactGA.pageview(cleanUrl);
  },
  logEvent:function(param,type){
    ReactGA.set(param);
    ReactGA.event({category:'share',action:'click',label:type.label});
  }
}
