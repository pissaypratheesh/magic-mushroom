/**
 * Created by pratheesh on 17/5/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";

@inject("store")
@observer

class DetailsShimmer extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
  }

  render() {
    return (
      <div id="shimmerDetail" style={{"display":"none"}}>
        <header className="dtls" style={{"position": "inherit !important"}}>
          <div className="details_hd">
            <div className="lhs">
              <div className="action">
                <div className="m_sprite btn_bk">menu</div>
              </div>
            </div>
          </div>
        </header>
        <div id="details" className="detailsWarp" style={{"paddingTop":0}}>
          <div style={{"height":"230px"}} className="aniBg"></div>
          <div className="infoBar">
            <div className="srcShare">
              <div className="src">
                <picture className="logo aniBg" style={{"height":"30px","width":"30px"}}></picture>
                <div className="info">
                  <span className="aniBg" style={{"height":"8px", "width":"250px", "marginTop":"3px"}}></span>
                  <em className="aniBg" style={{"height":"8px","width":"100px","marginTop":"6px"}}></em>
                </div>
              </div>
            </div>
          </div>

          <article>
            <section className="details_shaimr">
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg"></div>
              <div className="aniBg" style={{"width":"80%"}}></div>
            </section>
          </article>
        </div>
      </div>
    )
  }
}

export default DetailsShimmer;
