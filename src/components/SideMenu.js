/**
 * Created by pratheesh on 31/5/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
import langMapping from '../config/langMapping';
import { translateBuzz, translateLang, translateAbout, translateDownload, translateEbooks } from '../config/localizationMapping';
import { Link } from 'react-router-dom'

var _ = require('underscore');
_.mixin(require('../lib/mixins'));
var deviceInfo  = require('../lib/deviceDetect');
var appendQuery = require('append-query')

@inject("store")
@observer
export default class SideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.store =  this.props.store.appState;
    this.onMenuClose = this.onMenuClose.bind(this)
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  componentDidUpdate() {
  }

  componentWillReceiveProps(nextProps) {

  }

  onMenuClose(navUrl,forceClose, openPage){
    const {history} = this.props;
    this.store.closeMenu(forceClose,openPage)
    history.replace(navUrl);
  }


  render() {
    let context = this;
    let navigateTo = context.store.activeNav ? `/${context.store.activeNav}` : "";
    let buzzText = translateBuzz[context.store.selectedLang] || "Buzz";
    let ebooksText = translateEbooks[context.store.selectedLang] || "Ebooks";
    let languageText = translateLang[context.store.selectedLang] || "Language";
    let aboutText = translateAbout[context.store.selectedLang] || "About";
    let downloadText = translateDownload[context.store.selectedLang] || "Download App";
    return (
      <div className="sideWap" id="sideNav" style={{"display":context.store.animateShowMenu ? "block":"none"}}>
        <div className="sidenav">
        </div>
        <aside className={context.store.showMenu ? "sidelft2rht" :  "siderht2lft"}>
          <div>
            <div class="FR" onClick={context.onMenuClose.bind(context,appendQuery(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}${navigateTo}`,{mode:'pwa'}))}>
              <div className="btn_close FR">
              </div>
            </div>
            <br className="CL"/>
          </div>
          <div className="login">
            <div className="dh_logo2"></div>
            {/*
             <div className="btn">
             <a href="javaScript:void(0);" className="btn_sign">Sign In</a>
             </div>
             */}
          </div>
          <div className="subnav">
            <ul>
{/*           <li> <a className="icn_buzz" href="https://m.dailyhunt.in/buzz/"><p>{buzzText}</p></a></li>

              <li> <a className="icn_ebooks" href="http://m.dailyhunt.in/Ebooks/?redirect=1"><p>{ebooksText}</p></a></li>
*/}
{/*              <li> <Link className="icn_setting" to={`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/country-language-menu`}><p>Settings</p></Link></li>*/}
              <li>
                <div onClick={(e)=>{ context.props.history.replace(`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/country-language-menu?mode=pwa`)}} >
                  <p>{languageText}</p>
                </div>
              </li>
{/*
              <li> <a href="http://www.dailyhunt.in?mode=pwa"><p>{aboutText}</p></a></li>
*/}
              <li> <a href={deviceInfo.linksSmartBanner}><p>{downloadText}</p></a></li>
            </ul>
          </div>
        </aside>
      </div>

    );
  }
}


