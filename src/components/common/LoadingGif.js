/**
 * Created by pratheesh on 17/5/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";

var _ = require('underscore');

@inject("store")
@observer

class LoadingGif extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
  }

  reloadPage(){
    location.reload();
  }

  render() {
    let isOnline = this.store.isOnline;
    return isOnline && isOnline === true ? (
        <div className="dot-loader">
          <div className="dot-loader-inner">
            <label>	● </label>
            <label>	● </label>
            <label>	● </label>
            <label>	● </label>
          </div>
          <p>Loading...</p>
        </div>
      ): ( <div className="sticky grySticky" id="refershBar">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p id="refreshMsg" onClick={this.reloadPage.bind(this)}>Please refresh the page!</p>
                </td>
                <td class="close">
                  <div id="closeBtn" class="closeBtn"></div>
                </td>
              </tr>
            </table>
          </div>
         )
    }
}

export default LoadingGif;
