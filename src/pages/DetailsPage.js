/**
 * Created by pratheesh on 25/5/17.
 */
import React from 'react';
import LoadingGif from '../components/common/LoadingGif';
import DetailsShimmer from '../components/common/DetailsShimmer';
import {withRouter} from "react-router-dom";
import DataWrapper from "../components/common/DataWrapper";
import { Link } from 'react-router-dom'
import langMapping from '../config/langMapping';
import { inject, observer } from "mobx-react";
import Details from "./Details";
import SwipeableRoutes from "../components/common/SwipeableRoutes";
import { translateGetApp } from  '../config/localizationMapping';
import SmartBanner from '../components/common/SmartBanner';
const queryString = require('query-string');

var deviceInfo  = require('../lib/deviceDetect');
var _ = require('underscore');
var moment = require('moment');

_.mixin(require('../lib/mixins'));


@inject("store")
@DataWrapper
@observer
class DetailsPage extends React.Component {

    constructor(props) {
        super(props);
        this.store =  _.at(this,'props.store.appState');
        this.backFromRelatedDetails = this.backFromRelatedDetails.bind(this);
        this.getIdFrmUrl = this.getIdFrmUrl.bind(this);
        this.onBackButtonEvent = this.onBackButtonEvent.bind(this);
        this.fetchBackLink = this.fetchBackLink.bind(this);
        this.directLanding = false;
    }

    getIdFrmUrl(){
      let currentUrl = window.location.href,
        substr = currentUrl.split('newsid-')[1];
      return substr ? substr.split('?')[0] : "";

    }

    onBackButtonEvent(e){
      this.store.timespentCalculator('details',{id:this.getIdFrmUrl() || _.at(this,'store.viewRelatedDetails.id') || this.store.selectedIdDetails.id},'stop','onBackButtonEvent of dtailsPage');
      this.store.viewRelatedDetails && (console.log("viewRelatedDetails--->",this.store.viewRelatedDetails))
      const {history} = this.props;
      let context = this;
      e && e.preventDefault();
      if(this.store.viewRelatedDetails){
        this.store.clearRelatedDetails()
        this.store.selectedIdDetails && (this.store.topics ? history.replace(this.store.selectedIdDetails.detailsPageUrl) : history.push(this.store.selectedIdDetails.detailsPageUrl))
      }
      /*if(this.store.directDetailsLanding){
        let selIdDet = context.store.selectedIdDetails;
        this.store.clearData(["topicsList","directDetailsLanding"]);
        history.push(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}?selId=${selIdDet && selIdDet.id}&selIndex=${Number(selIdDet && selIdDet.index)-1}`)
      }*/
    }

    fetchBackLink(listName){
      let headersBackLink, context= this;
      if( !_.isUndefined(this.store.viewRelatedDetails)){
        headersBackLink = _.at(this,'store.selectedIdDetails.detailsPageUrl');
      }

      if(!headersBackLink && listName) {
        switch (listName) {
          case "generalizedTopics":
            headersBackLink = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${encodeURIComponent(context.store.topicNm)}-topics-${context.store.topicKey}/${encodeURIComponent(context.store.subtopicNm)}-subtopics-${context.store.activeNav}`
            break;

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

    backFromRelatedDetails(){
      this.store.timespentCalculator('details',{id:this.getIdFrmUrl()},'stop','backFromRelatedDetails detailspage');
      const {history} = this.props;
      let context = this;
      if(this.store.viewRelatedDetails){
        this.store.clearRelatedDetails();
        this.store.selectedIdDetails && (this.store.topics ? history.goBack() : history.replace(this.store.selectedIdDetails.detailsPageUrl));
      } else {
        if(this.store.directDetailsLanding){
          let selIdDet = context.store.selectedIdDetails;
          this.store.clearData(["topicsList","directDetailsLanding"]);
          history.push(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}?selId=${selIdDet && selIdDet.id}&selIndex=${Number(selIdDet && selIdDet.index)-1}`)
          return;
        }
        history.goBack();
      }
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    componentDidMount() {
      let context = this;
      let query = window.location.search.split("?");
      let queryList = query && query[1] && queryString.parse(query[1])
      let listName = _.at(queryList,'listname')
      if(listName && (listName !== this.store.activeTopic)){
        this.store.changeActiveTopic(listName)
      }
      window.onpopstate = this.onBackButtonEvent;
    }

    componentWillReceiveProps(nextProps) {
    }

    render() {
      let context = this;
      let query = window.location.search.split("?");
      let queryList = query && query[1] && queryString.parse(query[1])
      let listName = _.at(this,'store.selectedIdDetails.activeTopic') || (_.at(queryList,'listname') ? _.at(queryList,'listname') : this.store.activeTopic);
      let activeNavIndex = _.isUndefined(_.at(this,'store.selectedIdDetails.activeNavIndex')) ? (_.at(queryList,'topicIndex') ? Number(_.at(queryList,'topicIndex')) : this.store.activeNavIndex) : _.at(this,'store.selectedIdDetails.activeNavIndex');
      let selectedNavData = this.store[listName] && this.store[listName][activeNavIndex],
          data = selectedNavData && _.at(selectedNavData,'data.data.rows');
      let renderingData = data ? data : _.at(this,'store.selectedIdDetails');
      let headersBackLink = this.fetchBackLink(listName);
      if(!headersBackLink){
        return (<div></div>)
      }

      let getAppText = translateGetApp[context.store.selectedLang] || "Get App";
      let sessionValue = sessionStorage.getItem('homePageBannerVisit');
      let header = (
        <div>
          <header className="dtls" style={{position:"inherit"}}>
            <div className="details_hd">
              <div className="lhs">
                  <div className="action" onClick={context.backFromRelatedDetails.bind(context)}>
                    <div className="m_sprite btn_bk">menu</div>
                  </div>
              </div>
              <ul className="rhs">
                {(sessionValue && (sessionValue === '2'))?
                <li id ="getApp" style={{"display":"block"}}><a href={deviceInfo.linksGetApp} className="btn_dn_arrow"><span>{getAppText}</span></a></li>
              :
                <li id ="getApp" style={{"display":"none"}}><a href={deviceInfo.linksGetApp} className="btn_dn_arrow"><span>{getAppText}</span></a></li>
              }
              </ul>
            </div>
          </header>
        </div>
      );

      if(this.store.viewRelatedDetails){
        return (
          <div className={`lang_${context.store.selectedLang}`}>
            {header}
            <Details ignoreRelated={true} key={_.at(this,'store.viewRelatedDetails.id') || "relatedData"}/>
          </div>
        )
      }

        return (
        <div className={`lang_${context.store.selectedLang}`}>
          {header}
          {data ?
            (<SwipeableRoutes listName={listName} queryList={queryList} {...context.props}>
          </SwipeableRoutes>) : <DetailsShimmer/> }
          <SmartBanner />
        </div>)
    }
}

export default withRouter(DetailsPage);
