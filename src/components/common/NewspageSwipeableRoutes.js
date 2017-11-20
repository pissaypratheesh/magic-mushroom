import React, { Component } from "react";
import langMapping from '../../config/langMapping';
import MultipleNewsListing from "./MultipleNewsListing";
import LoadingGif from "./LoadingGif"
import { inject, observer } from "mobx-react";
import {withRouter} from "react-router-dom";
import SwipeableViews from 'react-swipeable-views';
import { virtualize, bindKeyboard } from 'react-swipeable-views-utils';
import AllCategories from "./AllCategories";

const VirtualizeSwipeableViews = bindKeyboard(virtualize(SwipeableViews));
var _ = require('underscore');

_.mixin(require('../../lib/mixins'));

@observer
@inject("store")
class SwipeableRoutes extends Component {

  constructor(props) {
    super(props);
    this.store =  this.props.store.appState;
    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.onBackButtonEvent = this.onBackButtonEvent.bind(this);
    this.slideRenderer = this.slideRenderer.bind(this);
    this.fetchLink = this.fetchLink.bind(this);
  }

  fetchLink(index){
    let headersBackLink, context= this, name, key;
    if(context.store.activeTopic === "topicsList" && (index === (this.store[this.store.activeTopic].length-1) ) ) {
      return `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/all-categories?mode=pwa`
    }
    switch (context.store.activeTopic) {
      case "newspaperLanding":
        name = context.store[context.store.activeTopic][index] && context.store[context.store.activeTopic][index]["shortKey"]
        headersBackLink = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${encodeURIComponent(context.store.npName)}-epaper-${context.store.npKey}/${encodeURIComponent(name)}-updates-${name}?mode=pwa`
        break;

      case "generalizedTopics":
        name = context.store[context.store.activeTopic][index] && context.store[context.store.activeTopic][index]["nameEnglish"]
        key = context.store[context.store.activeTopic][index] && context.store[context.store.activeTopic][index]["key"]
        headersBackLink = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${encodeURIComponent(context.store.topicNm)}-topics-${context.store.topicKey}/${encodeURIComponent(name)}-subtopics-${key}?mode=pwa`
        break;

      default:
        name = context.store[context.store.activeTopic][index] && context.store[context.store.activeTopic][index]["nameEnglish"]
        headersBackLink = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${context.store.activeNav}?mode=pwa`
        break;
    }
    return headersBackLink;
  }

  handleIndexChange(index, type){
    if(this.store[this.store.activeTopic].length > index) {
      this.store.onNewspageSwipe(index);
      let url = this.fetchLink(index)
      this.props.history.replace(url);
      document.body.scrollTop = 0;
      this.store.displayHeaderImg();
    }
  };

  componentDidMount() {

  }

  componentDidUpdate(){
    let context = this;
    const {history} = this.props;
    if(this.store.missingUrlParam){
      let locationObj = location;
      let navToUrl = locationObj.pathname + '/'
      switch(context.store.activeTopic){
        case "generalizedTopics":
          navToUrl += `${encodeURIComponent(context.store.subtopicNm)}-subtopics-${context.store.activeNav}${locationObj.search}`
          break;

        case "newspaperLanding":
          navToUrl += `${encodeURIComponent(context.store.activeNav)}-updates-${context.store.activeNav}${locationObj.search}`;
          break;

        default:
          navToUrl += `${context.store.activeNav.toLowerCase()}${locationObj.search}`
          break;
      }
      context.store.clearData('missingUrlParam');
      history.replace(navToUrl);
    }

  }

  onBackButtonEvent(e){
  }

  slideRenderer(params){
    const {
      index,
      key,
    } = params;

    let name,
        shortkey,
        context = this,
        multipleListKey,
        dataLength = this.store[this.store.activeTopic] && this.store[this.store.activeTopic].length;
    switch (this.store.activeTopic){
      case "topicsList":
        name = "nameEnglish";
        shortkey = "nameEnglish";
        multipleListKey = "topicsList";
        break;
      case "newspaperLanding":
        name = "nameUni";
        shortkey="shortKey";
        multipleListKey = context.store.npKey || "newspaperLanding";
        break;
      case "generalizedTopics":
        name = "nameEnglish";
        shortkey="key";
        multipleListKey = context.store.topicKey || "generalizedTopics"
        break;
    }


    if(context.store.activeTopic === "topicsList" && (index === (dataLength-1))){
      return <div  key={key}><AllCategories key={key} {...this.props}/></div>
    }


    if((index >=  dataLength) || (index <= dataLength && this.store[this.store.activeTopic][index] && !this.store[this.store.activeTopic][index]["data"])){
      return  (
        <div key={key}>
          <LoadingGif {...this.props}/>
        </div>
      )
    }
    let selectedNavData = this.store[this.store.activeTopic] && this.store[this.store.activeTopic][index];
    if(!selectedNavData){
      return (<div key={key}><LoadingGif/></div>);
    }
    return (
      <div key={key}>
        <MultipleNewsListing topic={selectedNavData && selectedNavData[name] && selectedNavData[name].toLowerCase()}
                             topicShortKey={selectedNavData && selectedNavData[shortkey]}
                             listName={context.store.activeTopic}
                             key={(index === context.store.activeNavIndex) ? multipleListKey : (multipleListKey + Date.now())}
                             {...context.props}/>
      </div>
    )
  }

  render() {
    let isAllCatPage = (this.store.activeNav === "all-categories")
    if(isAllCatPage || this.props.data) {
      let matchedIndex = _.at(this, 'store.activeNavIndex')
      return (
        <VirtualizeSwipeableViews
          {...this.props}
          index={this.props.index}
          indexName={this.store.activeNav}
          onChangeIndex={this.handleIndexChange}
          slideRenderer={this.slideRenderer}
          overscanSlideBefore={ (matchedIndex === 0) ? matchedIndex : 1}
          overscanSlideAfter={matchedIndex === (this.store[this.store.activeTopic] && (this.store[this.store.activeTopic].length - 1)) ? 0 : 1}
        />
      );
    }
    else return (<div><LoadingGif/></div>);
  }
}
export default withRouter(SwipeableRoutes);
