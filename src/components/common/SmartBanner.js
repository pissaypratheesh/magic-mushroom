/**
 * Created by pratheesh on 17/5/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
var deviceInfo  = require('../../lib/deviceDetect');

@inject("store")
@observer

class SmartBanner extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
    this.onClickClose =  this.onClickClose.bind(this);
  }

  onClickClose(e){
      let smt_tp_bnrClass = document.getElementsByClassName("smt_bnr_stic"),
      smt_tp_bnr = smt_tp_bnrClass && smt_tp_bnrClass[0],
      getAppId = document.getElementById("getApp");
      if(smt_tp_bnr){
        smt_tp_bnr.style.display = "none";
        smt_tp_bnr.classList.remove("smt_bnr_stic");
        sessionStorage.setItem('homePageBannerVisit', '2');
        if(getAppId) {
          getAppId.style.display = "block";
        }
      }
    }

  render() {
    let sessionValue = sessionStorage.getItem('homePageBannerVisit');
    if(sessionValue === null){
      sessionStorage.setItem('homePageBannerVisit', '1');
    }
    return (sessionValue === '1') ?(
      <div className="smt_bnr_stic">
        <div className="inr">
          <div onClick={()=>{this.onClickClose()}} className="btn_close"></div>
          <a href={deviceInfo.linksSmartBanner} className="app_dnld">
            <table>
              <tr>
                <td className="dh_logo_wrp">
                  <div className="logo_150917"></div>
                </td>
                <td className="hd_txt">
                  <h2>Install Dailyhunt</h2>
                  <span>India's No 1 News &amp; Video App </span>
                  <em>#NewsKaDailyDose</em>
                </td>
              </tr>
            </table>
          </a>
        </div>
      </div>
    ):(<div></div>);
  }
}

export default SmartBanner;
