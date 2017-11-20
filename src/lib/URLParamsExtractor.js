/**
 * Created by pratheesh on 12/6/17.
 */
import langMapping from '../config/langMapping'; //like "en":"english",
import {updateDataThreshold} from "../config/constants"
import ReverseLangMapping from '../config/ReverseLangMapping'; //like "english":"en"
var _ = require('underscore');

_.mixin(require('./mixins'));

let helpers = {
  shouldCall(list,presentTime){
    let olderTimespamp = _.at(list,'data.timestamp')
    if(!olderTimespamp){
      return true;
    }
    if(Math.floor((presentTime - olderTimespamp)/60000) > updateDataThreshold){
      return true;
    }
    return false;
  },

  generalizedTopics(params, listName, others){
    let url = [],
      updateFunction = "updateLandingPages",
      lang = ReverseLangMapping[params.language] || "en",
      edition = params.selectedCountry || 'india',
      waterfall =  false;
    let paramsType, nameIdentifier, urlList=[], presentTime = +Date.now();
    switch (listName){
      case "topicsList":
        paramsType = params.type && params.type.toLowerCase() //Like Entertainment etc
        nameIdentifier = "nameEnglish"
        break;

      case "newspaperLanding":
        paramsType = params.topicType && params.topicType.split("-updates-");
        paramsType && paramsType[1] && (paramsType = paramsType[1].toLowerCase()); // Like tv etc
        nameIdentifier = "shortKey"
        break;

      case "generalizedTopics":
        paramsType = params.topicType && params.topicType.split("-subtopics-");
        paramsType && paramsType[1] && (paramsType = paramsType[1].toLowerCase()); // Like tv etc
        nameIdentifier = "key"
        break;
    }
    params.listName = listName; //like topicsList, newspaperLanding
    //Topics list already exists
    if(params[listName] && (params[listName].length >= 1) && (paramsType || (_.at(params,'query.ignoreInit') && _.bool(params.query.ignoreInit))) && (params.selectedLang === ReverseLangMapping[params.language])){

      _.map(params[listName], (list, index) => {
        if (list && list[nameIdentifier] && (list[nameIdentifier].toLowerCase() === paramsType) && (paramsType !== "all-categories")) {
          if(helpers.shouldCall(list,presentTime)){
            !params[listName][index]["data"] && urlList.push({
              url:list.contentUrl + "&topicName=" + paramsType + "&topicIndex=" + index
            });

            index && list.prevTopicUrl &&  !params[listName][index-1]["data"] && (urlList.push({
              url:list.prevTopicUrl + "&topicName=" + params[listName][index-1][nameIdentifier].toLowerCase() + "&topicIndex=" + (index-1)
            }))

            list.nextTopicUrl &&  !params[listName][index+1]["data"] && (urlList.push({
              url:list.nextTopicUrl + "&topicName=" + params[listName][index+1][nameIdentifier].toLowerCase() + "&topicIndex=" + (index+1)
            }))
          }
          if(!_.isEmpty(urlList)) {
            let encodedUrls = "";
            _.each(urlList,(data,index)=>{
              encodedUrls += "&url"+index+"="+encodeURIComponent(data.url)
            })
            url.push({
              url: "/apis/news?langCode=" + lang + "&edition=" + edition + "&topicType=" + listName + encodedUrls ,
              method: "get",
              params
            })
          }
        }
      });

      updateFunction =  "updateRemainingData";
    } else {
      //First load of the page
      switch (listName) {
        case "topicsList":
          url.push({url: "/apis/alltopics?langCode=" + lang + "&edition=" + edition + "&topicType=" + listName + "&topicName=" + encodeURIComponent(paramsType), method: "get", params})
          break;
        case "newspaperLanding":
          //key here means like epaper name like pinkVilla
          url.push({url: "/apis/alltopics?langCode=" + lang + "&edition=" + edition + "&topicType=" + listName + "&topicName=" + encodeURIComponent(paramsType) + "&key=" + params.type.split("-epaper-")[1], method: "get", params})
          break;
        case "generalizedTopics":
          //key here means like 967 (money-boss)
          url.push({url: "/apis/alltopics?langCode=" + lang + "&edition=" + edition + "&topicType=" + listName + "&topicName=" + encodeURIComponent(paramsType) + "&key=" + params.type.split("-topics-")[1], method: "get", params})
          break;
      }
    }

    return {
      url,
      updateFunction,
      waterfall
    }
  },

  allTopics(params, listName){
    let url = [],
      updateFunction = "updateTopics",
      lang = ReverseLangMapping[params.language] || "en",
      edition = params.selectedCountry || 'india',
      waterfall =  false;
    params.listName = listName;
    url.push({url: "/apis/topics?langCode=" + lang  + "&edition=" + edition, method:"get", params});

    return {
      url,
      updateFunction,
      waterfall
    }
  },

  npByCategory(params, listName){
    let url = [],
      updateFunction = "updateNpByCategory",
      lang = ReverseLangMapping[params.language] || "en",
      edition = params.selectedCountry || 'india',
      waterfall =  false;
    !params.allCategories && url.push({url: "/apis/allgroups?langCode=" + (lang || "en"), method: "get", params});
    url.push({url: "/apis/npByCategory?langCode=" + lang + "&edition=" + edition + "&grpKey=" + params.type.split("-")[2] + "&pageSize=20", method: "get", params});
    return {
      url,
      updateFunction,
      waterfall
    }
  }
}

const URLParamsExtractor =  {

  details(params){
    let lang = ReverseLangMapping[params.language] || "en",
    edition = params.selectedCountry || 'india',
    url = params.selectedIdDetails ? [] :
        [
          {url:"/apis/detailsdirect/" + ((_.at(params,'newsiddetails') && _.isString(params.newsiddetails)) ? params.newsiddetails.split("-newsid-")[1] : 0) + "?langCode=" + lang + "&edition=" + edition, method: "get", params},
        ],
      updateFunction = "updateDetailsById";
    return {
      url,
      updateFunction
    }
  },

  languages(params){
    let url = params.supportedLanguages ? [] : [{url: "/apis/languages", method: "get", params}],
      updateFunction = "updateLanguages";
    return {
      url,
      updateFunction
    }
  },

  categories(params){
    let lang = ReverseLangMapping[params.language] || "en",
      edition = params.selectedCountry || 'india',
      updateFunction = "updateCategories",
      url = [];

    if(!params.supportedLanguages || _.isEmpty(params.supportedLanguages)) {
      url.push({
        url: "/apis/languages",
        method: "get",
        params
      });
    }

    (params.topicsList.length <= 1) && (url.push({
      url: "/apis/alltopics?langCode=" + lang + "&edition=" + edition,
      method: "get",
      params
    }));

    return {
      url,
      updateFunction,
    }
  },

  topics(params){
    if(params.type === "all-topics"){
      return helpers.allTopics(params, "topicsList")
    }
    if(_.isString(params.type) && params.type.indexOf("-updates-") !== -1){
      return helpers.npByCategory(params)
    }
    if(_.isString(params.type) && params.type.indexOf("-epaper-") !== -1){
      return helpers.generalizedTopics(params,"newspaperLanding")
    }
    if(_.isString(params.type) && params.type.indexOf("-topics-") !== -1){
      return helpers.generalizedTopics(params,"generalizedTopics")
    }
    if(_.isString(params.type) && params.type.indexOf("navigation-menu") !== -1){
      return helpers.generalizedTopics(params,"topicsList")
    }

    return helpers.generalizedTopics(params,"topicsList");
  }
}


export default URLParamsExtractor;
