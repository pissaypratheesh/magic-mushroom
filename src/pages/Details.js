/**
 * Created by pratheesh on 25/5/17.
 */
import React from 'react';
import { toJS, isObservableArray } from "mobx";
import LoadingGif from '../components/common/LoadingGif';
import langMapping from '../config/langMapping';
import { translateSuggested, translateRelated } from '../config/localizationMapping';
import {CtoSTimeout, callRetries} from '../config/constants'
import NewsListing from '../components/common/NewsListing'
import axios from 'axios';
import axiosRetry from 'axios-retry';
import {makeRequest} from '../lib/makeRequest'
axiosRetry(axios, { retries: callRetries });
import { inject, observer } from "mobx-react";
import {withRouter} from "react-router-dom";
import UIEffects from '../lib/UIEffects';
var share = require('../lib/shareUtil');
import LazyLoad from 'react-lazyload';
import InstagramEmbed from 'react-instagram-embed'
import ReverseLangMapping from '../config/ReverseLangMapping';
import { Tweet } from 'react-twitter-widgets'
var instagramIdToUrlSegment =  require('instagram-id-to-url-segment').instagramIdToUrlSegment;
var deviceInfo  = require('../lib/deviceDetect');
var _ = require('underscore');
var moment = require('moment');
var imgFormatter = require('../lib/randomUtil')
var comScore = require('../lib/comscore');
var appendQuery = require('append-query')
import { gaParmams,logPageView,logEvent } from "../lib/gaParamsExtractor";

_.mixin(require('../lib/mixins'));

@inject("store")
@observer
class Details extends React.Component {

    constructor(props) {
        super(props);
        this.store =  this.props.store.appState;
        this.updateDetails = this.updateDetails.bind(this);
        this.onClickRelated = this.onClickRelated.bind(this);
        this.onClickSource = this.onClickSource.bind(this);
        this.shareUrl = this.shareUrl.bind(this);
        this.showHtml = this.showHtml.bind(this);
        this.getYoutubeId = this.getYoutubeId.bind(this);
        this.imageSize = this.imageSize.bind(this);
        this.playstoreDownloadContent = this.playstoreDownloadContent.bind(this);
        this.onShareClick=this.onShareClick.bind(this);
        this.getIdFrmUrl = this.getIdFrmUrl.bind(this);
        this.blockAllContent = this.blockAllContent.bind(this);
        this.topicsComponent=this.topicsComponent.bind(this);
        this.executeOnce=this.executeOnce.bind(this);
        this.onLoadImg =  this.onLoadImg.bind(this);
        this.replaceAll=this.replaceAll.bind(this);
        this.getKeyByValue = this.getKeyByValue.bind(this);
        this.copy = this.copy.bind(this);
        this.isComponentMounted = false;
        this.state = {
          relatedData: undefined,
          moreContent: undefined,
        }
      this.executeOnlyOnce = _.once(this.executeOnce)

    }

   replaceAll(find, replace,str){
      var re = new RegExp(find, 'g');
      str = str && str.replace(re, replace);
      return str;
    }

    onShareClick(title, text, url){
      if (navigator.share === undefined) {
        //console.log('Error: Unsupported feature: navigator.share');
        return;
      }
      // WEB SHARE API
      navigator.share({
        title: title,
        text: text,
        url: url
      }).then(() => {
        //console.log('Successfully shared')
         })
        .catch((error) => {
          console.error('Error sharing:', error)
        });
    }

    getYoutubeId(url){
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = url.match(regExp);
      return (match&&match[7].length==11)? match[7] : false;
    }

    shareUrl(type,obj){
      return share[type](obj);
    }

    imageSize(){
      let ratio = 16/9;
      let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
      return width/ratio;
    }

    getIdFrmUrl(){
      let currentUrl = window.location.href,
          substr = currentUrl.split('newsid-')[1];
      return substr ? substr.split('?')[0] : "";

    }


