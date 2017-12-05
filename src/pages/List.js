import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
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
        <header className="home-hd">
          <div className="aausadh-logo"></div>
          <div className="login"></div>
        </header>

        <MultipleCardListing {...this.props}/>

        <footer>
          <div className="social">
            <ul>
              <li><a href="" className="icn_fb"></a></li>
              <li><a href="" className="icn_twitte"></a></li>
              <li><a href="" className="icn_youtube"></a></li>
            </ul>
          </div>
          <p>Copyright &copy; 2017 aausadh.com | All Rights Reserved</p>
        </footer>
      </div>
    )
  }
}

export default Home;
