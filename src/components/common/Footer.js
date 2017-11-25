/**
 * Created by tishya on 1/8/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
import {  Link } from 'react-router-dom'

var _ = require('underscore');

_.mixin(require('../../lib/mixins'));
@inject("store")
@observer

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
  }

  render() {
    let context = this;
    return (
      <footer>
        <ul className="ftNav">
          <li>
            <Link to={`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/all-categories?mode=pwa`}><em></em>Newspapers</Link>
          </li>
          <li>
            <Link to={`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/country-language-menu?mode=pwa`}><em></em>Change Language</Link>
          </li>
          <li>
            <Link to={`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/all-topics?mode=pwa`}><em></em>Browse by Topic</Link>
          </li>
          <li>
            <a href="http://www.dailyhunt.in/privacy.php"><em></em>Privacy Policy</a>
          </li>
        </ul>
        <div className="TAC">&copy; Dailyhunt 2017</div>
      </footer>
    )
  }
}
export default Footer;
