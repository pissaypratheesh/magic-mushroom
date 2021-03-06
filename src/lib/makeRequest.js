import {callRetries, CtoSTimeout, StoSTimeout, isProduction} from '../config/constants'
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: callRetries });

var _ = require('underscore');
var async = require("async");
var promiseToCallback = require('promise-to-callback')
_.mixin(require('./mixins'));
var retry = 3;
var defaultHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};


function makeRequest(reqObj,callback) {
  if(!reqObj.source || !reqObj.urlList){
    if(reqObj.source === 'server' && !reqObj.clientReq){
      return callback({Error: "Missing client request"}, null);
    }
    return callback({Error:"Missing source or urlList"},null)
  }
  //Override the retry if specified
  reqObj.retry && (retry = reqObj.retry)
  let defaultOptions;
  let promiseArray = reqObj.urlList && reqObj.urlList.map((params) => {
      defaultOptions = (reqObj.source === "server") ? manageServerCalls(params, reqObj) : manageClientCalls(params,reqObj);
      let method = _.at(params,'method') && params.method.toLowerCase();
      params.withCredentials =  true;
      if(params.url && method === "get"){
        return axios[params.method](params.url, {...defaultOptions})
      }
      if(params.url && (method === "post" || method === "put")){
        return axios[params.method](params.url, _.at(params,'body') || _.at(params,'data'),{...defaultOptions})
      }
    });

  let makeCall = function (cb) {
    promiseToCallback(axios.all(promiseArray))((err,res)=>{
      err && (reqObj.source !== "client" || !isProduction) && logError(err,reqObj);
      cb(err,res)
    });
  };
  async.retry(retry,makeCall,callback)


  // Functions definitions

  function logError(err,reqObj){
    console.error('~~FAILED REQUEST ERROR:',JSON.stringify({
      reqObj:_.map(reqObj,(value,key)=>{
        if(key === "urlList") {
          return _.map(value, (val, k)=>{
            return {
              url: val.url,
              timeout: val.timeout,
              headers: val.headers
            }
          })
        }
      }),
      error:err&&err.toString(),
      errorCode:err&&err.code,
      time:new Date()
    }));
  }

  function manageServerCalls(params, reqObj){
    let timeout = (params && params.timeout) || reqObj.timeout;
    !timeout && (timeout = StoSTimeout);
    if(_.at(params,'url') && (params.url.indexOf("api-news.dailyhunt.in") !== -1)){
      params.url = params.url.replace("https://api-news.dailyhunt.in","http://dh-ws.news.dailyhunt.in")
      params.url = params.url.replace("http://api-news.dailyhunt.in","http://dh-ws.news.dailyhunt.in")
    }
    return {
      headers: params.ignoreDefaultHeds ? params.headers : _.extend(
        {ssl_connection: 'HTTPS', 'Cookie':_.at(reqObj,'clientReq.headers.surpasscookie') || 'nhClientInfoV1=%7B%22device%22%3A%22pwa%22%2C%22featureMask%22%3A8200%7D'} ,
        defaultHeaders,
        params.headers || {}
        ),
      timeout: timeout
    };
  }

  function manageClientCalls(params, reqObj) {
    let timeout = (params && params.timeout) || reqObj.timeout;
    !timeout && (timeout = CtoSTimeout);
    (params.url.indexOf("mode=pwa") === -1) && ((params.url.indexOf("?") !== -1) ? (params.url += "&mode=pwa") : (params.url += "?mode=pwa"));
    _.at(reqObj, 'store.clientId') && (params.url = params.url + ("&clientid=" + _.at(reqObj, 'store.clientId')));
    return {
      headers: params.ignoreDefaultHeds ? params.headers : _.extend({
          surpasscookie: _.at(window,'__dhpwa__.clientData.signature') || 'nhClientInfoV1=%7B%22device%22%3A%22pwa%22%2C%22featureMask%22%3A8200%7D'
      },
      defaultHeaders, params.headers || {}),
      timeout: timeout
    };
  }
}


export {
  makeRequest
};
