/*
 * Created by pratheesh.pm on 18/05/17.
 */
import React from 'react';
import UIEffects from '../../lib/UIEffects';
import SmartBanner from './SmartBanner'
import langMapping from '../../config/langMapping';
import { translateNewspaper, translateChooseLang, translateBrowseFurther, translateClickHere } from '../../config/localizationMapping';
import SubHeader from "./SubHeader";
import { inject, observer } from "mobx-react";
import {withRouter,  Link } from 'react-router-dom'
var cookie = require('js-cookie');
var _ = require('underscore');
var deviceInfo  = require('../../lib/deviceDetect')
var appendQuery = require('append-query')

_.mixin(require('../../lib/mixins'));

@inject("store")
@observer
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
    this.listName = this.props.listName;
    this.browseFutherLink = {};
    this.topicsOnClick = this.topicsOnClick.bind(this);
    this.allTopicsHtml = this.allTopicsHtml.bind(this);
    this.scrollableHtml = this.scrollableHtml.bind(this);
    this.closeLangBar = this.closeLangBar.bind(this);
    this.updateUrlStack = this.updateUrlStack.bind(this);
  }

  updateUrlStack(to){
    const {history} =  this.props;
    this.store.updateUrlStack(window.location.pathname);
    history.push(to);
    this.store.displayHeaderImg();
  }

  closeLangBar(e){
    document.getElementById('orangSticky').className += " lang_close";
    //document.getElementById('orangSticky').style.display='none';
    cookie.set('langNav', 'close', { expires: 30 });

  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidUpdate() {
    function navScroll () {
      let activeLink = document.querySelector("div.active");
      if(activeLink){
        let scrollElement = document.querySelectorAll("ul.lhs")[0];
        if (scrollElement){
          scrollElement.scrollLeft = activeLink.parentNode.offsetLeft - scrollElement.offsetWidth/2;
        }
      }
    }
    setTimeout(navScroll, 100);
  }

  componentWillReceiveProps(nextProps) {
  }

  topicsOnClick(navUrl, nav, index){
    const {history} = this.props;
    this.store.displayHeaderImg();
    this.store.changeActiveNav(nav,index);
    history.replace(navUrl);
    document.body.scrollTop = 0;
  }

  scrollableHtml(listName){
    let context = this;
    return context.store[listName] && (context.store[listName].map(function (item, itr) {
      let topicName, navUrl, shortKey;
      switch (listName){
        case "topicsList":
          topicName  = item.name && item.name.toLowerCase();
          topicName = topicName && ( topicName === "all-categories") ? (translateNewspaper[context.store.selectedLang]|| "newspapers") : topicName;
          shortKey = item.nameEnglish && item.nameEnglish.toLowerCase();
          navUrl = appendQuery(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${shortKey && shortKey.toLowerCase()}`,{mode:'pwa'});
          item.entityKey && (context.browseFutherLink[shortKey] = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${(shortKey.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-"))}-topics-${item.entityKey}/${(shortKey.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-"))}-subtopics-${item.entityKey}?topicTitle=${topicName}`);
          break;
        case "newspaperLanding":
          topicName  = item.nameUni && item.nameUni.toLowerCase();
          shortKey = item.shortKey && item.shortKey.toLowerCase()
          navUrl = appendQuery(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${(context.store.npName)}-epaper-${context.store.npKey}/${(item.nameUni)}-updates-${item.shortKey&&item.shortKey.toLowerCase()}`,{mode:'pwa'});
          break;

          case "generalizedTopics":
            topicName  = item.languageNameMapping && item.languageNameMapping[context.store.selectedLang].toLowerCase();
            shortKey = item.key
            navUrl = appendQuery(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${(context.store[listName][0].nameEnglish).replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-")}-topics-${context.store.topicKey}/${(item.nameEnglish).replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-").toLowerCase()}-subtopics-${item.key}?topicTitle=${topicName}`,{mode:'pwa'});
            break;
        }
        return (
          <li key={itr} onClick={(event) => { UIEffects.addRippleEffect(event); context.topicsOnClick(navUrl, topicName, item.index)}}>
            <div className={((shortKey && shortKey.toLowerCase()) === (context.store.activeNav && context.store.activeNav.toLowerCase())) ? "active":""}>
              {topicName}
            </div>
          </li>
        )
      }))
  }


  allTopicsHtml(){
    let context = this;
    return (
      <div className="rhs">
        <div className="btnMore" onClick={(e)=>{context.props.history.push(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/all-topics?mode=pwa`)}}>
          More
        </div>
      </div>
    )
  }

  render() {
    let context = this;
    let listName =  this.store.activeTopic;
    let allTopics = this.allTopicsHtml();
    let scrollableData = this.scrollableHtml(listName);
    let chooseLang = translateChooseLang[context.store.selectedLang] || "Choose your language";
    let browseFurtherText = translateBrowseFurther[context.store.selectedLang] || "Browse further";
    let clickHereText = translateClickHere[context.store.selectedLang] || "Click here";
    return (
      <div>
      <header id="header">
        <div style={{display:'none'}} dangerouslySetInnerHTML={{__html:(deviceInfo.fontCall(context.store.selectedLang))}}></div>
        <SubHeader/>
        <nav id="scrollNav">
          <ul className="lhs" style={listName === "topicsList" ? {} : {width:"95%"}}>
            {context.store[listName] && scrollableData}
          </ul>
          {context.store.activeTopic === "topicsList" && allTopics}
        </nav>
        {
          ((context.store.activeTopic === "topicsList") && (context.store.activeNavIndex === 0)&& !cookie.get('langNav'))?(
            <div id="orangSticky" className="sticky orangSticky onCloseAnimate">
              <table border="0" cellpadding="0" cellspacing="0">
                <tbody><tr>
                  <td>
                    <div onClick={(e)=>{context.props.history.replace(`/news/${this.store.selectedCountry}/${langMapping[this.store.selectedLang]}/country-language-menu?mode=pwa`)}}
                          className="langIcn">
                      {chooseLang}
                    </div>
                  </td>
                  <td className="close" onClick={this.closeLangBar}>
                    <div className="closeBtn"></div>
                  </td>
                </tr>
                </tbody></table>
            </div>
          ):null
        }

        {
          ( (context.store.activeNavIndex !== 0)&& this.store.activeNav!="all-categories" && this.store.activeTopic==="topicsList")?(
            <div className="sticky browseF onCloseAnimate" id="browseF">
              <table border="0" cellpadding="0" cellspacing="0">
                <tbody>
                <tr>
                  <td className="click">
                    <a className="arrowIcn" onClick={context.updateUrlStack.bind(context, context.browseFutherLink[context.store.activeNav]) || "/news/india/english/headlines?mode=pwa"}><em>{browseFurtherText}</em><span>{clickHereText}</span></a>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          ):null
        }
      </header>
        <SmartBanner/>
      </div>);
  }
}
export default withRouter(Header);
