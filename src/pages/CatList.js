/**
 * Created by sharadsaxena on 20/01/18.
 */
import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {withRouter} from "react-router-dom";
import { Link } from 'react-router-dom'
import PropTypes from "prop-types";
import DataWrapper from "../components/common/DataWrapper";
import { inject, observer } from "mobx-react";
import {makeRequest} from "../lib/makeRequest";
import { toJS } from "mobx"
import MultipleCardListing from '../components/common/MultipleCardListing'
var _ = require('underscore');
_.mixin(require('../lib/mixins'));

@inject("store")
@DataWrapper
@observer
class CatList extends React.Component {
  static contextTypes = {
    router: PropTypes.shape({
      route: PropTypes.object.isRequired
    }).isRequired
  };
  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
    this.handleState = this.handleState.bind(this);
    this.state = {
      catList:[]
    };
  }

  componentWillMount(){

  }

  componentDidMount(){
    const context = this;
    let stateId = _.at(this,'store.selectedState.id');
    let catId = _.at(this,'props.match.params.catId');
    makeRequest({ urlList:[{url:`/apis/aasaudh/entity/subcategory/categoryid/stateid/?categoryid=${catId}&stateid=${stateId}`,method:'get'}],source:'client'},(err,resp)=>{
      if(_.at(resp,'0.data.data')){
        context.handleState(_.at(resp,'0.data.data'))
      }

    })
  }

  componentWillUpdate(){

  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  handleState = (data) => {
    data && this.setState({
      catList: data
    })
  }

  render() {
    const context = this;
    let catList = _.at(context,'state.catList');
    let loading = _.isEmpty(catList);
    return (
      <div>
        <header className="others-hd">
          <div className="btn_bk" onClick={(e)=>{ const {history} = context.props; history.goBack();}}></div>
          <h1 style={{textTransform: 'capitalize'}}>{_.at(this,'props.match.params.catName')}</h1>
        </header>

        <div className="list">
          <ul className="normalList">
            {catList && _.map(catList,(cats)=>{
              let cityId = _.at(cats,'cityId');
              let localityId = _.at(cats,'localityId');
              let entitySubcategoryId = _.at(cats,'entitySubcategoryId');
              let count = _.at(cats,'count');
              let state = _.at(context,'store.selectedState.name');
              let url = `/state/${state}/searchlist?cityid=${cityId}&localityid=${localityId}&categoryid=${entitySubcategoryId}`
              return (<li style={{padding:'5px'}}>
                <a href={url}>
                  {cats.entitySubcategoryName} <span>{count}</span>
                </a>
              </li>);
            })
            }
          </ul>
        </div>

        {loading && <div>Loading ............</div>}

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

export default withRouter(CatList);
