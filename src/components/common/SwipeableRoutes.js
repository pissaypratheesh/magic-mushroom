// This is details page virtualized swipeable views
import React, { Component } from "react";
import { Route, matchPath } from "react-router-dom";
import {CtoSTimeout, callRetries} from '../../config/constants'
import {makeRequest} from '../../lib/makeRequest'
import LoadingGif from "./LoadingGif"
import Details from "../../pages/Details";
import langMapping from '../../config/langMapping';
import {withRouter} from "react-router-dom";
import UIEffects from '../../lib/UIEffects';
import { inject, observer } from "mobx-react";
import SwipeableViews from 'react-swipeable-views';
import { virtualize, bindKeyboard } from 'react-swipeable-views-utils';
const queryString = require('query-string')
const VirtualizeSwipeableViews = bindKeyboard(virtualize(SwipeableViews));
var _ = require('underscore');
var deviceInfo  = require('../../lib/deviceDetect');

_.mixin(require('../../lib/mixins'));
var appendQuery = require('append-query')

@observer
@inject("store")
class SwipeableRoutes extends Component {

  constructor(props) {
    super(props);
    this.store =  this.props.store.appState;
    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.onBackButtonEvent = this.onBackButtonEvent.bind(this);
    this.slideRenderer = this.slideRenderer.bind(this);
    this.getIdFrmUrl = this.getIdFrmUrl.bind(this);
    this.fetchDetailsFromUrl = this.fetchDetailsFromUrl.bind(this);
    this.fetchNextPageData = this.fetchNextPageData.bind(this);
    this.fetchBackLink = this.fetchBackLink.bind(this);
  }

  fetchBackLink(listName){
    let headersBackLink, context= this;
    if( !_.isUndefined(this.store.viewRelatedDetails)){
      headersBackLink = _.at(this,'store.selectedIdDetails.detailsPageUrl');
    }

    if(!headersBackLink && listName) {
      switch (listName) {
        case "newspaperLanding":
          headersBackLink = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${encodeURIComponent(context.store.npName)}-epaper-${context.store.npKey}/${encodeURIComponent(context.store.activeNav)}-updates-${context.store.activeNav}`
          break;

        default:
          headersBackLink = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${context.store.activeNav}`
          break;
      }
    }
    return headersBackLink;
  }

  fetchNextPageData(){
    let selectedNavData = this.store[this.store.activeTopic] && this.store[this.store.activeTopic][this.store.activeNavIndex],
        data = selectedNavData && _.at(selectedNavData,'data.data'),
        context = this,
        uri;

    if(data){
      uri = '/apis/news' + "?url=" + encodeURIComponent(data.nextPageUrl) + "&nextIndex=" + data.rows.length + "&listName=" + this.store.activeTopic + "&activeTopic=" + context.store.activeTopic + "&activeNavIndex=" + context.store.activeNavIndex;
      uri += "&mode=pwa";
      makeRequest({ urlList:[{url:uri,timeout:CtoSTimeout,method:'get'}],source:'client',store:context.store},function (err,resp) {
        if(err){
          return UIEffects.showServerError(err);
        }
        let respData = _.at(resp,'0.data');
        var currentNews = data.rows;
        if(!respData || _.isEmpty(respData) || _.isEmpty(_.at(respData,'data.rows'))) {
          // ("End of page")
          context.store.markEndOfPage(context.store.activeNavIndex,context.store.activeTopic)
          return;
        }
        if(_.at(resp,'0.data.data.rows.0.index') === (currentNews[currentNews.length-1]["index"] +1 )){
          context.store.detailsPagination(currentNews.concat(_.at(resp,'0.data.data.rows') || []), _.at(resp,'0.data.data.nextPageUrl'),context.store.activeTopic)
        }
      })
    }
  }

  getIdFrmUrl(){
    let currentUrl = window.location.href,
      substr = currentUrl.split('newsid-')[1];
    return substr ? substr.split('?')[0] : "";

  }

  handleIndexChange(index, type){

    let selectedNavData = this.store[this.store.activeTopic] && this.store[this.store.activeTopic][this.store.activeNavIndex],
      data = selectedNavData && _.at(selectedNavData,'data.data');
    let obj = _.at(data,'rows') && _.at(data,'rows')[index];
    if(index === (_.at(data,'rows.length') - 6 )){
      this.fetchNextPageData()
    }
    this.store.timespentCalculator('details',{id:this.getIdFrmUrl()},'stop','handleindexchangeo of swipeableroutes');
    this.store.onDetailsSwipe(obj)
    obj && this.props.history.replace(obj.detailsPageUrl)
  };

  componentDidMount() {
  }

