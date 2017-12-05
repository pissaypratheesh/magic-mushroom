/**
 * Created by pratheesh on 17/5/17.
 */
import React from 'react';
import { inject, observer } from "mobx-react";
import { Link } from 'react-router-dom'
import { enableTestLogs, cardInViewMoniter } from '../../config/constants'

var _ = require('underscore');

_.mixin(require('../../lib/mixins'));

@inject("store")
@observer
class DocListing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgError: false,
    }
    this.store =  this.props.store.appState;
    this.onClickNews =  this.onClickNews.bind(this);
    this.onLoadImg =  this.onLoadImg.bind(this);
    this.imageToWebp = this.imageToWebp.bind(this);
  }

  componentDidMount() {
    let context = this;

  }


  onLoadImg(e){
    let a = e.target.naturalWidth/e.target.naturalHeight;
    (a > 1) &&
    (e.target.setAttribute('style', 'width:' + e.target.parentNode.clientWidth * a + 'px;height:' + e.target.parentNode.clientHeight + 'px;margin-left:-' + parseInt(e.target.parentNode.clientWidth * (a - 1) / 2) + 'px;'))
  }

  imageToWebp(url){
    let img = url && ( url.split(".jpg")[0] + ".webp");
    return img;
  }


  onClickNews(e){
  }

  ErrorImg(e){
    this.setState({imgError:true})
  }

  componentWillReceiveProps(){
  }

  componentDidUpdate(){
  }

  render(){
    let data = this.props.item;
    return (
      <li key={data.entityId}>
        <a href="#">
          <div className="LHS">
            <picture>
              <img src="assets/images/800x480_IMAGE57227900.jpg" />
            </picture>
            <div className="sprite_star rate0-0">
              <span>{`Reviews ${data.totalFeedbackCount}`}</span>
            </div>
          </div>
          <div className="RHS">
            <h2>{data.entityName}</h2>
            <h3>Dental Solutions & 6 more clinics</h3>
            <div className="info">
              <span>{_.map(data.entitySubCategoryCount.entitySubCategory,(val)=>{ return val.entitySubcategoryName}).join(", ")}</span>
              <em>{`${data.totalExperiance} years experience`}</em>
            </div>
            <div className="info2">
              <span className="fees icn_fees">{data.fees}</span>
              <span className="location icn_loaction">{data.location} <em>(20 Km)</em></span>
            </div>
            <div className="action">
              <div className="btnL">
                <div className="btn btn_cl">call</div>
              </div>
              <div className="btnR">
                <div className="btn btn_aprt">APPOINTMENT</div>
              </div>
            </div>
          </div>
        </a>
      </li>
    );
  }
}

export default DocListing;
