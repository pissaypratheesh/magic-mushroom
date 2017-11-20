/**
 * Created by pratheesh on 17/5/17.
 */
import React from 'react';
import UIEffects from '../../lib/UIEffects';
import TrackVisibility from 'react-on-screen';

const ComponentToTrack = ({ isVisible }) => {
  console.log(" in comp track")
  const style = {
    background: isVisible ? 'red' : 'blue'
  };
  return <div style={style}>Hello</div>;
}

import { inject, observer } from "mobx-react";
import { Link } from 'react-router-dom'
//import LazyLoad from 'react-lazyload';
import langMapping from '../../config/langMapping';
import characterCountMap from '../../config/LanguageCharacterCount';
var _ = require('underscore');
var moment = require('moment');
_.mixin(require('../../lib/mixins'));
var imgFormatter = require('../../lib/randomUtil')


Element.prototype.documentOffsetTop = function () {
  return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop() : 0 );
};

@inject("store")
@observer
class NewsListing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgError: false,
    }
    this.store =  this.props.store.appState;
    this.onClickNews =  this.onClickNews.bind(this);
    this.extractUnit =  this.extractUnit.bind(this);
    this.onLoadImg =  this.onLoadImg.bind(this);
    this.getTemplates = this.getTemplates.bind(this);
    this.imageToWebp = this.imageToWebp.bind(this);
    this.truncate = this.truncate.bind(this);
    this.extractScreenResolution = this.extractScreenResolution.bind(this);
  }

  componentDidMount() {
    let selIdIndex = _.at(this, 'store.selectedIdDetails.id');
    let context = this;
    if(!_.isUndefined(selIdIndex) && (this.props.item.id === selIdIndex)){
      var selIdElement = document.getElementById(selIdIndex);
      var idElement = selIdElement &&  selIdElement.getElementsByClassName("inr")[0];
      idElement && idElement.classList.add('active');
      idElement && setTimeout(function () {
        idElement.classList.remove('active')
        context.store.clearData('selectedIdDetails')
      },600)
    }
  }

  onLoadImg(e){
    let a = e.target.naturalWidth/e.target.naturalHeight;
    (a > 1) &&
    (e.target.setAttribute('style', 'width:' + e.target.parentNode.clientWidth * a + 'px;height:' + e.target.parentNode.clientHeight + 'px;margin-left:-' + parseInt(e.target.parentNode.clientWidth * (a - 1) / 2) + 'px;'))
  }

  imageToWebp(url){
    let img = url && ( url.split(".jpg")[0] + ".webp");
    //img = img && img.replace("http","https")
    return img;
  }

  extractUnit(time){
    let unit;
    switch(time && time.toLowerCase()){
      case 'minute':
      case 'minutes':
        unit = 'm';
        break;

      case 'second':
      case 'seconds':
        unit = 's';
        break;

      case 'hour':
      case 'hours':
        unit = 'h';
        break;

      case 'day':
      case 'days':
        unit = 'd';
        break;

      case 'month':
      case 'months':
        unit = 'M';
        break;

      case 'year':
      case 'years':
        unit = 'Y';
        break;
    }
    return unit;
  }

  extractScreenResolution(value){
    let width;
    switch(true){
      case value ==1024:
        width = 1024;
        break;

      case value >=768:
        width = 768;
        break;

      case value >=480:
        width = 480;
        break;

      case value >= 320:
        width = 320;
        break;

      default :
        width = 100;
        break;
    }
    return width;
  }

  truncate(str) {
    let screenWidth = window.innerWidth,
    width = this.extractScreenResolution(screenWidth),
    characterCount = characterCountMap[width][this.store.selectedLang];
    if (str && (str.length > characterCount)){
        str = str.slice(0, characterCount);
        return str += "...";
    } else {
        return str;
    }
  }

  getTemplates(){
    let context = this;
    let webpImg = _.at(context,'props.item.thumbnail.url') || _.at(context,'props.item.url');
    let listImg = imgFormatter(webpImg,{width:80,height:80});

    var time = _.at(context,'props.item.publishTime') && moment(context.props.item.publishTime).fromNow().split(" ");
    //Rare case where momentjs returns like 'in 24 minutes'
    if(time[0] === "in"){
      time.shift();
      time.push('ago');
    }
    var valTime = (time[0] === "an" || time[0] === "a") ? "1" : time[0],
        timesAgo = valTime + this.extractUnit(time[1]);
    var headLine = this.truncate(context.props.item.title);

    return {
      ASTROLOGY(){
        var microComp = (
          <div className="crd">
            {(!context.state.imgError)?(
              <picture className="">
                <source srcSet={listImg.webp} alt={""} type="image/webp"/>
                <img src={listImg.jpg} alt={""}  onError={context.ErrorImg.bind(context)} />
                <span className="icn_ph"></span>
              </picture>
            ) :null}

            <div className={!(context.state.imgError) ? "list-content" :"list-content PL0"}>
              <h2>{headLine}</h2>
              <div className="srcInfo">
                <span>{_.at(context,'props.item.sourceNameUni')} .</span>
                <em>{timesAgo}</em>
              </div>
            </div>
          </div>
        );
        var comp =  (
          <section className="PHOTO" onClick={context.onClickNews} id={_.at(context,'props.item.id')}  style={context.props.style}>
            {context.props.ignoreLink ? microComp :
              <Link to={_.at(context,'props.item.detailsPageUrl')}>
                <div className="inr">{microComp}</div>
              </Link>
            }
          </section>
        )
        return  comp;
      },

      STORY() {
        var microComp = (
          <div className="crd">
            {(!context.state.imgError)?(
              <picture className="">
                <source srcSet={listImg.webp} alt={""} type="image/webp"/>
                <img src={listImg.jpg} alt={""}  onError={context.ErrorImg.bind(context)} />
                <span className="icn_ph"></span>
              </picture>
            ) :null}

            <div className={!(context.state.imgError) ? "list-content" :"list-content PL0"}>
              <h2>{headLine}</h2>
              <div className="srcInfo">
                <span>{_.at(context,'props.item.sourceNameUni')} .</span>
                <em>{timesAgo}</em>
              </div>
            </div>
          </div>
        );
        var comp =  (
          <section className="PHOTO" onClick={context.onClickNews} id={_.at(context,'props.item.id')}  style={context.props.style}>
            {context.props.ignoreLink ? microComp :
              <Link to={_.at(context,'props.item.detailsPageUrl')}>
                <div className="inr">{microComp}</div>
              </Link>
            }
          </section>
        )
        return  comp;
      },

      PHOTO() {
        let microComp = (
          <div className={(_.at(context,'props.item.thumbnails') && context.props.item.thumbnails.length>=3)?'ph_multi':''}>
            {
              (_.at(context,'props.item.thumbnails') && context.props.item.thumbnails.length < 3 && webpImg)?(
              <picture className="ph_typ_sty ph_icon">
                <source srcSet={listImg.webp} alt={""} type="image/webp"/>
                <img src={listImg.jpg} alt={""}  onError={context.ErrorImg.bind(context)}/>
                <span className="icn_ph"></span>
              </picture>
              ):(
                <ul>
                  {_.at(context,'props.item.thumbnails') && _.map(context.props.item.thumbnails, function (items, itr) {
                    if(itr<3 && items.url) {
                      let gImgs = imgFormatter(items.url,{width:80,height:80});
                      return (
                        <li key={itr}>
                          <picture className={(Object.keys(items).length) ? 'ph_typ_sty' : null}>
                            <source srcSet={gImgs.webp} alt="" type="image/webp"/>
                            <img src={gImgs.jpg} alt="" />
                            {(itr == 2) ? (<span>+{Object.keys(items).length + 1}</span>) : null}
                          </picture>
                        </li>
                      )
                    }

                  })}
                </ul>
              )
            }

            {/*<div className="cnt"><span>{context.props.item.childCount}</span></div>*/}

            <div className="list-content">
              <h2>{headLine}</h2>
              <div className="srcInfo">
                <span>{context.props.item.sourceNameUni} .</span>
                <em>{timesAgo}</em>
              </div>
            </div>
          </div>
        )

        let comp =  (
          <section className="PHOTO" onClick={context.onClickNews} id={context.props.item.id}  style={context.props.style}>
            {context.props.ignoreLink ? microComp :
              <Link to={context.props.item.detailsPageUrl}>
                <div className="inr">{microComp}</div>
              </Link>
            }
          </section>
        )
        return  comp;
      },

      VIDEO() {
        let microComp = (
          <div className="crd">
            {(!context.state.imgError)?(
            <picture className="vid_thumb" style={{display:(!context.state.imgError) ? "" : "none" }}>
              <source srcSet={listImg.webp} alt={""} type="image/webp"/>
              <img src={listImg.jpg} alt={""}  onError={context.ErrorImg.bind(context)}/>
              <span className="icn_vid"></span>
            </picture>
            ) :null}

            <div className={!(context.state.imgError) ? "list-content" :"list-content PL0"}>
              <h2>{headLine}</h2>
              <div className="srcInfo">
                <span>{context.props.item.sourceNameUni} .</span>
                <em>{timesAgo}</em>
              </div>
            </div>
          </div>
        )
        let comp =  (
          <section className="VIDEO" onClick={context.onClickNews} id={context.props.item.id}  style={context.props.style}>
            {context.props.ignoreLink ? microComp :
              <Link to={context.props.item.detailsPageUrl}>
                <div className="inr">{microComp}</div>
              </Link>
            }
          </section>
        )
        return  comp;
      },

      TickerNode() {
        var html = _.at(context,'props.item.tickers.0.content');
        html = html.replace("<body ","<body><div ");
        html = html.replace("</body>","</div></body>");
        let microComp = (
          <div className="crd">
            <picture style={{display:(!context.state.imgError) ? "" : "none" }}>
              <source srcSet={listImg.webp} alt={""} type="image/webp"/>
              <img src={listImg.jpg} alt={""}  onError={context.ErrorImg.bind(context)}/>
            </picture>
            <div dangerouslySetInnerHTML={{__html: html}}></div>
            <div className="wrp-picture">
              <picture style={{display:(!context.state.imgError) ? "" : "none" }}>
                <source srcSet={webpImg} alt={""} type="image/webp"/>
                <img src={context.props.item.url} alt={""} onError={context.ErrorImg.bind(context)} />
              </picture>
            </div>

            {/* <div className={!(context.state.imgError) ? "list-content" :"list-content PL0"}>
             <h2>{context.props.title}</h2>
             <div className="srcInfo">
             <span>{context.props.npName}</span>
             <em>{context.props.time}</em>
             </div>
             </div>*/}
          </div>
        );

        let comp =  (
          <section className="ticker_lst" onClick={context.onClickNews} id={context.props.item.id}  style={context.props.style}>
            {context.props.ignoreLink ? microComp :
              <Link to={context.props.item.detailsPageUrl}>
                <div className="inr">{microComp}</div>
              </Link>
            }
          </section>
        )
        return  comp;
      }
    }
  }


  onClickNews(e){
    UIEffects.addRippleEffect(e)
    var el =  document.getElementById(this.props.id);
    var top = el ? Number(el.documentOffsetTop()) : 0;
    var fromViewport = el ? Number(el.getBoundingClientRect().top) : 0;
    this.store.onNewsDetailsClick(this.props, top - fromViewport);
  }

  ErrorImg(e){
    this.setState({imgError:true})
  }

  render(){
    let data = this.props.item;
    let templates = this.getTemplates()
    if(!templates[data.type])
      return ( <div className="crd" style={{height:"130px"}}>Invalid data</div>)
    return (
      <TrackVisibility once>
        <ComponentToTrack />
        {templates[data.type]()}
      </TrackVisibility>
      );
  }
}

export default NewsListing;
