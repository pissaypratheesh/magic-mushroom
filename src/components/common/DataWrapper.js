import React, { Component } from "react";
import { inject, observer } from "mobx-react";

const queryString = require('query-string')
var _ = require('underscore');
_.mixin(require('../../lib/mixins'));

export default function DataWrapper(Component) {

 	@inject("store")
	@observer
	class DataFetcher extends Component {
		constructor(props) {
			super(props);
			this.store = this.props.store.appState;
		}

		componentDidMount() {
      let url = _.at(this,'props.location.pathname');
      let pattern = _.at(this,'props.match.path');
      let params = _.at(this,'props.match.params');
      let query = _.at(this,'props.location.search');
      query && (params.query = queryString.parse(query.split("?")[1]));
      if(url && pattern && params) {
        this.store.fetchData(url, pattern, params);
      }
 		}

		componentWillUnmount() {
			this.store.clearItems();
		}

    componentWillReceiveProps(nextProps,prevProps){

      if(nextProps){
        let url = _.at(nextProps,'location.pathname');
        let pattern = _.at(nextProps,'match.path');
        let params = _.at(nextProps,'match.params');
        let query = _.at(nextProps,'location.search');
        query && (params.query = queryString.parse(query.split("?")[1]));
        if(url && pattern && params) {
          this.store.fetchData(url, pattern, params);
        }
      }
    }

		render() {
			return <Component {...this.props} />;
		}
	}
	return DataFetcher;
}
