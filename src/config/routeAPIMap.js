/**
 * Created by pratheesh on 8/6/17.
 */

import langMapping from '../config/langMapping'; //like "en":"english",
import ReverseLangMapping from '../config/ReverseLangMapping'; //like "english":"en"
import URLParamsExtractor from '../lib/URLParamsExtractor';

//Why this file: List of parallel calls to be made before rendering a route url
export default function(params) {

  let topicsOrDetails;
  let topicsRelated = {
    urlList: URLParamsExtractor.topics(params).url,
    updateFunction: URLParamsExtractor.topics(params).updateFunction,
    waterfall: URLParamsExtractor.topics(params).waterfall
  };
  if(params.topicType){
    topicsOrDetails = (params.topicType.indexOf("-newsid-") !== -1) ? "details" : "topics";
  }
  return {

    "/news/:country/:language/country-language-menu" : {
      urlList: URLParamsExtractor.languages(params).url,
      updateFunction: URLParamsExtractor.languages(params).updateFunction,
    },

    "/news/:country/:language/navigation-menu" : topicsRelated,

    "/news/:country/:language/:type" : topicsRelated,

    "/news/:country/:language" : topicsRelated,

    "/news/:country/:language/:type/:topicType" : {
      urlList: URLParamsExtractor[topicsOrDetails] && URLParamsExtractor[topicsOrDetails](params).url,
      updateFunction: URLParamsExtractor[topicsOrDetails] && URLParamsExtractor[topicsOrDetails](params).updateFunction,
      waterfall:  URLParamsExtractor[topicsOrDetails] && URLParamsExtractor[topicsOrDetails](params).waterfall
    },
  }
}