  onBackButtonEvent(e){
    this.store.timespentCalculator('details',{id:this.getIdFrmUrl()},'stop','onBackButtonEvent swipeaableroutes');
    if(!this.store.viewRelatedDetails){
       let listName = _.at(this,'store.selectedIdDetails') ? this.store.selectedIdDetails.listName : "topicsList";
       e.preventDefault();
       this.props.history.push(this.fetchBackLink(listName));
    } else{
     this.store.clearRelatedDetails()
    }
  }

  slideRenderer(params) {
    const {
      index,
      key,
    } = params;
    let selectedIdDetails = _.at(this, 'store.selectedIdDetails')
    let matchedIndex = selectedIdDetails && selectedIdDetails.index
    matchedIndex = matchedIndex && Number(matchedIndex);
    let qList = this.props.queryList;
    let activeTopic = _.at(qList, 'listname') || this.store.activeTopic,
      activeNavIndex = !_.isUndefined(_.at(qList, 'topicIndex')) ? _.at(qList, 'topicIndex') : this.store.activeNavIndex
    let selectedNavData = this.store[activeTopic] && this.store[activeTopic][activeNavIndex],
      data = selectedNavData && _.at(selectedNavData, 'data.data.rows'),
      length = _.at(data, 'length');
    if (!_.isUndefined(matchedIndex) && (index === matchedIndex || (index >= matchedIndex - 2) || (index <= matchedIndex + 2))) {
      if (length && (index >= (length - 1))) {
        return (
          <div key={key}>
            <Details details={data ? data[length - 1] : {}} {...this.props}/>
          </div>
        )
      }
      return (
        <div key={key}>
          <Details details={data ? data[index] : {}} {...this.props}/>
        </div>
      )
    }else return (
      <div key={key}>
        <Details details={data ? data[length - 1] : {}} {...this.props}/>
      </div>
    )
  }

  componentWillReceiveProps(){

  }

  componentDidMount() {
    let selIdDetails = _.at(this,'store.selectedIdDetails')
    if(_.at(selIdDetails,'directLanding')){
      const {history} = this.props;
      let redirectUrl = _.at(selIdDetails,'detailsPageUrl');
      redirectUrl = appendQuery(redirectUrl,_.at(this.props,'queryList'))
      redirectUrl && history.replace(redirectUrl);
      this.store.topicsList[0]['data']['data']['rows'][selIdDetails.index]['directLanding'] = false;
    }
  }

  fetchDetailsFromUrl(){
    let currentUrl = window.location.href,
      substr = currentUrl.split('newsid-')[1];
    let id = substr ? substr.split('?')[0] : "";
    let query = window.location.search.split("?");
    let queryList = query && query[1] && queryString.parse(query[1]);
    let listName = _.at(queryList, 'listname');
    let index = _.at(queryList, 'index');
    let topicIndex = _.at(queryList, 'topicIndex');
    if(listName && !_.isUndefined(index) && !_.isUndefined(topicIndex)
      && this.store[listName] && this.store[listName][topicIndex]
      && this.store[listName][topicIndex]['data'] &&  this.store[listName][topicIndex]['data']['data']['rows'][index]) {
      return this.store[listName][topicIndex]['data']['data']['rows'][index];
    }
  }

  render() {
    let matchedIndex;
    let selectedIdDetails = this.fetchDetailsFromUrl();
    if(selectedIdDetails) {
      matchedIndex = selectedIdDetails.index;
      this.store.onDetailsSwipe(selectedIdDetails)
    }

    if(_.isUndefined(matchedIndex)) {
      matchedIndex = _.at(this, 'store.selectedIdDetails.index')
    }

    let selectedNavData = this.store[this.store.activeTopic] && this.store[this.store.activeTopic][this.store.activeNavIndex],
      data = selectedNavData && _.at(selectedNavData,'data.data');
    let stopSlide = !this.store.selectedIdDetails || (_.at(data,'size') && (matchedIndex === (data.size -1))) || (matchedIndex >= _.at(data,'rows.length'));


    if(!_.isUndefined(matchedIndex)) {
      return (
        <VirtualizeSwipeableViews
          index={matchedIndex}
          animateHeight={true}
          animateTransitions={true}
          onChangeIndex={this.handleIndexChange}
          slideRenderer={this.slideRenderer}
          hysteresis={0}
          overscanSlideBefore={this.store.viewRelatedDetails ? 0 : ((matchedIndex === 0) ? matchedIndex : 1)}
          overscanSlideAfter={this.store.viewRelatedDetails ? 0 : (stopSlide ? 0 : 1)}
          springConfig={{
            duration: '0.41s',
            easeFunction: 'cubic-bezier(0.15, 0.3, 0.25, 1)',
            delay: '0s',
          }}
          {...this.props}
        />
      );
    }
    return (<LoadingGif/>)
  }
}
export default withRouter(SwipeableRoutes);
