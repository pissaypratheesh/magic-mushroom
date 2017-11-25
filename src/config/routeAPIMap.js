import URLParamsExtractor from '../lib/URLParamsExtractor';

//Why this file: List of parallel calls to be made before rendering a route url
export default function(params) {

  return {
    "/home" : {
      urlList: URLParamsExtractor.home(params).url,
      updateFunction: URLParamsExtractor.home(params).updateFunction,
    },
  }
}


