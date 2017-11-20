// Has dummy data, to be worked on..
import { toJS, observable, action } from "mobx";
import {withRouter} from "react-router-dom";
import {CtoSTimeout, callRetries, appVersion} from '../config/constants'
import routeUrlMap from '../config/routeAPIMap'
import axios from 'axios';
import axiosRetry from 'axios-retry';
axiosRetry(axios, { retries: callRetries });
import {makeRequest} from '../lib/makeRequest'
import personalization from '../lib/personalization';
import UIEffects from '../lib/UIEffects';
var _ = require('underscore');
var deviceInfo  = require('../lib/deviceDetect');
var cookies = require('js-cookie');

_.mixin(require('../lib/mixins'));

export default class AppState {



  //Dummy
  @observable authenticated;
  @observable authenticating;
  @observable items;
  @observable item;

  constructor() {

    this.executeOnlyOnce = _.once(this.executeOnce)
    this.executeOnlyOnce();
  }

  executeOnce(){
    console.log(" in execute onceeeeee")
  }

  //For a given pattern or url, fetch all the required data and update the state
  @action fetchData(url, pattern, params) {
    var context = this;
    let ignoreInit = _.at(params,'query.ignoreInit') &&  _.bool( _.at(params,'query.ignoreInit')) && !!_.at(this,'topicsList.0.data.data')
    _.extend(params,context);
    // Fetch in an array all the calls that need to be fired with its params and method
    let dataToFetch = _.at(params,'dataToFetch') || routeUrlMap(params)[pattern];

    if(!dataToFetch || _.isEmpty(dataToFetch.urlList) || ignoreInit){
      return context[dataToFetch.updateFunction](null, url, params)
    }
    dataToFetch.source = "client";
    dataToFetch.store = context;
    makeRequest(dataToFetch,(error, results)=>{
      if(error){
        UIEffects.showServerError(error);
      }
      let resp = results && results.map(r => (r && r.data));
      context[dataToFetch.updateFunction](resp || null, url, params);
    })
  }

    @action clearData(name){
    let context = this;
    _.isArray(name) ? (_.map(name,(eachName)=>{context[eachName] = undefined})) : (this[name] = undefined);
  }

  @action updateData(objArr){
    let context = this;
    _.isObject(objArr) && _.each(objArr,(val,key)=>{context[key] = val});
  }

  @action changeOnlineStatus(bool){
    this.isOnline = bool;
  }

  @action changeConnectionStatus(connection){
    console.log(" coonecction on change appstate-->",connection);
    this.connection = connection;
  }
  //page:details/list, data:id/pagenumber, event:start/stop
  @action timespentCalculator(page, data, event, from){
    console.log(" in timespentcalculater--->",page,data,event,from,this.timespent.details)
    let context = this;
    switch(page){
      case "details":
        if(event === "start") {
          let det = _.at(context, 'timespent.details');
          if ((!det || !det.id) || (_.at(det,'id') && (det.id !== data.id))) {
            console.log(" updating start")
            context.timespent.details = {
              id: data.id,
              start: Date.now()
            }
          }
        }
        if(event === "stop"){
          //Calculate timespent and make instrumentation call
          let det = _.at(context,'timespent.details'),
              instrumentData;
          if(_.at(det,'id') && (det.id === data.id)){

            console.log("from   diff of time-->",Date.now() - det.start,' for id:',det.id,from);
            context.timespent.details = {};
            instrumentData = {
              duration:Date.now() - det.start,
              id: det.id
            }
            //personalization.sendInstrumentData(instrumentData);
          }
        }
        break;

    }
  }

}
