/**
 * Created by pratheesh on 20/5/17.
 */
import React from 'react';
import langMapping from '../../config/langMapping';
import {pageSize, StoSTimeout, callRetries} from '../../config/constants';
const queryString = require('query-string')
var async = require("async");
var _ = require('underscore');
var moment = require('moment');
var urlMap = require('../../config/urls.js');
var defHeader =  require('../../lib/httpHeader');
var appendQuery = require('append-query')
import {makeRequest} from "../../lib/makeRequest"
import axios from 'axios';
import axiosRetry from 'axios-retry';
const timeout = { timeout: StoSTimeout};
let header = {
  headers:defHeader.header
};

axiosRetry(axios, { retries: callRetries });
_.mixin(require('../../lib/mixins'));


let helpers= {
  getRequiredRowData(data, query){
    var nextIndex = Number(query.nextIndex) || 0;
    var topicType = query.topicType || query.activeTopic,
      topicIndex = _.isUndefined(query.topicIndex) ? query.activeNavIndex : query.topicIndex,
      detailsPageQuery = topicType ? ("?listname="+topicType + (query.topicName ? "&topic="+query.topicName : "")) : "";
    return _.map(data, function (row, index) {
      var rowData = _.pick(row,
        'title',
        'sourceNameEn',
        'id',
        'type' ,
        'directLanding',
        'thumbnail',
        'thumbnails',
        'childCount',
        'childFetchUrl',
        'content',
        'tickers',
        'sourceKey',
        "contentImage",
        "sourceFavicon",
        "sourceNameUni",
        "categoryName",
        "moreContentLoadUrl",
        "supplementUrl",
        "shareUrl",
        "defaultPlayUrl",
        "imageUrl",
        "sourceNameUni",
        "langTitles",
        "publisherStoryUrl",
        "webAttributes"
      );
      rowData.index = nextIndex + index;
      rowData.detailsPageUrl =  "/news/" + (query.edition || "india") + "/" + (langMapping[query.langCode] || "english") + "/" + (_.at(rowData,'sourceNameEn') ? rowData.sourceNameEn.toLowerCase().replace(/(?!\w|\s)./g, '').replace(/ /g,"+") : "") + "-epaper-"
        + rowData.sourceKey + "/" + (rowData.langTitles ? (rowData.langTitles.translateTitle.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/ /g,"+").replace(/\++/g,"+")): "") + "-newsid-" + rowData.id + (_.isEmpty(detailsPageQuery) ? ("?index="+rowData.index) : (detailsPageQuery+"&index="+rowData.index)) + (!_.isUndefined(topicIndex) ? ("&topicIndex="+topicIndex) : "");
      rowData.detailsPageUrl = appendQuery(rowData.detailsPageUrl,{ mode: 'pwa' })
      rowData.supplementUrl = _.at(rowData.supplementUrl) && (rowData.supplementUrl.indexOf("langCode=") === -1) ? (rowData.supplementUrl + "?langCode=" + (query.langCode || "en")) : rowData.supplementUrl;

      rowData.url = _.at(row, 'contentImage.url') || '';
      rowData.listName = query.listName || topicType;
      rowData.activeTopic = rowData.listName;
      rowData.activeNavIndex = topicIndex;
      rowData.publishTime = _.at(row,'publishTime') || '' ;
      return rowData;
    })
  },

  getParalleNewsCalls(urlList,query, callback){
    urlList = _.compact(urlList)
    let respObj = _.clone(urlList);
    if(urlList &&  !_.isEmpty(urlList) ){
      let promiseArray = urlList.map((params) => {
        let defaultOptions = {
          headers: defHeader.header,
          timeout:StoSTimeout
        };
        return axios["get"](params.contentUrl || params.url, {...defaultOptions})
      });
      //Fire all at once in parallel
      return axios.all(promiseArray)
        .then(function(results) {
          let resp = results.map(r => (r && r.data));
          if(resp){
            _.each(resp,(eachResp,index)=>{
              var data = _.at(eachResp,'data'),
                combinedData = data.rows || [];
              data.stories && (combinedData = combinedData.concat(data.stories));
              data.videos && (combinedData = combinedData.concat(data.videos))
              if(!_.isEmpty(combinedData)){
                respObj[index]["data"] = {
                  code: 200,
                  data: {
                    count: data.count,
                    nextPageUrl: data.nextPageUrl,
                    rows: helpers.getRequiredRowData(combinedData,_.deepExtend({},query,{topicIndex:respObj[index]["topicIndex"]}))
                  }
                };
              } else{
                respObj[index]["noContent"] = true;
              }
            });
            return callback(respObj);
          }
          return;
        }).catch(function (err) {
          //console.error("Error fetch multiple topics data:",err,err.statusCode,err.stack,err.codeFrame,err.lineNumber)
          return;
        });
      return;
    }
    return;
  }
}

