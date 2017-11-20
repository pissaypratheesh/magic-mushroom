import React, { Component } from "react";
import { Route, Link, Redirect, Switch } from "react-router-dom";
import { inject, observer } from "mobx-react";
import HomePage from './HomePage'
import NotFound from "./NotFound"
var _ = require('underscore');

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
