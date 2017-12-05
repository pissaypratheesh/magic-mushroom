import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { Link } from 'react-router-dom'
import PropTypes from "prop-types";
import DataWrapper from "../components/common/DataWrapper";
import { inject, observer } from "mobx-react";
import { toJS } from "mobx"
import personalization from '../lib/personalization';
import {makeRequest} from "../lib/makeRequest";
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
    this.handleChangeStates = this.handleChangeStates.bind(this);
    this.handleChangeLocalities = this.handleChangeLocalities.bind(this);
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
      context.store.changeConnectionStatus({connection:connection});
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
  }

  componentWillUpdate(){

  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  handleChangeStates = (selectedOption) => {
    console.log("Selected:", selectedOption);
    let context = this;
    makeRequest({ urlList:[{url:'/apis/locality/cityId/'+selectedOption.cityId,method:'get'}],source:'client'},(err,resp)=>{
      if(_.at(resp,'0')){
        context.store.updateData({
          selectedCity: selectedOption,
          localities: _.map(_.at(resp,'0.data'),(val)=>{
            return _.deepExtend({
              label: val.localityName,
              value: val.localityId
            },val);
          })
        })
      }
    })
  }

  handleChangeLocalities = (options) => {
    console.log(" in handleChangeLoc-->",options)
    this.store.updateData({
      selectedLocality:options
    })
  }

  render() {
    let context = this;
    console.log(" selected city and locality-->",_.at(this,'store.selectedCity.cityName'),_.at(this,'store.selectedLocality.localityName'))
    return (
      <div>
        <header className="home-hd">
          <div className="aausadh-logo"></div>
          <div className="login"></div>
        </header>
        <section className="tp-pad home-data">
          <div className="inr">
            <h1>24x7 happy to help you in <span>Odisha</span></h1>
            <ul className="ctrl">
              <li>
                <Select
                  name="form-field-name"
                  value={_.at(this,'store.selectedCity') || ""}
                  onChange={this.handleChangeStates}
                  options={toJS(_.at(context,'store.cities') || [])}/>
              </li>
              <li>
                <Select
                  name="form-field-name"
                  value={_.at(this,'store.selectedLocality') || ""}
                  onChange={this.handleChangeLocalities}
                  options={toJS(_.at(context,'store.localities') || [])}/>
              </li>
              <li>
                <input type="text" placeholder="speciality, doctor, clinics, hospital,ambulance etc…"/>
              </li>
              <li>
                <Link to={"/list/city/locality"} className="btn col_blue FR">Search</Link>
                <a href="#" className="btn col_gry FR">Reset</a>
              </li>
            </ul>
          </div>
          <div className="navSlider">
            <ul>
              <li>
                <a href="">
                  <picture>
                    <img src="assets/img/img_doctor.jpg" alt=""/>
                  </picture>
                  <h2>Doctor</h2>
                </a>
              </li>
              <li>
                <a href="">
                  <picture>
                    <img src="assets/img/img_hospital.jpg" alt=""/>
                  </picture>
                  <h2>Hospitals</h2>
                </a>
              </li>
              <li>
                <a href="">
                  <picture>
                    <img src="assets/img/img_medicin.jpg" alt=""/>
                  </picture>
                  <h2>Medicine</h2>
                </a>
              </li>
              <li>
                <a href="">
                  <picture>
                    <img src="assets/img/img_amb.jpg" alt=""/>
                  </picture>
                  <h2>Ambulance</h2>
                </a>
              </li>
              <li>
                <a href="">
                  <picture>
                    <img src="assets/img/img_bldbnk.jpg" alt=""/>
                  </picture>
                  <h2>Blood bank</h2>
                </a>
              </li>
              <li>
                <a href="">
                  <picture>
                    <img src="assets/img/img_diagnostics.jpg" alt=""/>
                  </picture>
                  <h2>Diagnostics</h2>
                </a>
              </li>
            </ul>
          </div>
        </section>
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