    onClickRelated(url,news){
      let isDirectLanding = !!this.store.topics; // only on direct landing "topics" is loaded
      const {history} = this.props;
      let originDetailsPage = isDirectLanding ? _.at(this,'store.selectedIdDetails') :  _.at(this,'props.details')
      this.store.timespentCalculator('details',{id:this.getIdFrmUrl()},'stop',"onclickrealted")
      this.store.updateRelatedDetails(news, originDetailsPage) //item, origin as params
      isDirectLanding ? history.push(url) : history.replace(url)
    }


    updateDetails(where){
      let det = this.store.viewRelatedDetails ||  _.at(this, 'props.details') || _.at(this, 'store.selectedIdDetails');
      let blockLevel = _.at(det,'webAttributes.storyBlockingLevel');
      blockLevel = blockLevel && blockLevel.toLowerCase();
      let blockMoreContent = blockLevel && (_.contains(['block_all', 'block_all_chunks', 'block_second_chunk'],blockLevel))
      if((!blockLevel || blockLevel !== "block_all") && det && !det.moreData &&  !(this.state.relatedData && this.state.moreContent)) {
        let url = "/apis/moredetails?";
        !blockMoreContent && det.moreContentLoadUrl &&  (url += ("morecontenturl=" + encodeURIComponent(det.moreContentLoadUrl+ "&includeExternalAds=true")))
        let urlList = [{url: url, method: "get", timeout: CtoSTimeout}];
        let context = this;
        makeRequest({urlList: urlList, source: "client",store:context.store}, (err, res) => {
          let updatedState = {};
          res = _.at(res,'0.data');

          if (err) {
            UIEffects.showServerError(err);
            return;
          }
          _.at(res,'related.data') && (updatedState['relatedData'] = _.at(res,'related.data'))
          _.at(res,'morecontent.data') && (updatedState['moreContent'] = _.at(res,'morecontent.data.content'))
          console.log(" res and data-->",res,err,updatedState)

          context.isComponentMounted && context.setState(updatedState);
          context.store.updateDetailsData(det, updatedState);
          return;
        })
      }
    }

    onClickSource(url){
      this.store.changeActiveTopic("newspaperLanding")
      this.props.history && this.props.history.push(url)
    }

    blockAllContent(img){
      return (
        <div className="tlBlk_NP" style="padding:50px 10px 0px">
          <div className="logo"><img src={img}/></div>
          <p>Read this story on Dailyhunt Mobile App</p>
          <ul className="appList">
            <li><a target="_blank" href="https://play.google.com/store/apps/details?id=com.eterno" className="android"></a></li>
            <li><a target="_blank" href="https://itunes.apple.com/in/app/dailyhunt-formerly-newshunt/id338525188?mt=8" className="ios"></a></li>
            <li><a target="_blank" href="http://www.windowsphone.com/en-in/store/app/newshunt/5360760b-dfc8-4282-a8e2-285cf490c8d9" className="window"></a></li>
          </ul>
        </div>
      )
    }

    playstoreDownloadContent(){
      return (
        <div className="block_np MT10">
          <table>
            <tr>
              <td className="store" align="center">
                <h3>View on app</h3>
                <ul>
                  <li>
                    <a href="market://details?id=com.eterno&amp;referrer=utm_source%3Dorganic_direct%26utm_campaign%3Dnews%26utm_medium%3Ddirect%26utm_content%3Dnewsdetail_72519452%26utm_term%3Dwa%26utm_display%3DStory" className="android"></a>
                  </li>
                </ul>
              </td>
            </tr>
          </table>
          <div className="gPLink" id="gPLink">If your device does not support Google Play, <a href="http://acdn.newshunt.com/nhbinaries/binFilesPath/promotion/Install_Dailyhunt_28.apk">Download Here</a></div>
        </div>
      )
    }

