import { idbArrToJson, indexedDb } from './indexedDb';
import { makeRequest } from './makeRequest'
import { toJS } from "mobx";

const queryString = require('query-string');

const CHUNCK_LENGTH_TO_DB = 7; //
const WRITE_TO_DB_INTERVAL = 2000; //in ms
const READ_FROM_DB_INTERVAL = 10000;//in ms
const PROCESS_CARDS_INTERVAL = 5000;// in ms
const CARDS_IN_A_REQUEST = 7;

var urlMap = require('../config/urls.js');
var _ = require('underscore');
var shortid = require('shortid');
var dbFns = indexedDb('instrumentation','collection');

_.mixin(require('./mixins'));

global.instruObj = [];

//This is instantiate the setInterval functions
processData();

function push(json, priority) {
  //priority, appends to the start of the array, instead of pushing at the end
  let type = priority ? "unshift" : "push";
  let enableLogs = _.at(window,'__dhpwa__.enableClientLogs');

  switch (json.event_name){
    case 'STORY_CARD_VIEW':
      enableLogs && console.log(" json to instrument-->",json.event_name,_.map(json.specific_properties,(val)=>{
        return val['item_id']
      }).join());

      break;

    case 'STORY_PAGE_VIEW':
      enableLogs && console.log(" json to instrument-->",json.event_name,JSON.stringify(json));
      break;

    case 'STORY_LIST_VIEW':
      enableLogs && console.log(" json to instrument-->",json.event_name,JSON.stringify(json));
      break;

    case 'TIMESPENT_PVACTIVITY':
      enableLogs && console.log(" json to instrument-->",json.event_name,JSON.stringify(json));
      break;

    case 'WIDGET_PFP_VIEW':
      enableLogs && console.log(" json to instrument-->",json.event_name,JSON.stringify(json));
      break;

    default:
      enableLogs && console.log(" json to instrument-->",json.event_name,JSON.stringify(json));
      break;
  }

  (global.instruObj &&_.isArray(global.instruObj)) ? global.instruObj[type](btoa(JSON.stringify(json))) : (global.instruObj = [btoa(JSON.stringify(json))])
}

//This is instantiate the setInterval functions
function processData() {
  pushToDb();
  popFromDb();
  processCards();
}

// Formats and appends the common params required
function format(data, event) {
  let commonParams = _.at(window,'__dhpwa__.commonParams') && _.clone(window.__dhpwa__.commonParams),
      referrerDetails = _.at(window,'__dhpwa__.history.referrerObj'),
      urlParamsStr = window.location.search.split('?')[1],
      urlParams = urlParamsStr ? queryString.parse(urlParamsStr) : {},
      completeData =  _.pick(urlParams,'utm_raw', 'utm_source', 'utm_medium', 'utm_term', 'utm_content');

    _.at(commonParams,'client_id') && (delete commonParams.client_id); //deleting redundant
  completeData.event_section = 'pwa_news';
  if(!data.referrer && event !== 'STORY_CARD_VIEW'){
    data.referrer =  data.related ? "widget_pfp" : _.at(referrerDetails, 'referrer');
    data.referrer_id = data.related ? "relatedNews" :
      (data.activeTopic === "topicsList" ? _.at(window,'__dhpwa__.landingPageReference.previousId') : _.at(referrerDetails, 'referrer_id'));
  }

  switch (event){
    case 'STORY_CARD_VIEW':
      _.each(data,(eachData,index)=>{
        data[index]['referrer'] =  eachData.related ? "widget_pfp" : _.at(referrerDetails, 'referrer');
        data[index]['referrer_id'] = eachData.related ? "relatedNews" :
            (eachData.activeTopic === "topicsList" ? _.at(window,'__dhpwa__.landingPageReference.previousId') : _.at(referrerDetails, 'referrer_id'));
        data[index]['referrer_action'] = urlParams.action;
        delete eachData.activeTopic;
      })
      completeData.pv_event = 'false';
      break;

    case 'STORY_PAGE_VIEW':
      completeData.pv_event = 'true';
      data['referrer_action'] = urlParams.action;
      break;

    case 'STORY_LIST_VIEW':
      completeData.pv_event = 'true';
      data['referrer_action'] = urlParams.action;
      break;

    case 'TIMESPENT_PVACTIVITY':
      completeData.pv_event = 'false';
      data['referrer_action'] = urlParams.action;
      break;

    case 'WIDGET_PFP_VIEW':
      completeData.pv_event = 'false';
      break;

    case 'DEVICE_GOOGLE_IDS':
      completeData.pv_event = 'false';
      break;

    default:
      completeData.pv_event = 'false';
      break;
  }
  _.extend(completeData,{
    'event_name': event.toLowerCase(),
    'client_id': _.at(commonParams,'client_id'),
    'epoch_time': Math.round((new Date()).getTime() / 1000),
    'properties': _.removeFalsyValues(commonParams),
    'specific_properties': _.removeFalsyValues(data)
  });
  return completeData;
}

// Every PROCESS_CARDS_INTERVAL seconds, check the window object
// to processing the unprocessed card view data
function processCards(){
  setInterval(function () {
    let cardColl = _.at(window,'__dhpwa__.cardCollection');
    if(cardColl && !_.isEmpty(cardColl)){
      push(format(_.uniq(cardColl,'item_id'),'STORY_CARD_VIEW'));
      window.__dhpwa__.cardCollection = [];
    }
  },PROCESS_CARDS_INTERVAL)
}

