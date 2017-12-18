import URLParamsExtractor from '../lib/URLParamsExtractor';

//Why this file: List of parallel calls to be made before rendering a route url
export default function(params, pattern, cb) {
  if(params.dataToFetch){
    return cb(params.dataToFetch)
  }

  switch (pattern) {
    case "/state/:state":
      return cb({
        urlList: URLParamsExtractor.home(params).url,
        updateFunction: URLParamsExtractor.home(params).updateFunction,
      });
      break;

    case "/state/:state/searchlist":
      return cb({
        urlList: URLParamsExtractor.searchlist(params).url,
        updateFunction: URLParamsExtractor.searchlist(params).updateFunction,
      });
      break;
  }
}