    topicsComponent(){
    let headLine = _.at(this,'store.topicsList.0.name'),
      topics = _.at(this,'store.topics'),
      topiscTrending = _.at(topics,'TRENDING'),
      topiscFeatured = _.at(topics,'FEATURED'),
      firstchar = headLine && headLine.charAt(0);

    let language = _.at(this,'props.match.params.language'),
      lang = ReverseLangMapping[language] || "en",
      sourceUrl = `/news/${this.store.selectedCountry}/${language}`,
      diff;

    let suggestedTopics = translateSuggested[this.store.selectedLang] || "Suggested Topics";

    if(topiscTrending){
      diff = 9 - `${topics.TRENDING.length}` ;
    }

    return  topics ? (
                          <div className="suggested">
                             <div className="hd">
                                <h2>{suggestedTopics}</h2>
                              </div>
                              <ul>
                                <li>
                                   <a href={sourceUrl}>
                                     <em style={{background:'#58B6F1'}}>{firstchar}</em>
                                     <span>{headLine}</span>
                                   </a>
                                </li>

                                {topiscTrending && _.map(topiscTrending,function(topic, index) {
                                let title =  _.at(topic,'languageNameMapping') && topic.languageNameMapping[lang] && (topic.languageNameMapping[lang]).replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-").toLowerCase(),
                                    firstchar = title && title.charAt(0),
                                    nameEng = _.at(topic,'nameEnglish'),
                                    navURL = `${sourceUrl}/${(nameEng.toLowerCase()).replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-")}-topics-${topic.key}?topicTitle=${title}`;
                                  return (
                                  <li>
                                     <a href={navURL}>
                                        <em style={{background:'#58B6F1'}}>{firstchar}</em>
                                        <span>{title}</span>
                                      </a>
                                 </li>)
                                })}
                                {topiscFeatured && _.map(topiscFeatured,function(topic, index) {
                                    if( diff > index){
                                       let title = _.at(topic,'languageNameMapping') && topic.languageNameMapping[lang],
                                       firstchar =  title && title.charAt(0),
                                       navURL = `${sourceUrl}/${(title)}-topics-${topic.key}`;
                                       return (
                                         <li>
                                           <a href={navURL}>
                                             <em style={{background:'#58B6F1'}}>{firstchar}</em>
                                             <span>{title}</span>
                                           </a>
                                         </li>)
                                      }
                                    }
                                  )}
                              </ul>
                           </div>) : (<div></div>)

    }

  copy() {
    let textArea = document.createElement("textarea");
    textArea.value = appendQuery(window.location.href,{ss:'cp',s:deviceInfo.utmSrc()});
    document.body.appendChild(textArea);
    textArea.select();
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
    } catch (err) {
    }

