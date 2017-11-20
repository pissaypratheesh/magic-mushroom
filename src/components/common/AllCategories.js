/**
 * Created by tishya on 6/6/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
import UIEffects from '../../lib/UIEffects';
import LoadingGif from './LoadingGif'
import CategoryList from "./CategoryList";
import {CtoSTimeout, callRetries} from '../../config/constants'
import langMapping from '../../config/langMapping';
import langMappingUni from '../../config/langMappingUni';
import { translateBrowse, translateChangeLang } from '../../config/localizationMapping';
import axios from "axios";
import axiosRetry from 'axios-retry';
axiosRetry(axios, { retries: callRetries });
import {  Link } from 'react-router-dom'
import {makeRequest} from '../../lib/makeRequest'

var _ = require('underscore');
_.mixin(require('../../lib/mixins'));
var deviceInfo  = require('../../lib/deviceDetect');
var appendQuery = require('append-query')

@inject("store")
@observer
class AllCategories extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
    this.onLangSelected = this.onLangSelected.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollPosition = 0;
  }

  onLangSelected(lang, onLoad){
    let context = this;
    let url = "/apis/allgroups?langCode=" + (lang || "en");
    url += "&mode=pwa";
    makeRequest({ urlList:[{url:url,timeout:CtoSTimeout,method:'get'}],source:'client',store:context.store},function (err,resp) {
      if(err){
        return UIEffects.showServerError(err);
      }
      let catData = _.at(resp,'0.data.finalArr');
      if(catData) {
        context.store.updateCatNLang(catData,lang)
      }
    })
  }

  handleScroll() {
    let header = document.getElementById("header");
    if(header) {
      if (document.body.scrollTop >= 41) {
        header.classList.add("fixup");
        header.classList.remove("fixdn");
        return;
      }
      if(document.body.scrollTop <= 40) {
        let upClass = document.getElementsByClassName("fixup"),
        fixup = upClass && upClass[0];
        header.classList.remove("fixup");
        fixup && header.classList.add("fixdn");
      }
      document.body.scrollTop <= 5 && header.classList.remove("fixdn");
    }
  }

  componentDidMount() {
    window.scrollTo(0,0)
    window.addEventListener("scroll", this.handleScroll, this.store.isPassiveSupported ? { passive: true } : false );
    !this.store.allCategories && this.onLangSelected(this.store.selectedLang);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  componentDidUpdate() {
  }

  componentWillReceiveProps(){

  }

  render(){

    let context = this;
    let groups = this.store.allCategories,
        count = -1;
    let colorArr = ["#A46DB0", "#58B6F1", "#E86677", "#F17958", "#8BC64A", "#50D3AC", "#50D3AC"];
    let browseText = translateBrowse[context.store.selectedLang] || "Browse Categories";
    let changeLangText = translateChangeLang[context.store.selectedLang] || "Change Language";
    return (
      <div className="categoryWrp" id="scrollDiv">
        <div className="hd">
          <div className="inr">
            <h2>{browseText}</h2>
            <div className="lang_ddl">
              <Link className="btn_bk" to={`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/country-language-menu?mode=pwa`}>
              {changeLangText}
              </Link>
            </div>
          </div>
        </div>

        <div className="catList">
          <ul>
            {groups ? (groups).map(function(item, itr){
              if(item) {
                let firstChar = item && item.name.charAt(0),
                    routeUrl = appendQuery('/news/' + context.store.selectedCountry + '/' + langMapping[context.store.selectedLang] + '/' + item.name.toLowerCase() + '-updates-' + item.groupKey,{mode:'pwa'});
                    count = (count >= 5 ? 0 : count + 1);

                return (
                  <CategoryList navUrl={routeUrl}
                                itemFirstChar={firstChar}
                                key={itr}
                                itemColor={colorArr[count]}
                                itemName={item && item.name}/>
                )
              }
            }) : <LoadingGif/>}
          </ul>
        </div>

      </div>
    );
  }
}

export default AllCategories;
