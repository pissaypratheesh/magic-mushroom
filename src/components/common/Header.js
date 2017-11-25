import React from 'react';
import UIEffects from '../../lib/UIEffects';
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


  render() {
    let context = this;
    return (
      <div>
      </div>);
  }
}
export default withRouter(Header);