    document.body.removeChild(textArea);
  }


    componentDidMount() {
      window.scrollTo(0,0);
      this.isComponentMounted = true;
      let det = this.store.viewRelatedDetails || _.at(this,'props.details') || _.at(this,'store.selectedIdDetails');
      let updateStateObj = {relatedData: _.at(det,'moreData.relatedData')}
      _.at(det,'moreData.moreContent') && (_.extend(updateStateObj,{moreContent: det.moreData.moreContent}))
      if(this.isComponentMounted &&  (updateStateObj.relatedData || updateStateObj.moreContent)){
        this.setState(updateStateObj);
        return;
      }
      if(this.store.viewRelatedDetails){
        this.executeOnlyOnce();
        this.store.timespentCalculator('details',{id:det.id},'start');
      }
    }

    componentWillUnmount() {
      this.isComponentMounted = false;
    }

    componentDidUpdate() {
    }

    executeOnce(){
      let delay =  Math.floor(Math.random() * 900) + 100;
      let det = this.store.viewRelatedDetails ||  _.at(this, 'props.details') || _.at(this, 'store.selectedIdDetails');
      let context = this;
      let detailParam = _.at(this, 'store.selectedIdDetails');
      let language = _.at(this, 'store.selectedLang') || 'en';
      let npKey = _.at(this, 'store.selectedIdDetails.sourceNameEn');
      let param = gaParmams({language:ReverseLangMapping[language],type:npKey+'-epaper-'});
      logPageView(param);

      comScore(detailParam)
      if(this.isComponentMounted && (!this.state.moreContent)){
        setTimeout(function(){
          context.updateDetails("mount")
        },delay);
      }
    }

    onLoadImg(e) {
      e && ((e.target.naturalWidth/e.target.naturalHeight) > 16/9) && (e.target.setAttribute('style', 'width: auto; height: 100%; position: absolute; top: -100%; right: -100%; bottom: -100%; left: -100%; margin: auto;'))
    }

  getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
  }

  sendEvent(e,label){
    let npName = _.at(this,'props.details.sourceNameEn');
    let getLang = _.at(this,'store.details.selectedLang') || 'en';
    let lang = this.getKeyByValue(getLang) || 'english'
    let params = gaParmams({language:lang,type:npName+'-epaper-'})
    logEvent(params,{label:label})
  }

    componentWillReceiveProps(nextProps) {
      let det = this.store.viewRelatedDetails || _.at(this,'props.details') || _.at(this,'store.selectedIdDetails');
      let context = this;
      if(det.id===context.getIdFrmUrl()) {
        context.store.timespentCalculator('details',{id:det.id},'start');
        this.executeOnlyOnce();
      }

 /*     let det = _.at(this,'props.details') || _.at(this,'store.selectedIdDetails');
      if(this.isComponentMounted && det && det.moreData){
        this.setState({
          relatedData: det.moreData.relatedData,
          moreContent: det.moreData.moreContent
        });
        return;
      }
      if(this.isComponentMounted && (!this.state.relatedData || !this.state.moreContent)){
        this.updateDetails("Rprops");
      }*/
    }

  showHtml(content){
    let constentDimension = imgFormatter();
    if(!content){
      return <div></div>
    }
    if(content.indexOf('<p') === -1){
      content = `<p>${content}</p>`;
    }
    content = content.replace(/<p><!--INSTAGRAM/g,`<p class='instaProcess'>`);
    content = content.replace(/<p><!--TWEET/g,`<p class='tweetProcess'>`);
    content = content.replace(/-->/g,"");
    content = content.replace(/<!--NH-END-->/g,"");
    content = content.replace(/<!--NH-END/g,"");
    var processedIds = [];
    var processedtTweetIds = [];
    var parser=new DOMParser();
    var htmlDoc=parser.parseFromString(content, "text/html");
    var elements = [];
    if(htmlDoc && htmlDoc.body){
      _.each(htmlDoc.body.childNodes,((item)=>{
        if(item.localName){
          elements.push(item)
        }
      }));
    }
    return <div>{_.map(elements,(item)=>{
      if(item && ((item.localName === 'script') || (item.localName === 'blockquote'))){
        return "";
      }

      if(item && (item.localName === 'p')){
        if(item.className === "instaProcess"){
          let part1 = item.innerText.match(/_([^_]*)/g);
          let part1mod = part1 && part1[0].match(/\d/g)
          let part2 = part1mod && part1mod.join("")
          if(_.contains(processedIds,part2)){
            return "";
          }
          processedIds.push(part2);
          var instNumber;
          try {
            instNumber = instagramIdToUrlSegment(part2)
          }catch(ex){
            console.error(" Error converting Id to url:",ex)
          }
          if(!instNumber){
            return ""
          }
          return (
            <InstagramEmbed
              url={'https://instagr.am/p/'+instNumber+'/'}
              maxWidth={screen.width}
              hideCaption={false}
              containerTagName='div'
              protocol=''
            />
          )
        }
        if(item.className === "tweetProcess" ){
          let part1 = item.innerText.match(/_([^_]*)/g);
          let part1mod = part1 && part1[0].match(/\d/g)
          let part2 = part1mod && part1mod.join("")
          if(_.contains(processedtTweetIds,part2)){
            return "";
          }
          processedtTweetIds.push(part2);
          return (
            <Tweet
              tweetId={part2}
            />)
        }

        return <p dangerouslySetInnerHTML={{__html:(this.replaceAll('#DH_EMB_IMG_REP#__DHQ_',constentDimension,item.innerHTML))}}></p>;
      }
      else return <p dangerouslySetInnerHTML={{__html:(this.replaceAll('#DH_EMB_IMG_REP#__DHQ_',constentDimension,item.innerHTML))}}></p>;
    })}</div>
  }

    render() {
      let det = this.store.viewRelatedDetails || _.at(this,'props.details') || _.at(this,'store.selectedIdDetails');
      let redirectToPublisher =_.at(det,'webAttributes.redirectToPublisher');
      if(redirectToPublisher && (_.bool(redirectToPublisher)) && _.at(det,'publisherStoryUrl')){
        location.replace(_.at(det,'publisherStoryUrl'));
        return (<div></div>);
      }
      let srcKey = _.at(det,'sourceKey');
      let img1 = _.at(det,'contentImageUrl') || _.at(det,'contentImage.url') ;
      let img2 = _.at(det,'sourceFavicon.url');
      let showTopicsDiv = this.topicsComponent();

      let context = this;
      let sourceNm = _.at(det,'sourceNameEn') && det.sourceNameEn;
      let formattedSourceNm = sourceNm && sourceNm.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/\s+/g, "-")
      let sourceUrl = `/news/${context.store.selectedCountry}/${langMapping[context.store.selectedLang]}/${formattedSourceNm}-epaper-${det && det.sourceKey}`;
      let relatedData = _.at(context,'state.relatedData.rows');
      let toJsRelatedData = (relatedData && isObservableArray(relatedData)) ? toJS(relatedData) : relatedData;
      let shareUrl = _.at(det,'shareUrl');
      let title = _.at(det,'title');
      let videoUrl = _.at(det,'defaultPlayUrl');
      let content = _.at(det,'content') && _.at(det,'content').replace(/(<([^>]+)>)/ig,"").slice(0,299);
      let imgHt = this.imageSize();
      let timesAgo = det && moment(det.publishTime).format('D MMMM YYYY, h:mm a');
      let playing = det && (this.getIdFrmUrl() === det.id);
      let inViewPort = det && (this.getIdFrmUrl() === det.id);
      let detailShowcaseImage = imgFormatter(img1,{height:360,width:360});
      let relatedStories = translateRelated[context.store.selectedLang] || "Related Stories";
      let storyBlockType = _.at(det,'webAttributes.storyBlockingLevel');
      let blockMoreContent = storyBlockType && (_.contains(['block_all', 'block_all_chunks', 'block_second_chunk'],storyBlockType.toLowerCase()))
      let blockContent = storyBlockType && (storyBlockType.toLowerCase() === "block_all_chunks")
      let constentDimension = imgFormatter();
      let whatsAppUlr = this.shareUrl('whatsapp',{text:title+' '+shareUrl+('?ss=wsp&s='+deviceInfo.utmSrc())});
      let facebookUlr = this.shareUrl('facebook',{u: window.location.href+('?ss=fb&s='+deviceInfo.utmSrc()), title: title, description: content, picture: img1});
      let twitterUrl = this.shareUrl('twitter',{url: appendQuery(shareUrl,{ss:'twt',s:deviceInfo.utmSrc()}), text: title , via: "DailyhuntApp"});
      let emailUrl = this.shareUrl('email',{subject: title+" | DailyHunt\n", body:content + "\n\n"+ appendQuery(shareUrl,{ss:'em',s:deviceInfo.utmSrc()})+"\n\nvia Dailyhunt"});

      if(storyBlockType && (storyBlockType.toLowerCase() === "block_all")){
        return this.blockAllContent(img2);
      }


      if(det) {
        return (
          <div id="details" className="detailsWarp">
            {(videoUrl && inViewPort  ? (
              <div  style={{height:imgHt+'px',display: 'flex', justifyContent: 'center', backgroundImage:'url(' + detailShowcaseImage.webp + ')',backgroundSize:'99% 100%', backgroundRepeat:'no-repeat', backgroundPosition:'center center' }}>
                {(playing && navigator.onLine) && (
                  <iframe src={"https://www.youtube.com/embed/"+this.getYoutubeId(videoUrl)+'?autoplay=1'} frameborder="0" style={{width:"99%",height:imgHt+'px'}} frameborder="0" allowfullscreen></iframe>
                )}
              </div>)
              :(img1 ? (
                <LazyLoad height={imgHt}>
                    <picture style={{ height: imgHt }} className="hdImg">
                        {inViewPort && <source srcSet={detailShowcaseImage.webp} alt={""} type="image/webp"/>}
                        {inViewPort && <img src={detailShowcaseImage.jpg} alt={""} onLoad={context.onLoadImg.bind(context)} />}
                    </picture>
                </LazyLoad>
              ) : null))}

            <div className="infoBar">
              <div className="srcShare">
                <div className="src" onClick={this.onClickSource.bind(this,sourceUrl)}>
                  {(img2)?(
                    <LazyLoad height={'30px'}>
                      <picture className="logo">
                        {inViewPort && <img src={img2 || ""} alt=""/>}
                      </picture>
                    </LazyLoad>
                  ) : null}
                  <div className="info">
                    <span>{det.sourceNameUni}</span>
                    <em>{det.categoryName}</em>
                  </div>
                </div>
                {inViewPort && (<div className="share shr_wrp">
                  <ul>
                    <li>
                      <a href={facebookUlr}  onClick={(e) => this.sendEvent(e,'Facebook')}><span className="icn_fb"></span></a>
                    </li>
                    <li>
                      <a href={whatsAppUlr} onClick={(e) => this.sendEvent(e,'Whatsapp')}><span className="icn_wht"></span></a>
                    </li>
                  </ul>
                </div>)}
              </div>
            </div>
            <article style={{position :'relative'}}>
              <h1>{det.title}</h1>
              <div style={{ position:'absolute',zindex:999999,width:'100%',height:'100%',top:0,left:0 }}></div>
              <div className="wrp">
                {/*<div className="dt">{det.publishTime ? moment(det.publishTime).format('MMMM Do YYYY, h:mm a'):""}</div>*/}
                <div className="dt">{timesAgo ? timesAgo:""}</div>
              </div>
              <div dangerouslySetInnerHTML={{__html:(deviceInfo.fontCall(this.store.selectedLang))}}></div>
              {!blockContent && <div className="data" >{context.showHtml(this.replaceAll('#DH_EMB_IMG_REP#__DHQ_',constentDimension,det.content))}</div>}
              {context.state.moreContent ?
                (<div className="data"
                      id="moreContent">
                  {context.showHtml(context.state.moreContent)}
                </div>) : (blockMoreContent ? <div></div> : <LoadingGif/>)}
            </article>
            {inViewPort && (<div className="shr_wrp">
              <ul>
                <li>
                  <a href="javascript:void(0)" onClick={context.copy(context)}><span className="icn_copy"></span></a>
                </li>
                <li>
                  <a href={emailUrl} onClick={(e) => this.sendEvent(e,'Email')}><span className="icn_email"></span></a>
                </li>
                <li>
                  <a href={twitterUrl} onClick={(e) => this.sendEvent(e,'Twitter')}><span className="icn_twit"></span></a>
                </li>
                <li>
                  <a href={facebookUlr} onClick={(e) => this.sendEvent(e,'Facebook')}><span className="icn_fb"></span></a>
                </li>
                <li>
                  <a href={whatsAppUlr} onClick={(e) => this.sendEvent(e,'Whatsapp')}><span className="icn_wht"></span></a>
                </li>
              </ul>
            </div>)}

            {(blockContent || blockMoreContent) && context.playstoreDownloadContent()}
            {showTopicsDiv}

            {!_.at(this,'props.ignoreRelated') && inViewPort && relatedData && !_.isEmpty(toJsRelatedData) && (
              <div className="related">
                <div className="hd">
                  <h2>{relatedStories}</h2>
                </div>
                <div className="dh-list-item">
                  {toJsRelatedData.map(function(news, index) {
                      return (<div key={index} onClick={context.onClickRelated.bind(context, news.detailsPageUrl, news)}>
                        <NewsListing ignoreLink={true}
                                     item={news}/>
                      </div>)
                  })}
                </div>
              </div>
            )}
          </div>

        );

      }
      else return (<div><LoadingGif/></div>)
    }
}

export default withRouter(Details);
