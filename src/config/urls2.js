

import { pageSize, isQa } from "./constants";

let baseUrl = isQa ? 'http://13.126.245.12:8080' : 'http://13.126.245.12:8080';
var urlMap = {
  cities: baseUrl + "/city/stateId/",
  localities: baseUrl + "/locality/cityId/",
}
export {
  urlMap,
  baseUrl
}
