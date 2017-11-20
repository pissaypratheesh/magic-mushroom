/**
 * Created by tishya on 6/7/17.
 */
import React, { Component } from "react";
import {CtoSTimeout, callRetries} from '../../config/constants'
import {withRouter} from "react-router-dom";
import { inject, observer } from "mobx-react";
import UIEffects from '../../lib/UIEffects';
import langMapping from '../../config/langMapping';
var deviceInfo  = require('../../lib/deviceDetect');
import {makeRequest} from '../../lib/makeRequest'
import Footer from './Footer';
import InfiniteScroll from 'react-infinite-scroll-component';
import LoadingGif from './LoadingGif';
import {  Link } from 'react-router-dom';
var appendQuery = require('append-query')

var _ = require('underscore');
_.mixin(require('../../lib/mixins'));
var deviceInfo  = require('../../lib/deviceDetect');

@inject("store")
@observer

class AllNpByCat extends Component {

  constructor(props) {
    super(props);
    this.store = this.props.store;
    this.state = {
      isLoading: false,
    };
    this.loadItems = true;
    this._renderItems = this._renderItems.bind(this);
    this._loadMoreItems = this._loadMoreItems.bind(this);
    this.onBackButtonEvent = this.onBackButtonEvent.bind(this)
    this.clearNpData = this.clearNpData.bind(this)
    this.header = this.header.bind(this)
  }

  clearNpData(type) {
    this.store.appState.clearNpCategoryData(type)
  }

  header(){
    let context = this;
    return(
      <header className="defult">
        <div style={{display:'none'}} dangerouslySetInnerHTML={{__html:(deviceInfo.fontCall(context.store.appState.selectedLang))}}></div>
        <div className="lhs">
          <h2>{context.store.appState.npGroupCatName}</h2>
            <div className="action" onClick={this.clearNpData.bind(this,undefined)}>
              <Link className="btn_bk" to={`/news/${context.store.appState.selectedCountry}/${langMapping[context.store.appState.selectedLang]}/all-categories?mode=pwa`}>
              </Link>
            </div>
        </div>
      </header>
    )
  }

  _renderItems() {
    let context = this;
    let newspapers = _.at(this,'store.appState.allNpByCategories.rows');

    if(newspapers){
      return (_.at(newspapers)).map(function(item, itr){
        let webpImg = item.favIconUrl;
        webpImg = webpImg
        let jpgImg = item.favIconUrl;
        jpgImg = jpgImg;

        return (
          <li key={itr} onClick={context.clearNpData.bind(context,"activateNpLanding")}>
            <Link to={appendQuery(`/news/${context.store.appState.selectedCountry}/${langMapping[context.store.appState.selectedLang]}/${item.sourceNameEn.toLowerCase()}-epaper-${item.shortKey}`,{mode:'pwa'})}>
              <em>
                <picture>
                  <source srcSet={webpImg} alt={""} type="image/webp"/>
                  <img src={jpgImg} alt={""} />
                </picture>
              </em>
              <p>{item.nameUni}</p>
            </Link>
          </li>

        )
      });
    }
    else {
      return (<li style={{display:"none"}}></li>)
    }
  }

  _loadMoreItems() {
    var context = this;
    var currentNp = this.store.appState.allNpByCategories.rows;

    this.setState({isLoading: true});
    if(_.at(this,'store.appState.allNpByCategories.nextPageUrl')) {
      var uri = '/apis/npByCategory' + "?url=" + encodeURIComponent(this.store.appState.allNpByCategories.nextPageUrl)
      uri += "&mode=pwa";
      makeRequest({urlList: [{url: uri, timeout: CtoSTimeout, method: 'get'}], source: 'client',store:context.store}, function (err, resp) {
        if (err) {
          return UIEffects.showServerError(err);
        }
        if(_.at(resp, '0.data.data.count') > 0)
          context.store.appState.npPagination(currentNp.concat(_.at(resp, '0.data.data.rows') || []), _.at(resp, '0.data.data.nextPageUrl'))
        else
          context.setState({isLoading: false});
      })
    }
  }

  componentDidMount() {
    window.scrollTo(0,0);
    // Commenting below line to hand over back button control to browser stack instead of manual tracking
    //window.onpopstate = this.onBackButtonEvent
  }

  componentWillUnmount() {
  }

  componentDidUpdate() {
  }


  onBackButtonEvent(e){
    let context = this;
    e.preventDefault();
    this.store.appState.clearNpCategoryData(undefined)
    this.props.history.replace(`/news/${context.store.appState.selectedCountry}/${langMapping[context.store.appState.selectedLang]}/all-categories?mode=pwa`);
  }

  render(){
    let context = this;
    let items = context._renderItems();

   return (
     <div>
       {this.header()}
       <div className="npList">
          <div className="catList">
            <InfiniteScroll next={context._loadMoreItems.bind(context)}
                            hasMore={true}
                            loader={context.state.isLoading ? <LoadingGif/> : ""}>
              <ul>
                {items}
              </ul>
            </InfiniteScroll>
          </div>
        </div>
     </div>
    );
  }
}

export default withRouter(AllNpByCat);
