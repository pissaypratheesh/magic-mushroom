/**
 * Created by pratheesh on 20/5/17.
 */
var _ = require('underscore');
var moment = require('moment');
_.mixin(require('./mixins'));

const jsonRespFilter =  {
    news: function(resp){
      var data = _.at(resp,'data.data');
      if(data){
        return {
          code: 200,
          data: {
            count: data.count,
            nextPageUrl: data.nextPageUrl,
            rows: _.map(data.rows, function (row) {
              var rowData = _.pick(row, 'title', 'sourceNameEn' , 'id' ,'type' , 'thumbnail', 'childCount', 'childFetchUrl', 'content', 'tickers' );
              rowData.url = _.at(row, 'contentImage.url') || '';
              rowData.publishTime = moment(row.publishTime).fromNow();
              return rowData;
            })
          }
        };
      }
      return {};
    },

    allTopics: function (resp) {
      var data = _.at(resp,'data.data.rows');
      if(!data) {
        return []
      }
      return _.chain(data).sortBy("viewOrder").map((obj) => {
        if(obj.pageType === "TOPIC")
          return _.pick(obj, "contentUrl", "entityKey", "name", "nameEnglish", "pageType", "deepLinkUrl")
      }).compact().value();
    },

    trends: function (resp) {
      var data = _.at(resp,'data.data.sections'),
        respData = {};
      data.map(function(itm, itr){
        respData[itm.type] = _.map(itm.kids.rows,function(details){
          return {
            title:details.languageNameMapping.en,
            url: details.bannerImageUrl
          };
        })
      });
      return respData;
    },

    details: function (resp) {
      var data = _.at(resp,'data.data');
      var details = {};
      _.map(data,function (val,key) {
          switch(key) {
            case "title": details.title = val; break;
            case "contentImage": details.contentImageUrl = val.url; break;
            case "sourceBrandImage": details.sourceBrandImageUrl = val.url; break;
            case "sourceNameUni": details.sourceNameUni = val; break;
            case "categoryName": details.categoryName = val; break;
            case "publishTime": details.publishTime = moment(val).format('MMMM Do YYYY, h:mm a'); break;
            case "content": details.content = val; break;
            case "moreContentLoadUrl": details.moreContentLoadUrl = val; break;
            case "supplementUrl": details.supplementUrl = val; break;
          }
      })
      return data;
    },

    languages: function (resp) {
      var data = _.at(resp,'data.data.rows');

      if(!data)
        return [];
      return _.map(data,function(itm){
        return {lang:itm.langUni,code:itm.code, name:itm.name};
      });
    }
}


export default jsonRespFilter;
