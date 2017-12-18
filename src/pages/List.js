import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {withRouter} from "react-router-dom";
import { Link } from 'react-router-dom'
import PropTypes from "prop-types";
import DataWrapper from "../components/common/DataWrapper";
import { inject, observer } from "mobx-react";
import { toJS } from "mobx"
import MultipleCardListing from '../components/common/MultipleCardListing'
var _ = require('underscore');
_.mixin(require('../lib/mixins'));

@inject("store")
@DataWrapper
@observer
class Home extends React.Component {
  static contextTypes = {
    router: PropTypes.shape({
      route: PropTypes.object.isRequired
    }).isRequired
  };
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
  }

  componentDidMount(){
  }

  componentWillUpdate(){

  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    let context = this;
    return (
      <div>
        <header className="others-hd">
          <div className="btn_bk" onClick={(e)=>{ const {history} = context.props; history.goBack();}}></div>
          <h1>Eye Doctor (205)</h1>
        </header>

        <MultipleCardListing {...this.props}/>

        <section className="srt_filter">
          <div className="btn_srt">
            <span className="icn_srt"><em>Sort</em></span>
          </div>
          <div className="btn_filter">
            <span className="icn_filter"><em>Filter</em></span>
          </div>
        </section>

      </div>
    )
  }
}

export default withRouter(Home);
