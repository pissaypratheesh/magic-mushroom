var _ = require('underscore');

_.mixin(require('./mixins'));

const URLParamsExtractor =  {


  languages(params){
    let url = params.supportedLanguages ? [] : [{url: "/apis/languages", method: "get", params}],
      updateFunction = "updateLanguages";
    return {
      url,
      updateFunction
    }
  },
}


export default URLParamsExtractor;
