/**
 * Created by pratheesh on 31/5/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
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
    return (
      <div className="sideWap" id="sideNav" style={{"display":context.store.animateShowMenu ? "block":"none"}}>
        <div className="sidenav">
        </div>
        <aside className={context.store.showMenu ? "sidelft2rht" :  "siderht2lft"}>
          <div>
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
              </li>
{/*
              <li> <a href="http://www.dailyhunt.in?mode=pwa"><p>{aboutText}</p></a></li>
*/}
              <li> <a href={deviceInfo.linksSmartBanner}><p>{""}</p></a></li>
            </ul>
          </div>
        </aside>
      </div>

    );
  }
}


