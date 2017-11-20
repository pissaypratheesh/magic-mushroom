/**
 * Created by pratheesh on 17/5/17.
 */
import TrendsListing from './TrendsListing';
import React, { Component } from "react";
import {withRouter} from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Route, matchPath } from "react-router-dom";
import { Link } from 'react-router-dom'
import langMapping from '../../config/langMapping';
import { translateFeaturedTopics, translateAllTopics, translateTopics } from '../../config/localizationMapping';
import CategoryList from './CategoryList';
import Footer from './Footer';
var _ = require('underscore');
_.mixin(require('../../lib/mixins'));

// multiple trending topic list

@observer
@inject("store")
class MultipleTrendsListing extends Component {

  constructor(props) {
    super(props);
    this.store = this.props.store.appState;
    this.backToNews = this.backToNews.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0,0);
  }

  componentWillUnmount() {
  }

  componentDidUpdate() {
  }

  componentWillReceiveProps(nextProps) {
    //_.at(nextProps,"match.params.type") will have the type
    window.scrollTo(0,0);
  }


  backToNews(){
    let activeNav = this.store.topicsList[0] ? ("/" + this.store.topicsList[0]["nameEnglish"].toLowerCase()) : ""
    let url = (`/news/${this.store.selectedCountry}/${langMapping[this.store.selectedLang]}${activeNav}`)
    this.store.changeActiveTopic("topicsList")
    this.props.history.push(url)
  }

  trendsRenderComponent(){
    let context = this;
    let topics =  this.store.topics;
    let colorArr = ["#A46DB0", "#58B6F1", "#E86677", "#F17958", "#8BC64A", "#50D3AC"];
    let featuredTopicsText = translateFeaturedTopics[context.store.selectedLang] || "Featured Topics";
    let allTopicsText = translateAllTopics[context.store.selectedLang] || "All Topics";
    if(!topics || (_.isEmpty(topics))){
      return <div/>
    }
    return (
      <div className="topicWrp">
        <div className="hd">
          <h2>{featuredTopicsText}</h2>
        </div>

        <div className="thumb_list">
          <ul>
            {_.at(topics,'TRENDING') && (_.at(topics,'TRENDING').map(function(item, itr) {
                if(item) {
                  let title = item.title ? item.title : item.languageNameMapping[context.store.selectedLang]
                  return (
                    <TrendsListing imgSrc={item.url}
                                   navUrl={`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${(item.nameEnglish.toLowerCase()).replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-")}-topics-${item.key}?topicTitle=${title}&mode=pwa`}
                                   imgAlt=""
                                   item={item}
                                   title={title}
                                   key={itr}/>
                  )
                }
              }
            ))}
          </ul>
        </div>
        <div className="hd">
          <h2>{allTopicsText}</h2>
        </div>
        <div className="catList">
          <ul>
            {_.at(topics,'FEATURED') && (_.at(topics,'FEATURED')).map(function(item, itr){
              if(item) {
                let firstChar = item.title ? item.title.charAt(0) : item.languageNameMapping[context.store.selectedLang].charAt(0)
                let title =item.title ? item.title : item.languageNameMapping[context.store.selectedLang]
                return (
                  <CategoryList
                    navUrl={`/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${(item.nameEnglish).replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-")}-topics-${item.key}?topicTitle=${title}&mode=pwa`}
                    itemFirstChar={firstChar}
                    key={itr}
                    itemColor={colorArr[itr % colorArr.length]}
                    itemName={title}/>
                )
              }
            })}
          </ul>
        </div>
      </div>
    )
  }

  render() {
    let context = this;
    let topicsText = translateTopics[context.store.selectedLang] || "Topics";
    return (
      <div>
        <header className="defult whtHdFx" style={{position:"inherit"}}>
          <div className="lhs">
            <h2>{topicsText}</h2>
              <div className="action" onClick={()=>{context.props.history.goBack();}}>
                <a className="m_sprite btn_bk">
                </a>
              </div>
          </div>
        </header>
        {this.trendsRenderComponent()}
      </div>
    )
  }
}

export default withRouter(MultipleTrendsListing);


