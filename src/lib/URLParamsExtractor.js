import {} from "../config/constants"
var _ = require('underscore');

_.mixin(require('./mixins'));

let helpers = {
}

const URLParamsExtractor =  {

  home(params){
    let url = [
        {url: "/apis/city/stateId/1", method: "get", params},
        {url: "/apis/entity/category/all", method: "get", params},
      ],
      updateFunction = "updateHome";
    return {
      url,
      updateFunction
    }
  },
}


export default URLParamsExtractor;
