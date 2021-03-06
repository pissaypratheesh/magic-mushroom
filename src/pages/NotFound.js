/**
 * Created by tishya on 27/7/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
import {  Link } from 'react-router-dom'

var _ = require('underscore');

_.mixin(require('../lib/mixins'));
@inject("store")
@observer

class NotFound extends React.Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
  }

  render() {
    let context = this;
    let notFoundText = translateNotFound[context.store.selectedLang] || "It looks like you are lost";
    let notFoundAnotherText = translateNotFoundAnother[context.store.selectedLang] || "The page you are looking no longer exists";
    return (
      <div className={`lang_${context.store.selectedLang}`}>
        <header className="defult">
          <div className="lhs">
            <div className="action">
            </div>
          </div>
        </header>
        <div className="errorMain">
          <div>
            <img src="/assets/img/404-error.jpg" alt=""/>
          </div>
          <h2>{notFoundText}</h2>
          <p>{notFoundAnotherText}</p>
        </div>
      </div>
    )
  }
}
export default NotFound;
