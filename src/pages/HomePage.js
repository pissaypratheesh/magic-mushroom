import React from 'react';
import SideMenu from '../components/SideMenu'
import PropTypes from "prop-types";
import DataWrapper from "../components/common/DataWrapper";
import { inject, observer } from "mobx-react";
import personalization from '../lib/personalization';
var address = require('address');
var _ = require('underscore');
_.mixin(require('../lib/mixins'));

@inject("store")
@DataWrapper
@observer
class HomePage extends React.Component {
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
    let context = this;
    let reloadExcludeUrlList = ["-newsid-"];
    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    // check internet connection
    window.onload = function () {
      updateStatus('load');
    }

    //Network connection data
    function updateConnectionStatus(e,f) {
      address(function (err, data) {
        context.store.changeConnectionStatus({ip:data, connection:connection});
      });
    }
    updateConnectionStatus();
    connection.onchange = updateConnectionStatus;



    window.addEventListener('load', function() {
        function updateOnlineStatus(event) {
          updateStatus(event);
          //document.querySelector('.connection').innerHTML = condition;
        }
        window.addEventListener('online',  updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
      document.getElementById("closeBtn") && document.getElementById("closeBtn").addEventListener("click", closeOfflineMsg);

        function closeOfflineMsg() {
          offlineMsgBar.classList.remove('show');
        }
      });


      function updateStatus(event){
        var offlineMsgBar = document.getElementById("snackbar");
        var loaderClass = document.getElementsByClassName("dot-loader");
        var loader = loaderClass && loaderClass[0];
        var refrshMsg = document.getElementById("refershBar");
        var connectionMsg = document.getElementById("connectionMsg");
        if (navigator.onLine) {
          if(!context.store.isOnline){
            document.body.className = "online";
            _.each(reloadExcludeUrlList,(substr)=>{
              if(window.location.pathname && (window.location.pathname.indexOf(substr) === -1)){
                window.location.reload();
              }
            })
          }
          context.store.changeOnlineStatus(true);
          offlineMsgBar.classList.remove('show');
          if(refrshMsg){
            refrshMsg.style.display = "block";
            offlineMsgBar.classList.remove('show');
          }
          return;
        }
        context.store.changeOnlineStatus(false);
        offlineMsgBar.classList.add('show');
        document.body.className = "offline";
        if(refrshMsg){
          refrshMsg.style.display = "none";
        }
      }
    // Make refresh button appear after 10 minutes
    setInterval(
      function(){
        let refreshButton = document.querySelector(".ref_btn");
        if (refreshButton) {
          refreshButton.style = null;
        }
      }
      , (600000));

    //window.onpopstate = (e) => {console.log(" back press on homepage")}
    /*let selId = _.at(this,'store.selectedIdDetails.id')
    //Scroll to the Id the user was in before going to details page
    if(selId) {
      var el = document.getElementById(selId);
      el && (el.scrollIntoView());
      window.scrollTo(0, this.store.selectedIdNewsOffset || 0);
    }
  }

  componentDidUpdate(a,b,c){
/*
    let selId = _.at(this,'store.selectedIdDetails.id')
    console.log(" in didupdate of homepageup and selId and offset-->",selId,this.store.selectedIdNewsOffset )
    //Scroll to the Id the user was in before going to details page
    if(selId) {
      var el = document.getElementById(selId);
      el && (el.scrollIntoView());
      window.scrollTo(0, this.store.selectedIdNewsOffset || 0);
      //this.store.clearScrollOffset();
    }
*/
  }

  componentWillUpdate(){

  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
/*    let selId = _.at(this,'store.selectedIdDetails.id')

    //Scroll to the Id the user was in before going to details page
    if(selId) {
      var el = document.getElementById(selId);
      el && (el.scrollIntoView());
      window.scrollTo(0, this.store.selectedIdNewsOffset || 0);
      this.store.clearScrollOffset();
    }*/
  }



  render() {

    let context = this;
    let news = _.at(context,'store.news.rows');
    return (
      <div className={`lang_${context.store.selectedLang}`}>
        <SideMenu {...this.props}/>
        {(this.store.activeNav!=="all-categories") &&
          context.store.isOnline &&
          (<div className="ref_btn"
            style={{display: "none"}}
            onClick={() => {location.reload(true);}}></div>)}
      </div>
    )
  }
}

export default HomePage;
