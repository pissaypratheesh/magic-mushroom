/**
 * Created by pratheesh on 26/5/17.
 */
import React from 'react';
import AllNpByCat from "../components/common/AllNpByCat"
import LoadingGif from "../components/common/LoadingGif"
import NewspageSwipeableRoutes from "../components/common/NewspageSwipeableRoutes"
import MultipleTrendsListing from "../components/common/MultipleTrendsListing";
import Header from '../components/common/Header';
import NotFound from '../pages/NotFound'
import Footer from '../components/common/Footer';
import { inject, observer } from "mobx-react";
import {toJS} from "mobx"
import PropTypes from "prop-types";


var _ = require('underscore');
_.mixin(require('../lib/mixins'));


@inject("store")
@observer
class NewsPage  extends React.Component {
  static contextTypes = {
    router: PropTypes.shape({
      route: PropTypes.object.isRequired
    }).isRequired
  };
  constructor(props) {
    super(props);
    this.store =  this.props.store.appState;
    this.onSwipe=this.onSwipe.bind(this)
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidUpdate() {

  }

  componentWillReceiveProps(nextProps) {
  }

  onSwipe(){
    //this.store.clearNewsData();
    this.store.clearScrollOffset();
  }

  render() {
    let context = this,
        newsListData = context.store[context.store.activeTopic],
        activeNavData = newsListData && newsListData[context.store.activeNavIndex] && newsListData[context.store.activeNavIndex]["data"] && newsListData[context.store.activeNavIndex]["data"]["data"],
        isNewspaperPage = (this.store.activeNav === "all-categories"),
        location = window.location.pathname;

    if(this.store.allNpByCategories && (location.indexOf("-updates-") !== -1)){
      let npName = location.split("-updates-");
      let key = npName && npName[1]
      return (
        <div>
          <AllNpByCat key={key} {...this.props}/>
        </div>
      )
    }

    if(this.store.topics && ((location.slice(-10) === "all-topics") || location.indexOf("-topics-") !== -1)){
      return ( <MultipleTrendsListing  {...this.props}/>)
    }

    return (
      <div>
        <Header {...this.props}/>
        {(activeNavData || isNewspaperPage) ? <NewspageSwipeableRoutes index={context.store.activeNavIndex} data={activeNavData} {...this.props}/> : <LoadingGif/>}
      </div>
    );
  }
}

export default NewsPage;

