/**
 * Created by pratheesh on 8/6/17.
 */

import URLParamsExtractor from '../lib/URLParamsExtractor';

//Why this file: List of parallel calls to be made before rendering a route url
export default function(params) {

  let topicsOrDetails;
  let topicsRelated = {
    urlList: "",
    updateFunction: '',
    waterfall: ''
  };
  if(params.topicType){
    topicsOrDetails = (params.topicType.indexOf("-newsid-") !== -1) ? "details" : "topics";
  }
  return {

    "/home":{
      urlList: URLParamsExtractor.home(params).url,
      updateFunction:URLParamsExtractor.home(params).updateFunction
    },
  }
}


