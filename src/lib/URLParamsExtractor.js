import {} from "../config/constants"
var _ = require('underscore');

_.mixin(require('./mixins'));

let helpers = {
}

const URLParamsExtractor =  {

  home(params){
    let stateid = params.states[params.state] ? params.states[params.state]['id'] : '1';
    let url = [
        {url: `/apis/aasaudh/city/stateid/?stateid=${stateid}`, method: "get", params},
        {url: "/apis/aasaudh/entity/category/active/all", method: "get", params},
        {url: "/apis/aasaudh/entity/subcat/display/all", method: "get", params},
      ],
      updateFunction = "updateHome";
    return {
      url,
      updateFunction
    }
  },

  searchlist(params){
    console.log(" paramsssssss--->",params);
    let stateid = params.states[params.state] ? params.states[params.state]['id'] : '1';
    let cityid = _.at(params,'query.cityid');
    let localityid = _.at(params,'query.localityid');
    let categoryid = _.at(params,'query.categoryid');
    let uri = `/apis/aasaudh/entity/subcategory/categoryid/stateid/cityid/localityid/?categoryid=${categoryid}&stateid=${stateid}&cityid=${cityid}&localityid=${localityid}`
    let url = [
          {url: uri, method: "get", params},
        ],
        updateFunction = "updateSearchList";
      return {
        url,
        updateFunction
      }
  },
}


export default URLParamsExtractor;
