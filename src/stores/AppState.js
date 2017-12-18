// Has dummy data, to be worked on..
import { toJS, observable, action } from "mobx";
import {appVersion} from '../config/constants'
import routeUrlMap from '../config/routeAPIMap'
import {makeRequest} from '../lib/makeRequest'
import personalization from '../lib/personalization';
import UIEffects from '../lib/UIEffects';
import { isPassiveSupported } from '../lib/IsPassiveSupported'
import {fireAndDelete, pushStory, pushStoryDuration, pushGeneric} from '../lib/instrumentation'

var _ = require('underscore');
var cookies = require('js-cookie');

_.mixin(require('../lib/mixins'));

export default class AppState {

  //
  @observable states;
  @observable cities;
  @observable localities;
  @observable categories;
  @observable selectedState;
  @observable selectedCity;
  @observable selectedLocality;
  @observable selectedSuggestion;

  @observable items;
  @observable item;

  constructor() {
    this.states = {
      'orissa':{id:'1'},
      'karnataka':{id:'2'},
    };
    this.selectedState = {name:'orissa',id:1};
    this.cities = [];
    this.localities = [];


    this.items = [];
    this.item = {};
    this.scrollPosition = 0;
    this.isOnline = true;
    this.isPassiveSupported = isPassiveSupported();

    this.executeOnlyOnce = _.once(this.executeOnce)
    this.executeOnlyOnce();
  }

  executeOnce(){
    fireAndDelete();
    let context = this;
    personalization.getLocation(function (err, data) {
      context.location =  data;
      personalization.getFingerprint(context, function(err,data){
        if(!err && data) {
          context.updateData({clientId:data.clientId,fingerprint:_.at(data,'client.fingerprint')});
        }
      });
    })
  }

  updateLandingPageReferrer(data){
    window.__dhpwa__= window.__dhpwa__ || {}
    window.__dhpwa__.landingPageReference = {
      previousId : _.at(window,'__dhpwa__.landingPageReference.presentId'),
      presentId : data.entityId
    }
  }

  //For a given pattern or url, fetch all the required data and update the state
  @action fetchData(url, pattern, params) {
    var context = this;
    let ignoreInit = _.at(params,'query.ignoreInit') &&  _.bool( _.at(params,'query.ignoreInit')) && !!_.at(this,'topicsList.0.data.data')
    _.extend(params,context);

    // Fetch in an array all the calls that need to be fired with its params and method
    routeUrlMap(params, pattern, function(dataToFetch){
      if(!dataToFetch || _.isEmpty(dataToFetch.urlList) || ignoreInit){
        return context[dataToFetch.updateFunction](null, url, params)
      }
      dataToFetch.source = "client";
      dataToFetch.store = context;
      makeRequest(dataToFetch,(error, results)=>{
        if(error){
          UIEffects.showServerError(error);
        }
        let headers = [];
        let resp = results && results.map((r) => {
          //!window.__dhpwa__.enableClientLogs && (r.headers.enablelogs === "true") && (window.__dhpwa__.enableClientLogs = true);
          headers.push(r.headers);
          return (r && r.data);
        });
        context[dataToFetch.updateFunction](resp || null, url, params,{dataToFetch,headers});
      })
    });
  }

  @action updateHome(resp, url, params){
    let context = this;
    if(_.at(resp,'0.data')){
      this.cities = _.map(resp[0]['data'],(val)=>{
        return _.deepExtend({
          label: val.cityName,
          value: val.cityId
        },val);
      })
    }
    if(_.at(resp,'1.data')){
      this.categories = resp[1]['data'];
    }
    if(_.at(resp,'2.data')){
      this.categorySuggest = _.map(resp[2]['data'],(val)=>{
        return _.deepExtend({
          label: val.displayName,
          value: val.entitySubCategoryId
        },val);
      })
    }
  }

  @action updateSearchList(resp, url, params){
      console.log(" repspspsppsps-->",resp[0])
  }

  @action updateData(objArr){
    let context = this;
    _.isObject(objArr) && _.each(objArr,(val,key)=>{
      context[key] = val;
      console.log(" key val-->",val,key)
    });
  }

  @action clearData(name){
    let context = this;
    _.isArray(name) ? (_.map(name,(eachName)=>{context[eachName] = undefined})) : (this[name] = undefined);
  }

  @action clearItems() {
    this.items = [];
    this.item = {};
  }
  @action changeOnlineStatus(bool){
    this.isOnline = bool;
  }

  @action changeConnectionStatus(connection){
    this.connection = connection;
  }

  //page:details/list, data:id/pagenumber, event:start/stop
  @action timespentCalculator(page, data, event, from){
    let context = this;
    switch(page){
      case "details":
        if(event === "start") {
          let det = _.at(context, 'timespent.details');
          if ((!det || !det.id) || (_.at(det,'id') && (det.id !== data.id))) {
            pushStory(data);
            context.timespent.details = _.deepExtend({start: Date.now()},data)
          }
        }
        if(event === "stop"){
          //Calculate timespent and make instrumentation call
          let det = _.at(context,'timespent.details');
          if(_.at(det,'id') && (det.id === data.id)){
            context.timespent.details = {};
            pushStoryDuration(_.deepExtend({duration:Date.now() - det.start},det))
          }
        }
        break;
    }
  }

}
