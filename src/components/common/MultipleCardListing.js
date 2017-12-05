/**
 * Created by pratheesh on 17/5/17.
 */
import DocListing from "./DocListing";
import React from 'react';
import { InfiniteLoader, List, AutoSizer } from 'react-virtualized';
import UIEffects from '../../lib/UIEffects';
import { makeRequest } from '../../lib/makeRequest'
import { inject, observer } from "mobx-react";
import { toJS ,isObservable } from "mobx"
import { CtoSTimeout, callRetries } from '../../config/constants'
var _ = require('underscore');
var $ = require('element-class');
_.mixin(require('../../lib/mixins'));
var deviceInfo  = require('../../lib/deviceDetect');
const queryString = require('query-string')
var ReactGA = require('react-ga');
ReactGA.initialize('UA-64780041-3');

const STATUS_LOADING = 1
const STATUS_LOADED = 2


@inject("store")
@observer

class MultipleCardListing extends React.Component {

  constructor(props) {

    super(props);
    this.store = this.props.store.appState;
    this.data;
    this.listName = this.props.listName;
    //this.scrollPosition=0;
    this.state = {
      loadedRowCount: 0,
      loadedRowsMap: [],
      loadingRowCount: 0,
      showLoader: false,
      endOfPage: false,
      data:[]
    }
    this.whichTopicIndex;
    this.whichTopic;

    let context = this,name;
    context.data = {id:234,rows:[{"entityId":1,"entityAausadhId":"DOC1117100","entityName":"Chandra","entityCategoryId":1,"yearOfStating":1999,"totalExperiance":10,"totalFeedbackCount":10,"totalVoteCount":10,"reatingPercentage":"90","location":"NewTown","fees":"500","isSponsored":"YES","schedule":{"time":[{"weekDay":"MON","fromTo":"8:00AM-10:00AM/5:00PM-10:00PM"},{"weekDay":"TUE","fromTo":"8:00AM-10:00AM"},{"weekDay":"WED","fromTo":"8:00AM-10:00AM"},{"weekDay":"THU","fromTo":"8:00AM-10:00AM"},{"weekDay":"FRY","fromTo":"10:00AM-10:00PM"}]},"entitySubCategoryCount":{"entitySubCategory":[{"entitySubcategoryName":"Dental Surgeon","count":10},{"entitySubcategoryName":"Endodontist","count":15},{"entitySubcategoryName":"Pediatric Dentist","count":12}]},"entityServiceTypes":{"entityServices":[{"serviceName":"Tooth Bleaching"},{"serviceName":"Artificial Teeth"},{"serviceName":"Cast Partial Denture"}],"totalServiceCount":40},"entityProfileImagePath":"","entityGalleryImages":{"images":[{"path":""},{"path":""},{"path":""}]},"entityQualifications":{"qualifications":[{"name":"M.B.B.S","id":1},{"name":"B.D.S","id":2},{"name":"B.Pharma","id":3}]},"relatedClinics":{"clinics":[{"name":"clinic1","id":1},{"name":"clinic2","id":2}],"totalClinicCount":2}},{"entityId":2,"entityAausadhId":"DOC1117100","entityName":"Chandra","entityCategoryId":1,"yearOfStating":1999,"totalExperiance":10,"totalFeedbackCount":10,"totalVoteCount":10,"reatingPercentage":"90","location":"NewTown","fees":"500","isSponsored":"YES","schedule":{"time":[{"weekDay":"MON","fromTo":"8:00AM-10:00AM/5:00PM-10:00PM"},{"weekDay":"TUE","fromTo":"8:00AM-10:00AM"},{"weekDay":"WED","fromTo":"8:00AM-10:00AM"},{"weekDay":"THU","fromTo":"8:00AM-10:00AM"},{"weekDay":"FRY","fromTo":"10:00AM-10:00PM"}]},"entitySubCategoryCount":{"entitySubCategory":[{"entitySubcategoryName":"Dental Surgeon","count":10},{"entitySubcategoryName":"Endodontist","count":15},{"entitySubcategoryName":"Pediatric Dentist","count":12}]},"entityServiceTypes":{"entityServices":[{"serviceName":"Tooth Bleaching"},{"serviceName":"Artificial Teeth"},{"serviceName":"Cast Partial Denture"}],"totalServiceCount":40},"entityProfileImagePath":"","entityGalleryImages":{"images":[{"path":""},{"path":""},{"path":""}]},"entityQualifications":{"qualifications":[{"name":"M.B.B.S","id":1},{"name":"B.D.S","id":2},{"name":"B.Pharma","id":3}]},"relatedClinics":{"clinics":[{"name":"clinic1","id":1},{"name":"clinic2","id":2}],"totalClinicCount":2}},{"entityId":3,"entityAausadhId":"DOC1117100","entityName":"Chandra","entityCategoryId":1,"yearOfStating":1999,"totalExperiance":10,"totalFeedbackCount":10,"totalVoteCount":10,"reatingPercentage":"90","location":"NewTown","fees":"500","isSponsored":"YES","schedule":{"time":[{"weekDay":"MON","fromTo":"8:00AM-10:00AM/5:00PM-10:00PM"},{"weekDay":"TUE","fromTo":"8:00AM-10:00AM"},{"weekDay":"WED","fromTo":"8:00AM-10:00AM"},{"weekDay":"THU","fromTo":"8:00AM-10:00AM"},{"weekDay":"FRY","fromTo":"10:00AM-10:00PM"}]},"entitySubCategoryCount":{"entitySubCategory":[{"entitySubcategoryName":"Dental Surgeon","count":10},{"entitySubcategoryName":"Endodontist","count":15},{"entitySubcategoryName":"Pediatric Dentist","count":12}]},"entityServiceTypes":{"entityServices":[{"serviceName":"Tooth Bleaching"},{"serviceName":"Artificial Teeth"},{"serviceName":"Cast Partial Denture"}],"totalServiceCount":40},"entityProfileImagePath":"","entityGalleryImages":{"images":[{"path":""},{"path":""},{"path":""}]},"entityQualifications":{"qualifications":[{"name":"M.B.B.S","id":1},{"name":"B.D.S","id":2},{"name":"B.Pharma","id":3}]},"relatedClinics":{"clinics":[{"name":"clinic1","id":1},{"name":"clinic2","id":2}],"totalClinicCount":2}},{"entityId":4,"entityAausadhId":"DOC1117100","entityName":"Chandra","entityCategoryId":1,"yearOfStating":1999,"totalExperiance":10,"totalFeedbackCount":10,"totalVoteCount":10,"reatingPercentage":"90","location":"NewTown","fees":"500","isSponsored":"YES","schedule":{"time":[{"weekDay":"MON","fromTo":"8:00AM-10:00AM/5:00PM-10:00PM"},{"weekDay":"TUE","fromTo":"8:00AM-10:00AM"},{"weekDay":"WED","fromTo":"8:00AM-10:00AM"},{"weekDay":"THU","fromTo":"8:00AM-10:00AM"},{"weekDay":"FRY","fromTo":"10:00AM-10:00PM"}]},"entitySubCategoryCount":{"entitySubCategory":[{"entitySubcategoryName":"Dental Surgeon","count":10},{"entitySubcategoryName":"Endodontist","count":15},{"entitySubcategoryName":"Pediatric Dentist","count":12}]},"entityServiceTypes":{"entityServices":[{"serviceName":"Tooth Bleaching"},{"serviceName":"Artificial Teeth"},{"serviceName":"Cast Partial Denture"}],"totalServiceCount":40},"entityProfileImagePath":"","entityGalleryImages":{"images":[{"path":""},{"path":""},{"path":""}]},"entityQualifications":{"qualifications":[{"name":"M.B.B.S","id":1},{"name":"B.D.S","id":2},{"name":"B.Pharma","id":3}]},"relatedClinics":{"clinics":[{"name":"clinic1","id":1},{"name":"clinic2","id":2}],"totalClinicCount":2}},{"entityId":5,"entityAausadhId":"DOC1117100","entityName":"Chandra","entityCategoryId":1,"yearOfStating":1999,"totalExperiance":10,"totalFeedbackCount":10,"totalVoteCount":10,"reatingPercentage":"90","location":"NewTown","fees":"500","isSponsored":"YES","schedule":{"time":[{"weekDay":"MON","fromTo":"8:00AM-10:00AM/5:00PM-10:00PM"},{"weekDay":"TUE","fromTo":"8:00AM-10:00AM"},{"weekDay":"WED","fromTo":"8:00AM-10:00AM"},{"weekDay":"THU","fromTo":"8:00AM-10:00AM"},{"weekDay":"FRY","fromTo":"10:00AM-10:00PM"}]},"entitySubCategoryCount":{"entitySubCategory":[{"entitySubcategoryName":"Dental Surgeon","count":10},{"entitySubcategoryName":"Endodontist","count":15},{"entitySubcategoryName":"Pediatric Dentist","count":12}]},"entityServiceTypes":{"entityServices":[{"serviceName":"Tooth Bleaching"},{"serviceName":"Artificial Teeth"},{"serviceName":"Cast Partial Denture"}],"totalServiceCount":40},"entityProfileImagePath":"","entityGalleryImages":{"images":[{"path":""},{"path":""},{"path":""}]},"entityQualifications":{"qualifications":[{"name":"M.B.B.S","id":1},{"name":"B.D.S","id":2},{"name":"B.Pharma","id":3}]},"relatedClinics":{"clinics":[{"name":"clinic1","id":1},{"name":"clinic2","id":2}],"totalClinicCount":2}}]};

    this._clearData = this._clearData.bind(this)
    this._isRowLoaded = this._isRowLoaded.bind(this)
    this._loadMoreRows = this._loadMoreRows.bind(this)
    this._rowRenderer = this._rowRenderer.bind(this)
    this._onScroll = this._onScroll.bind(this)
    this._getRowHeight = this._getRowHeight.bind(this)
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidUpdate() {
  }

  componentWillReceiveProps(nextProps) {
  }


  render() {
    let context = this,
        useDynamicRowHeight = false,//was true
        selIdDet = _.at(context, 'store.selectedIdDetails'),
        selIdIndex = selIdDet && selIdDet.index;
    let list = _.at(context, 'data.rows');
    return (
      <div id={context.data.id} className="dh-list-item">
        <InfiniteLoader
          isRowLoaded={this._isRowLoaded}
          loadMoreRows={this._loadMoreRows}
          rowCount={list && list.length}
          threshold={3}
        >
          {({onRowsRendered, registerChild}) => (
            <AutoSizer disableHeight>
              {({width}) => (
                <List
                  ref={registerChild}
                  className={""}
                  height={665}
                  onRowsRendered={onRowsRendered}
                  rowCount={(list && list.length) || 0}
                  rowHeight={useDynamicRowHeight ? this._getRowHeight : 178}
                  scrollToIndex={selIdIndex}
                  scrollToAlignment="center"
                  rowRenderer={this._rowRenderer}
                  onScroll={this._onScroll}
                  width={width}
                />
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    );
  }

  _clearData () {
    this.setState({
      loadedRowCount: 0,
      loadedRowsMap: [],
      loadingRowCount: 0
    })
  }

  _getRowHeight({index}) {
    let  list  =  this.data.rows;
    let item = list[index];
    let size = Object.keys(item).length<3?130:213;
    let cardSizeType = (item.moreStories ? "MORE" : item.type);
    switch(cardSizeType) {
      case "MORE":
        return 162;
      case "PHOTO":
        return size;
      default:
        return 130;
    }
    //return (item.type === "PHOTO" ? size : 130);
  }


  _isRowLoaded ({ index }) {
    const { loadedRowsMap } = this.state
    return !!loadedRowsMap[index] // STATUS_LOADING or STATUS_LOADED
  }

  _loadMoreRows ({ startIndex, stopIndex }) {
    const { loadedRowsMap, loadingRowCount,loadedRowCount } = this.state;
    const increment = stopIndex - startIndex + 1;
    let currentNews = this.data.rows;
    let context = this, eop;
    if(currentNews  && (currentNews.length < 11 )){
      //marks the end of the page
      eop = currentNews.length;
    }
    for (let i = startIndex; i <= stopIndex; i++) {
      loadedRowsMap[i] = STATUS_LOADING
    }

    this.setState({
      loadingRowCount: loadingRowCount + increment
    })

    if((loadedRowsMap.length < (currentNews.length-1) || eop)){
      for (var i = startIndex; i <= (eop ? eop:stopIndex); i++) {
        loadedRowsMap[i] = STATUS_LOADED
      }
      this.setState({
        loadedRowsMap: loadedRowsMap,

      })
      return new Promise(resolve => resolve("Success"));
    }
    var uri = '/apis/news' + "?url=" + encodeURIComponent(this.data.nextPageUrl) + "&nextIndex=" + currentNews.length + "&activeTopic=" + context.listName + "&activeNavIndex=" + context.whichTopicIndex;
    uri+="&mode=pwa";
    if(loadedRowCount === currentNews.length){
      context.setState({showLoader:true})
    }

    return new Promise(
      (resolve, reject) =>{
        let urlObj = { urlList:[{url:uri,timeout:CtoSTimeout,method:'get'}],source:'client',store:context.store};
        if(context.nextPageContentRequestMethod === "POST") {
          let metaData = helpers.getChronoHeadlinesMeta(uri,context.newsInfo);
          urlObj = { urlList:
            [{
            url:uri,
            timeout:CtoSTimeout,
            method:'get',
            headers: { meta: JSON.stringify(metaData.body)}
          }],source:'client',store:context.store};
        }
        makeRequest(urlObj,(err, res)=>{
          let respData = _.at(res,'0.data'),
              getPageNo =  context.data.nextPageUrl && queryString.parse(context.data.nextPageUrl.split("?")[1]),
              pageNo = _.at(getPageNo, 'pageNumber')||0,
              lang = _.at(this,'store.match.params.language') || 'english',
              listType = _.at(this,'props.listName'),
              type = _.at(this,'props.topic'),
              dtype = (listType=='newspaperLanding')?type+'-epaper-':type+'-topics-',
              param = gaParmams({language:lang,type:dtype}),
              endOfPage;

          if(err){
            UIEffects.showServerError(err);
            return resolve("Success");// exit safe
          }

          if(this.instumentation){
            this.instumentation && (this.instumentation.page_number = ((+pageNo) + 1))
            pushGeneric(this.instumentation,'STORY_LIST_VIEW');
          }

          if(!respData || _.isEmpty(respData) || _.isEmpty(_.at(respData,'data.rows'))) {
            // ("End of page")
            for (var i = startIndex; i <= (eop ? eop:currentNews.length); i++) {
              loadedRowsMap[i] = STATUS_LOADED
            }
            context.setState({
              loadedRowCount: currentNews.length,
              loadedRowsMap:loadedRowsMap,
              endOfPage:true
            });
            context.store.markEndOfPage(context.whichTopicIndex,context.listName)
            return;
          }

          // Check for the continuity
          if(_.at(res,'0.data.data.rows.0.index') === (currentNews[currentNews.length-1]["index"] +1 )){
            context.store.newsPagination(currentNews.concat(_.at(res,'0.data.data.rows') || []), _.at(res,'0.data.data.nextPageUrl'), context.listName)
            context.data.rows = currentNews.concat(_.at(res,'0.data.data.rows') || [])
            context.data.nextPageUrl =  _.at(res,'0.data.data.nextPageUrl')
            let news = context.data.rows;
            if(_.at(res,'0.data.data.rows')  && (_.at(res,'0.data.data.rows').length < 10 )){
              //marks the end of the page
              endOfPage = news.length;
            }
            for (var i = startIndex; i <= (endOfPage ? endOfPage : stopIndex); i++) {
              loadedRowsMap[i] = STATUS_LOADED
            }
            context.setState({
              loadingRowCount: news.length - increment,
              loadedRowCount: news.length,
              loadedRowsMap: loadedRowsMap,
              showLoader:false
            });
            logPageView(param,pageNo);
            return resolve("Success")
          }
          else {
            return resolve("Success"); // Fail silently
          }

        })
      })
  }

  _onScroll({clientHeight, scrollHeight, scrollTop}){
  }

  _rowRenderer ({ index,isScrolling, key, style }) {
    const  list  =  _.at(this,'data.rows')
    const row = list[index]
    console.log(" \n\n index and card-->",index,row)
    const { loadedRowsMap } = this.state
    let content
    if (loadedRowsMap[index] === STATUS_LOADED) {
      let item = row;
      item.index =  index;
      item.listName = this.listName;
      item.whichTopic = this.whichTopic;
      item.whichTopicIndex = this.whichTopicIndex;
      return (
        <DocListing {...this.props}
                     webpSrc= {item.url && (item.url.split(".jpg")[0] + ".webp")}
                     webpAlt=""
                     imgSrc= {item.url}
                     imgAlt=""
                     id={item.id}
                     item={item}
                     type={item.type}
                     title={item.title}
                     npName={item.sourceNameEn}
                     style={style}
                     key = {key}
                     time={item.publishTime}/>
      )
    } else {
      content = (
        <section className="crdShimmer">
          <div className="inr clearfix">
            <picture className="aniBg"></picture>
            <div className="list-content">
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
            </div>
          </div>
        </section>
      );
      return (
        <div
          className={""}
          key={key}
          style={style}
        >
          {content}
        </div>
      )
    }

  }
}

export default MultipleCardListing;




