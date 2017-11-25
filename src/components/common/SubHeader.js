
import React from 'react';
import UIEffects from '../../lib/UIEffects';
import langMapping from '../../config/langMapping';
import { inject, observer } from "mobx-react";
import { withRouter, Link } from 'react-router-dom';
import { translateGetApp } from  '../../config/localizationMapping';


const queryString = require('query-string')
var _ = require('underscore');
var deviceInfo  = require('../../lib/deviceDetect');

_.mixin(require('../../lib/mixins'));
@inject("store")
@observer
class SubHeader extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
    this.listName = this.props.listName;
    this.topicsList =  this.topicsList.bind(this);
    this.newspaperLanding =  this.newspaperLanding.bind(this);
    this.newspaperLanding =  this.newspaperLanding.bind(this);
    this.generalizedTopics = this.generalizedTopics.bind(this);
    this.otherGenericLanding = this.otherGenericLanding.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }


  menuOnClick(navUrl){
    const {history} = this.props;
    history.replace(navUrl);
    this.store.openMenu();
  }

  componentDidUpdate() {
  }

  componentWillReceiveProps(nextProps) {
  }

  otherGenericLanding(backNavUrl, image, pageType){
    let context = this,
      query = window.location.search.split("?")[1],
      queryObject = query && queryString.parse(query),
      topicTitle = queryObject && queryObject["topicTitle"],
      checkLogo = image && image.indexOf("newlogos"),
      headerH2 = (pageType === "topicLanding" ?  (<h2>  {topicTitle}  </h2>) :  ""),
      bannerClass = (pageType === "topicLanding" ? "tp_landing" : "np_landing"),
      logoClass = ((pageType === "newspaperLanding") ? ((checkLogo !== -1) ? "np_logo" : "hd_img" ) : "hd_img");
    image = image && image;
    let imgContent = image && (
      <picture>
        <img src={image} alt=""/>
      </picture>);
    return (
      <div>
        <header className="defult">
          <div className="lhs">
            {headerH2}
            <div className="action">
              <div className="btn_bk" onClick={(e)=>{this.store.backToTop(),context.props.history.goBack()}}>
              </div>
            </div>
          </div>
        </header>
        <div className={bannerClass}>
          <div className={logoClass}>
            {imgContent}
          </div>
        </div>
      </div>
    )
  }

  topicsList(){
    let context = this;
    let getAppText = translateGetApp[context.store.selectedLang] || "Get App";
    let sessionValue = sessionStorage.getItem('homePageBannerVisit');
    return (
      <div className="siteNav" id="menuNlogo">
        <ul className="LHS">
          <li onClick={context.menuOnClick.bind(context,`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/navigation-menu?mode=pwa`)}>
            <div className="m_sprite thumb_nav">
              Menu
            </div>
          </li>
          <li><div className="dh_logo"></div></li>
        </ul>
        <ul className="RHS">
          {(sessionValue && (sessionValue === '2'))?
          <li id ="getApp" style={{"display":"block"}}><a href={deviceInfo.linksGetApp} className="btn_dn_arrow"><span>{getAppText}</span></a></li>
          :
          <li id ="getApp" style={{"display":"none"}}><a href={deviceInfo.linksGetApp} className="btn_dn_arrow"><span>{getAppText}</span></a></li>
        }
        </ul>
      </div>
    )
  }

  newspaperLanding(){
    let context = this;
    let generalUrl = `/news/india/english/headlines`
    let bckurl = context.store.npGroupCatKey ? ( `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${context.store.npGroupCatName}-updates-${context.store.npGroupCatKey}`)
                     :generalUrl
    let backNavUrl = bckurl;
    let bannerImg =  _.at(context,'store.newspaperLanding.0.imageUrl') && context.store.newspaperLanding[0].imageUrl.replace("http://", "https://");
    return this.otherGenericLanding(backNavUrl, bannerImg, "newspaperLanding");
  }

  generalizedTopics(){
    let context = this;
    let generalUrl =  `/news/india/english/headlines`;
    let bckurl = context.store.selectedCountry && context.store.selectedLang ? (`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/all-topics`)
                               : generalUrl
    let backNavUrl = this.store.previousUrlStack || bckurl
    let firstData =   this.store[this.store.activeTopic] && this.store[this.store.activeTopic][0];
    return this.otherGenericLanding(backNavUrl, firstData && firstData["bannerImageUrl"], "topicLanding");
  }

  render() {
    if(this.store.activeTopic && this[this.store.activeTopic]){
      return this[this.store.activeTopic]();
    }
    return (<div></div>)
  }
}
export default withRouter(SubHeader);
