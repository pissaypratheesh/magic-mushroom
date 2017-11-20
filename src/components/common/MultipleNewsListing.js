/**
 * Created by pratheesh on 17/5/17.
 */
import NewsListing from "./NewsListing";
import LoadingGif from './LoadingGif';
import React from 'react';
import { InfiniteLoader, List, AutoSizer } from 'react-virtualized';
import UIEffects from '../../lib/UIEffects';
import { makeRequest } from '../../lib/makeRequest'
import { inject, observer } from "mobx-react";
import {CtoSTimeout, callRetries} from '../../config/constants'
import axios from 'axios';
import axiosRetry from 'axios-retry';
axiosRetry(axios, { retries: callRetries });

var _ = require('underscore');
var $ = require('element-class');
_.mixin(require('../../lib/mixins'));
var deviceInfo  = require('../../lib/deviceDetect');
const queryString = require('query-string')
var ReactGA = require('react-ga');
ReactGA.initialize('UA-64780041-3');
import { gaParmams,logPageView } from "../../lib/gaParamsExtractor";
import ReverseLangMapping from '../../config/ReverseLangMapping';

const STATUS_LOADING = 1
const STATUS_LOADED = 2


@inject("store")
@observer

class MultipleNewsListing extends React.Component {

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
    switch (this.store.activeTopic){
      case "topicsList":
        context.whichTopic = props.topic;
        name="nameEnglish"
        break;
      case "newspaperLanding":
        context.whichTopic = props.topicShortKey;
        name="shortKey"
        break;
      case "generalizedTopics":
        context.whichTopic = props.topicShortKey;
        name="key"
        break;
    }
    _.each(this.store[this.listName],(list, index)=>{
      if((list[name] && list[name].toLowerCase()) === (context.whichTopic && context.whichTopic.toLowerCase())){
        context.data = _.at(list,'data.data')
        context.whichTopicIndex = index;
      }
    })


    this.refresh = this.refresh.bind(this);

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


    let context = this;
    if(!this.store.selectedIdDetails) {
      _.each(this.store[this.listName], (list) => {
        if (list.name.toLowerCase() === context.whichTopic) {
          context.data = context.data || _.at(list, 'data.data')
        }
      })
    }


    if(!_.at(nextProps,'type.match.params.type') && (this.store.activeTopic === "topicsList")){
      //let data = this.store[this.listName][context.whichTopicIndex]["data"]["data"];
      //context.data = data
      //context.setState({data:data})
    }
  }


  refresh(){
    location.reload();
  }

  render() {
    let context = this,
        useDynamicRowHeight = true,
        selIdDet = _.at(context, 'store.selectedIdDetails'),
        selIdIndex = selIdDet && selIdDet.index;
    let list = _.at(context, 'data.rows')
    if(!selIdDet){
      let qParamsStr = location.search && location.search.split("?")[1];
      let qParams = qParamsStr && queryString.parse(qParamsStr);
      let selId = qParams && qParams.selId, selIdIndex;
      !_.isUndefined(selId) && !_.isEmpty(selId) && _.find(list,(obj, ind)=>{
        if(obj.id === selId){
          selIdIndex = ind;
          return true;
        }
        return false;
      })
    }
    if(!this.store.showLandingPage) {
      return <div></div>
    }
    return (
      <div id={context.listName + context.whichTopicIndex} className="dh-list-item">
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
                  rowHeight={useDynamicRowHeight ? this._getRowHeight : 130}
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
    return (item.type === "PHOTO" ? size : 130);
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
    var uri = '/apis/news' + "?url=" + encodeURIComponent(this.data.nextPageUrl) + "&nextIndex=" + currentNews.length + "&activeTopic=" + context.listName + "&activeNavIndex=" + context.whichTopicIndex
    uri+="&mode=pwa";
    if(loadedRowCount === currentNews.length){
      context.setState({showLoader:true})
    }

    return new Promise(
      (resolve, reject) =>{
        makeRequest({ urlList:[{url:uri,timeout:CtoSTimeout,method:'get'}],source:'client',store:context.store},(err, res)=>{
          if(err){
            UIEffects.showServerError(err);
            return resolve("Success");// exit safe
          }
          let respData = _.at(res,'0.data'),
              endOfPage;
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
            })

            let getPageNo =  context.data.nextPageUrl && queryString.parse(context.data.nextPageUrl.split("?")[1])
            let pageNo = _.at(getPageNo, 'pageNumber')||0;
            let lang = _.at(this,'store.match.params.language') || 'english';
            let listType = _.at(this,'props.listName');
            let type = _.at(this,'props.topic');
            let dtype = (listType=='newspaperLanding')?type+'-epaper-':type+'-topics-';

            let param = gaParmams({language:lang,type:dtype});
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
    this.store.changeHeaderBehaviour(scrollTop);
  }

  _rowRenderer ({ index,isScrolling, key, style }) {
    const  list  =  _.at(this,'data.rows')
    const row = list[index]
    const { loadedRowsMap } = this.state
    let content
    if (loadedRowsMap[index] === STATUS_LOADED) {
      let item = row;
      item.index =  index;
      item.listName = this.listName;
      item.whichTopic = this.whichTopic;
      item.whichTopicIndex = this.whichTopicIndex;
      return (
        <NewsListing {...this.props}
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

export default MultipleNewsListing;




