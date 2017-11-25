import React, { Component } from "react";
import { Route, Link, Redirect, Switch ,withRouter} from "react-router-dom";
import { inject, observer } from "mobx-react";
import Home from './Home'
import NotFound from "./NotFound"
var cookies = require('js-cookie');
var _ = require('underscore');

_.mixin(require('../lib/mixins'));
@inject("store")
@observer
class App extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store;
  }

  componentDidMount() {
  }

  parseUrl(url){
    return {};
  }

  componentWillReceiveProps(props) {
    let previousUrl = _.at(this,'props.location.pathname') || window.document.referrer,
        previousUrlMeta = previousUrl && this.parseUrl(previousUrl);

    if(!_.at(window,'__dhpwa__.history')){
      window.__dhpwa__ = _.extend({},window.__dhpwa__ || {}, {history:{}});
    }
    window.__dhpwa__.history = {
      previous: previousUrl,
      present:_.at(this,'props.history.location.pathname'),
      referrerObj: {
        referrerUrl: previousUrl,
        referrer: previousUrlMeta.type,
        referrer_id: previousUrlMeta.id
      }
    }
  }

  render() {
    return (
      <div>
        {/*
         {isProduction ? <DevTools /> : null}
         */}
        <Switch>
          <Route
            exact
            path="/home"
            render={props => {
              return <Home {...props}/>}
            }
          />
          <Route
            exact
            path="/"
            render={props => {
              let lang = cookies.get('selectedLang') || "en"
              return <Redirect to={`/home`}/>
            }}
          />
          <Route
            path="*"
            component={NotFound}>
          </Route>
        </Switch>
      </div>
    );
  }
}
export default withRouter(App);
