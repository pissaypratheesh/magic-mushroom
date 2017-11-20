/**
 * Created by pratheesh on 19/5/17.
 */

import { pageSize, isQa } from "./constants";

let baseUrl = isQa ? 'http://qa-news.newshunt.com' : 'http://dh-ws.news.dailyhunt.in';

var urlMap = {
  allTopics:baseUrl + "/api/v1/pages/users/",
  allTopicsCompleteUrl: baseUrl + "/api/v1/pages/users/dhpwa123?langCode=",
  npCategoryTopics: baseUrl + "/api/v1/categories/source/",
  news: baseUrl + "/api/v1/headlines/user/WEB-1234?edition=india&pageSize=" + pageSize +"&langCode=",
  headlines: baseUrl + "/api/v1/headlines/user/",
  topics: baseUrl + "/api/v1/topics/navigations?edition=india&langCode=",
  generalizedTopics: baseUrl + "/api/v1/topics/",
  details: baseUrl + "/api/v1/news/article/",
  lang: baseUrl + "/api/v1/languages?editionKey=india",
  group: baseUrl + "/api/v1/groups/edition/india",
  npByCategory: baseUrl + "/api/v1/newspapers?editionKey=",
  getClientId: baseUrl + '/api/v1/register/pwa',
}

module.exports = urlMap;
