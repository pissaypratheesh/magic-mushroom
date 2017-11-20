/**
 * Created by pratheesh on 1/6/17.
 */
import React, { Component } from "react";
import {withRouter} from "react-router-dom";
import LoadingGif from './common/LoadingGif'
import { inject, observer } from "mobx-react";
import {  Link, Redirect} from "react-router-dom";
import DataWrapper from "./common/DataWrapper";
import langMapping from '../config/langMapping';
import { translateChooseLang } from '../config/localizationMapping';

var _ = require('underscore');
_.mixin(require('../lib/mixins'));
var appendQuery = require('append-query');
var deviceInfo  = require('../lib/deviceDetect');

@inject("store")
@DataWrapper
@observer
class Languages extends Component {

    constructor(props) {
        super(props);
        this.store =  this.props.store.appState;
        this.onClickLang = this.onClickLang.bind(this);
        this.onBackButtonEvent = this.onBackButtonEvent.bind(this);
        this.onCloseLangPage = this.onCloseLangPage.bind(this);
    }

    componentDidMount() {
      window.onpopstate = this.onBackButtonEvent;
      window.scrollTo(0,0);
    }

    componentWillUnmount() {
    }

    componentDidUpdate() {
    }

    componentWillReceiveProps(nextProps) {
    }


    onBackButtonEvent(e){
      let context = this;
      let navigateTo = context.store.activeNav ? `/${context.store.activeNav.toLowerCase()}` : ""
      let url = appendQuery(`/news/${this.store.selectedCountry}/${langMapping[this.store.selectedLang]}${navigateTo}`,{mode:'pwa'})
      this.props.history.replace(url);
      e && e.preventDefault();
    }

    onCloseLangPage(){
      let context = this;
      let navigateTo = context.store.activeNav ? `/${context.store.activeNav}` : ""
      let url = appendQuery(`/news/${this.store.selectedCountry}/${langMapping[this.store.selectedLang]}${navigateTo}`,{mode:'pwa'})
      this.props.history.replace(url);
    }

    onClickLang(code){
      const {history} = this.props;
      let context = this,
          isAllCatPage = (context.store.activeNav === "all-categories?mode=pwa"),
          url = `/news/${context.store.selectedCountry}/${langMapping[code] + ( isAllCatPage ? "/all-categories" : "")}?ignoreInit=true&mode=pwa`;
      this.store.onLangSelect(code,isAllCatPage)
      history.replace(url);
    }

    render() {
      let context = this;
      let supportedLanguages = _.at(context,'store.supportedLanguages');
      let chooseLang = translateChooseLang[context.store.selectedLang] || "Choose your language";

      let langLi = supportedLanguages && _.map(supportedLanguages,function (la) {
          return (
                <li className={(context.store.selectedLang === la.code)?"active":""}
                    onClick={context.onClickLang.bind(this,la.code)}
                    key={la.code}>
                  <a className={`lang_${la.code}`}>
                    <span>{la.lang}</span>
                  </a>
                </li>
            )
        })

        return (
          <div>
            <div className="sticky defaultSticky onCloseAnimate" id="lan_stk">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div dangerouslySetInnerHTML={{__html:(deviceInfo.fontCall(this.store.selectedLang))}}></div>
                    <div className={`lang_${context.store.selectedLang}`+" langIcnBlk"}>{chooseLang}</div>
                  </td>
                  <td className="closeBlk" onClick={this.onCloseLangPage.bind(this)}>
                    <div className="closeBtn"></div>
                  </td>
                </tr>
              </table>
            </div>
            <div className="edition">
              <div className="inr">
                <ul className="lang_lst">
                  {langLi ? langLi : <LoadingGif/>}
                </ul>
              </div>
            </div>
          </div>
        );
    }
}


export default withRouter(Languages);
