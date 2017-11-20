import {callRetries, CtoSTimeout, StoSTimeout, isProduction} from '../config/constants'
import axios from 'axios';
import axiosRetry from 'axios-retry';
axiosRetry(axios, { retries: callRetries });

var _ = require('underscore');
var async = require("async");
var promiseToCallback = require('promise-to-callback')
_.mixin(require('./mixins'));

function makeRequest(reqObj,callback) {

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

  let promiseArray = reqObj.urlList && reqObj.urlList.map((params) => {
      let defaultHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
      let timeout = (params && params.timeout) || reqObj.timeout;
      if(_.at(params,'url') && (params.url.indexOf("api-news.dailyhunt.in") !== -1)){
        params.url = params.url.replace("https://api-news.dailyhunt.in","http://dh-ws.news.dailyhunt.in")
        params.url = params.url.replace("http://api-news.dailyhunt.in","http://dh-ws.news.dailyhunt.in")
      }

      !timeout && (timeout = (reqObj.source === "client") ? CtoSTimeout : StoSTimeout);

      let defaultOptions = {
        headers: _.extend({}, defaultHeaders, params.headers || {}),
        timeout: timeout
      },method = _.at(params,'method') && params.method.toLowerCase();
      if(params.url && method === "get"){
        if(reqObj.source === "client"){
          (params.url.indexOf("mode=pwa") === -1) && ((params.url.indexOf("?") !== -1) ? (params.url += "&mode=pwa") : (params.url += "?mode=pwa"));
          _.at(reqObj,'store.clientId') && (params.url = params.url + ("&clientid=" + _.at(reqObj,'store.clientId')));
        }
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
  }
  async.retry(3,makeCall,callback)
}


export {
  makeRequest
};