const jsonFormatter =  {
  fetchMultipleNews: function (req, callback) {
    let urlList = [];
    _.each(req.query,(val, key)=>{
      if(key.indexOf("url") !== -1){
        val = decodeURIComponent(val);
        let subQueries = queryString.parse(val.split("?")[1])
        req.query.topicIndex = subQueries.topicIndex;
        req.query.topicName = subQueries.topicName;
        urlList.push({url:val,topicName:subQueries.topicName,topicIndex:subQueries.topicIndex})
      }
    })
    return helpers.getParalleNewsCalls(urlList,req.query,callback)
  },

  injectNFormat(rows, card, injectIndex, metadata, checkInHeadlines){
    if(card && card.id && checkInHeadlines){
      var found = false;
      var detailsIndex;
      rows && _.find(rows,(data,index)=>{
        if(data.id === card.id){
          rows && rows[index] && (rows[index]["directLanding"] = true);
          found = true;
          detailsIndex = index;
          return true;
        } else return false;
      })
      if(found){
        return {
          rows: rows,
          detailsIndex: detailsIndex,
          details: rows[detailsIndex]
        }
      }
    }
    if(rows && (rows.length > injectIndex)){
      card && (card['directLanding'] = true);
      rows.splice(injectIndex,0,card);
      var updatedRows = helpers.getRequiredRowData(rows, metadata);
      return {
        rows: updatedRows,
        detailsIndex: injectIndex,
        details: updatedRows[injectIndex]
      };
    }
  },

  fetchAllTopicsWithData(req, callback){
    let  topicTypeUrl,
      includeList;
    switch (req.query.topicType){
      case "newspaperLanding":
        topicTypeUrl = urlMap["npCategoryTopics"] + req.query.key + "?langCode=" +  (req.query.langCode || "en") + "&edition=" +  (req.query.edition || "india")+ "&appLanguage="+(req.query.langCode || "en");
        req.query.name="shortKey";
        break;
      case "generalizedTopics":
        topicTypeUrl = urlMap["generalizedTopics"] + req.query.key + "?langCode=" +  (req.query.langCode || "en") + "&edition=" +  (req.query.edition || "india")+ "&appLanguage="+(req.query.langCode || "en");
        req.query.name="key"
        break;
      case "topicsList":
      default:
        topicTypeUrl = urlMap["allTopicsCompleteUrl"]  + (req.query.langCode || "en") + "&edition=" +  (req.query.edition || "india") + "&appLanguage="+(req.query.langCode || "en");
        includeList = [ "TOPIC" , "HEADLINES"];
        req.query.topicType = "topicsList";
        req.query.name="nameEnglish";
        break;

    }
    var urlObj = {urlList:[{url:topicTypeUrl,timeout:StoSTimeout, headers:defHeader.header, method:'get'}]};
    return makeRequest(urlObj,(err, resp)=> {
      if (err) {
        return callback(err,null);
      }
      return jsonFormatter.allTopics(resp[0], includeList, req.query,function (respObj, err) {
        if(err || _.isEmpty(respObj)){
          return callback(err,null);
        }
        return callback(null, respObj);
      });
    })
  },

  news: function(resp, query){
    var data = _.at(resp,'data.data'),
      combinedData = data.rows || [];
    data.stories && (combinedData = combinedData.concat(data.stories));
    data.videos && (combinedData = combinedData.concat(data.videos))


    if(combinedData && !_.isEmpty(combinedData)){
      return {
        code: 200,
        data: {
          count: data.count,
          nextPageUrl: data.nextPageUrl,
          rows: helpers.getRequiredRowData(combinedData,query)
        }
      };
    }
    return {};
  },

  allTopics: function (resp, includeList, query, callback) {
    let data = _.at(resp,'data.data.rows') ||  _.at(resp,'data.data.linkedTopics') || [],
      matchFound = false;

    if(query.topicType === "generalizedTopics"){
      let keyData = _.at(resp,'data.data');
      keyData && data.unshift(keyData)
    }
    if(!data) {
      return callback([],"no data");
    }
    var nextTopicUrl,prevTopicUrl,indexOfList=0;

    var finalArr = _.chain(data).sortBy("viewOrder").map((obj,index) => {
      if(!includeList || (_.contains(includeList, obj.pageType))) {
        var retObj =  _.pick(obj,"showPublishDate",'type',"bannerImageUrl","favoriteImageUrl", "childTopicIds","key","contentUrl","languageNameMapping","nameEnglish", "entityKey", "name", "nameEnglish", "pageType", "deepLinkUrl", "nameUni", "viewOrder","categoryNameEn","shortKey","entityKey","imageUrl");
        var isFirstParam = retObj.contentUrl && (retObj.contentUrl.indexOf("?") === -1 ? "?" : "&")
        retObj.contentUrl = retObj.contentUrl && retObj.contentUrl.indexOf("pageSize") !== -1 ? (retObj.contentUrl.replace("&pageSize=10","&pageSize=20")) : (retObj.contentUrl + isFirstParam + "pageSize=" + pageSize);
        retObj.prevTopicUrl = prevTopicUrl;
        retObj.index = indexOfList;
        retObj.topicIndex= indexOfList++;
        retObj.topicType = query.topicType;
        prevTopicUrl = retObj.contentUrl;
        return retObj;
      }
    }).compact().value();
    var finArr =  _.map(finalArr,function (arr, index) {
      arr["nextTopicUrl"] = finalArr[index+1] && finalArr[index+1]["contentUrl"]
      return arr;
    })
    if(query.topicName === "undefined"){
      query.topicName = _.at(finArr,'0') && finArr[0][query.name]
    }
    if(query.topicName === "all-categories"){
      //Append Newspapers for landing headlines page
      finArr.push({
        topicType:"newspaper",
        displayName:"newspaper",
        name:"all-categories",
        nameEnglish: "all-categories",
        contentUrl: "/apis/alltopics?langCode=" + (query.langCode || "en") + "&edition=" + (query.edition || "en")
      })

      return callback(_.extend({finalArr: finArr, type: "allTopics"},query),null);
    }
    if(query.ignoreNews && _.bool(query.ignoreNews)){
      //Append Newspapers for landing headlines page
      if(query.topicType === "topicsList"){
        finArr.push({
          topicType:"newspaper",
          displayName:"newspaper",
          name:"all-categories",
          nameEnglish:"all-categories",
          contentUrl: "/apis/alltopics?langCode=" + (query.langCode || "en") + "&edition=" + (query.edition || "en")
        })
      }
      return callback(_.extend({finalArr: finArr, type: "allTopics"},query),null);
    }

    if(finArr){
      _.each(finArr,(data,index)=>{
        if(data[query.name] && ((data[query.name].toLowerCase() === (query.topicName && query.topicName.toLowerCase()))
          || (data[query.name].toLowerCase() === (query.key && query.key.toLowerCase())))){

          var reqdData = [];
          matchFound = true;
          data.prevTopicUrl && reqdData.push(finArr[index-1]);
          data.contentUrl && reqdData.push(finArr[index]);
          data.nextTopicUrl && reqdData.push(finArr[index+1]);
          return helpers.getParalleNewsCalls(reqdData,query,function (respObj, err) {
            if(err) {
              return callback(null,err)
            }
            _.each(respObj,(respObjData,ind)=>{
              finArr[respObjData.index] = respObjData;
            })
            //Append Newspapers for landing headlines page
            if(query.topicType === "topicsList"){
              finArr.push({
                topicType:"newspaper",
                displayName:"newspaper",
                name:"all-categories",
                nameEnglish:"all-categories",
                contentUrl: "/apis/alltopics?langCode=" + (query.langCode || "en") + "&edition=" + (query.edition || "en")
              })
            }
            return callback(_.extend({finalArr: finArr, type: "allTopics"},query),null);
          })
        }
      })
      if(!matchFound){
        return helpers.getParalleNewsCalls([finArr[0],finArr[1]],query,function (respObj, err) {
          if(err) {
            return callback(null,err)
          }
          _.each(respObj,(respObjData,ind)=>{
            finArr[respObjData.index] = respObjData;
          })
          //Append Newspapers for landing headlines page
          if(query.topicType === "topicsList"){
            finArr.push({
              topicType:"newspaper",
              displayName:"newspaper",
              name:"all-categories",
              nameEnglish:"all-categories",
              contentUrl: "/apis/alltopics?langCode=" + (query.langCode || "en") + "&edition=" + (query.edition || "en")
            })
          }
          return callback(_.extend({finalArr: finArr, type: "allTopics"},query),null);
        })
      }
      return;
    }
    return callback([], "Error in first resp");
  },

  detailsdirect: function (req, callback) {
    var parallelCalls = function (cb) {
      makeRequest({
        urlList:[
          {url:urlMap.topics + (req.query.langCode || "en"),timeout:timeout.timeout, headers:header.headers, method:'get'},
          {url:urlMap.details + req.params.id,timeout:timeout.timeout, headers:header.headers, method:'get'}
        ],
        source:"server"
      },(err,resp)=>{
        if(err){
          return cb(err,null)
        }
        return cb(null,{
          topics: jsonFormatter.trends(resp && resp[0]),
          details: jsonFormatter.details(resp && resp[1])
        })
      })
    }
    var fetchAllTopics = function (cb) {
      return jsonFormatter.fetchAllTopicsWithData(req,cb);
    }

    async.parallel([parallelCalls, fetchAllTopics],function (err, respArr) {
      if(err || !respArr){
        return callback(err,null);
      }
      var allTopics = respArr[1];
      var details = respArr[0]["details"];
      details && (details.id = req.params.id);
      var headlines = _.at(allTopics,'finalArr.0');
      var headlinesRowData = _.at(headlines,'data.data.rows');
      var headlinesMetaData = {topicIndex: headlines.topicIndex,activeTopic:"topicsList",activeNavIndex:0};
      var detailsIndex;
      if(headlinesRowData){
        var updatedData = jsonFormatter.injectNFormat(headlinesRowData,details,0,headlinesMetaData,1);
        allTopics.finalArr[0]["data"]["data"]["rows"] = updatedData.rows;
        detailsIndex = updatedData.detailsIndex;
        details = updatedData.details
      }
      var respObj = {
        topics: respArr[0]["topics"],
        details: details,
        allTopics: allTopics,
        detailsIndex: detailsIndex
      }
      callback(null, respObj);
    })
  },

  trends: function (resp) {
    var data = _.at(resp,'data.data.sections'),
      respData = {};
    data.map(function(itm, itr){
      respData[itm.type] = _.chain(itm.kids.rows).sortBy("viewOrder").map((details, index) => {
        return {
          title:details.languageNameMapping.en,
          url: details.bannerImageUrl,
          key: details.key,
          index: index,
          viewOrder: details.viewOrder,
          childTopicIds:details.childTopicIds,
          pageLayout:details.pageLayout,
          showPublishDate:details.showPublishDate,
          languageNameMapping:details.languageNameMapping,
          nameEnglish:details.nameEnglish
        };
      }).compact().value()
    });
    return respData;
  },

  details: function (resp) {
    return  _.at(resp,'data.data');
  },

  languages: function (resp) {
    var data = _.at(resp,'data.data.rows');

    if(!data)
      return [];
    return {
      type: "languages",
      langArr: _.map(data, function (itm) {
        return {lang: itm.langUni, code: itm.code, name: itm.name};
      })
    }
  },

  groups: function (resp, lCode) {
    var data = _.at(resp,'data.data.rows');
    if(!data)
      return {finalArr:[],type:"allGroups"};
    return {
      finalArr: _.chain(data).sortBy("viewOrder").map((val, key) => {
        let gObj = {}
        if (val.langTitles && !_.isEmpty(val.langTitles[lCode])) {
          gObj.groupKey = val.groupKey;
          gObj.viewOrder = val.viewOrder;
          gObj.key = key;
          gObj.name = val.langTitles[lCode];
          return gObj;
        }
      }).compact().value(),
      type: "allGroups"
    }
  },

  npByCategory: function (resp) {
    var data = _.at(resp,'data.data');
    if(!data)
      return [];

    return {
      code: 200,
      type: "npByCat",
      data: {
        count: data.count,
        nextPageUrl: data.nextPageUrl,
        rows: data.rows && _.map(data.rows, function (row,index) {
          var rowData = _.pick(row, 'shortKey', 'nameUni', 'sourceNameEn' , 'name' ,'favIconUrl','imageUrl');
          rowData.key = index;
          return rowData;
        })
      }
    };
  },

  moreDetails(req, callback){
    let urlListObj = {},
      urlListArray = [];
    _.each(req.query,(val, key)=>{
      if(key.indexOf("url") !== -1){
        urlListObj[key] = decodeURIComponent(val);
      }
    });
    if(!_.isEmpty(urlListObj)){
      urlListObj.morecontenturl && (urlListArray.push({'url':urlListObj.morecontenturl,'method':"get", headers:header.headers}))
      return makeRequest({'urlList':urlListArray},(err, result)=>{
        if(err){
          return callback({error:"server error:"+err},null);
        }
        let additionalContents = _.at(result,'0.data.data.additionalContents');
        let relatedMetaData = {};
        let urlList = _.map(additionalContents,(val)=>{
          if(val && val.type === 'RELATED_NEWS'){
            relatedMetaData = val;
            return {url:val.content,'method':"get", headers:header.headers}
          }
        });
        return makeRequest({'urlList':_.compact(urlList)},(error, response)=>{
          if(error){
            return callback({error:"server error:"+error},null);
          }
          return callback(null, {
            related: _.at(response,'0.data') && jsonFormatter.news(response[0], _.deepExtend({},req.query)),
            morecontent : _.at(result,'0.data')
          });
        })
      })
    }
  },

}


export default jsonFormatter;
