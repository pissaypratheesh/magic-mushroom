import React, { Component } from "react";
import { Route, Link, Redirect, Switch } from "react-router-dom";
import { inject, observer } from "mobx-react";
import LazyRoute from "lazy-route";
import DevTools from "mobx-react-devtools";
import { isProduction } from "../config/constants";
import langMapping from '../config/langMapping';
import DetailsPage from './DetailsPage'
import HomePage from './HomePage'
import Languages from "../components/Languages"
import NotFound from "./NotFound"
var cookies = require('js-cookie');
var _ = require('underscore');
import { gaParmams,logPageView } from "../lib/gaParamsExtractor";

_.mixin(require('../lib/mixins'));
@inject("store")
@observer
export default class App extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store;
  }
  componentDidMount() {
    this.authenticate();
  }
  authenticate(e) {
    if (e) e.preventDefault();
    this.store.appState.authenticate();
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
            render={(props)=>{
              return <HomePage {...props}/>}
            }
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
