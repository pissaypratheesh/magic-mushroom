/**
 * Created by pratheesh on 19/5/17.
 */

import { pageSize, isQa } from "./constants";

let baseUrl = isQa ? 'http://13.126.245.12' : 'http://13.126.245.12';

var urlMap = {
  cities: baseUrl + "/city/stateId/",
  localities: baseUrl + "/locality/cityId/",
}

module.exports = urlMap;