// Common params for all the cards
function commonCarddata(data) {
  let commonData =  {
    item_id: data.id,
    item_type: data.type,
    ui_type: data.uiType,
    card_type: data.contentType,
    group_type: 'NEWS',
    group_id: 'news',
    landing_type: data.landingType,
    card_position: (+data.index) + 1,
    home_tabtype: data.whichTopic,
    home_tabitem_id: data.whichTopicIndex,
    content_type: data.contentType,
    activeTopic: data.activeTopic
  };
  _.at(data, 'experiment') && (_.extend(commonData,toJS(data.experiment)))
  return commonData;
}

// Call this to add card to instrumenation queue
function pushCard(data) {
  _.at(window,'__dhpwa__.enableClientLogs') && console.log("push card: ",data.id);
  let filteredData = commonCarddata(data)
  let cardColl = _.at(window,'__dhpwa__.cardCollection');
  if(!cardColl){
    window.__dhpwa__ = _.extend({},window.__dhpwa__ || {}, {cardCollection:[]});
  }
  if(cardColl && (cardColl.length >= CARDS_IN_A_REQUEST)){
    cardColl.push(filteredData);
    push(format(_.uniq(cardColl,'item_id'),'STORY_CARD_VIEW'));
    window.__dhpwa__.cardCollection = [];
    return;
  }
  window.__dhpwa__.cardCollection.push(filteredData);
}

// Call this to add card to instrumenation queue
function pushGeneric(data, event) {
  let formattedData = format(data,event);
  _.at(window,'__dhpwa__.enableClientLogs') && console.log("push generic: ",data);
  push(formattedData);
}

// Call this to add story card to instrumenation queue
function pushStory(data) {
  _.at(window,'__dhpwa__.enableClientLogs') && console.log("push story: ",data.id);
  if(data){
    let relatedFlowObj = _.at(window,'__dhpwa__.referrerFlow');
    // Passing true in push to keep this call on priority
    push(format(_.deepExtend({
      wordcount: data.wordCount,
      imagecount: data.imageCount,
      referrer_flow: data.related ? 'widget_pfp' : _.at(relatedFlowObj,'referrer_flow'),
      referrer_flow_id: data.related ? 'relatedNews' : _.at(relatedFlowObj,'referrer_flow_id'),
    },commonCarddata(data)),'STORY_PAGE_VIEW'),true);
  }
}

// Call this to add story card view duration to instrumenation queue
function pushStoryDuration(data) {
  _.at(window,'__dhpwa__.enableClientLogs') && console.log("push StoryDuration: ",data.id);
  push(format(_.deepExtend({
    timespent: data.duration,
    pv_activity: 'story_detail',
    wordcount: data.wordCount,
    imagecount: data.imageCount,
    referrer_flow: _.at(window,'__dhpwa__.referrer.flow') || '',
    referrer_flow_id: _.at(window,'__dhpwa__.referrer.flow_id') || '',
  },commonCarddata(data)),'TIMESPENT_PVACTIVITY'),true)
}

// Every WRITE_TO_DB_INTERVAL, write to db from instruObj queue
function pushToDb() {
  setInterval(function () {
    while(global.instruObj.length){
      // Until the global instruObj is empty, add data to the indexedDb
      let chunks = global.instruObj.splice(0,CHUNCK_LENGTH_TO_DB);
      dbFns.set(shortid.generate(),chunks).then(()=>{
        //console.log("Successfully wrote to db",chunks)
      }).catch((err)=>{
        console.error(" Error writing to db:",err)
      });
    }
  },WRITE_TO_DB_INTERVAL)
}

// Fire the call for given data and delete from indexedDb
function fireAndDelete(key, value) {
  var values = [],
      headers = {
        'Content-Type': 'application/vnd.kafka.binary.v1+json',
        'Content-Encoding': 'gzip',
      };
  value && _.each(value,(val)=>{
    values.push({'value':val});
  });
  let url = urlMap.instrument;
  !_.isEmpty(values) && _.gzipJson({records: values},(err, buffer)=>{
    var urlObj = {urlList:[{url: url, timeout:7000, headers: headers, method:'post', body:buffer, ignoreDefaultHeds: true}]};
    makeRequest(urlObj,(err, resp)=>{
      //console.log(" instument call -->",err,resp,JSON.stringify({records: values}))
      if(1){//!err){
        key && dbFns.delete(key).then((data)=>{
          //console.log(" delete data of key:",key)
        }).catch((err)=>{
         // console.log(" error in deleting data from db:",err)
        })
      }
    });
  })
}

// Every READ_FROM_DB_INTERVAL, pick all the values from Db and send to service
// if successfully sent, delete from Db
function popFromDb() {
  setInterval(function () {
    dbFns.getAll().then((data) => {
      let jsonData = idbArrToJson(data);
      jsonData && _.each(jsonData,(val,key)=>{
        fireAndDelete(key, val)
      })
    })
  },READ_FROM_DB_INTERVAL)
}

export { push, processData, fireAndDelete, pushCard, pushStory, pushStoryDuration, pushGeneric };
