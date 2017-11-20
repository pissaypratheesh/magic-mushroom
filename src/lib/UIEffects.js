/**
 * Created by pratheesh on 25/5/17.
 */
import {isProduction} from '../config/constants'
let UIEffects = {
  rippleClickListner(){
    document.addEventListener('click',function(e){
      if(e.target){
        UIEffects.addRippleEffect(e)
      }
    })
  },

  // Android ripple effect (full site)
  ripple() {
    var getRipClass = document.getElementsByClassName("ripWap");
    var child = document.createElement("div");
    child.setAttribute("class", "rip");
    for (let val of getRipClass) {
      val.appendChild(child.cloneNode(true));
    }
  },

  addRippleEffect(e, reactObj,surpass) {
    var target = e.target;
    var rect = target.getBoundingClientRect();
    var ripple = target.querySelector('.ripple');

    if (!ripple) {
      ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
      target.appendChild(ripple);
    }
    ripple.classList.remove('show');
    var top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
    var left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft;
    ripple.style.top = top + 'px';
    ripple.style.left = left + 'px';
    ripple.classList.add('show');
    return false;
  },

  showServerError(error){
    !isProduction && console.error("Server error:",error);
    if (error.response && !isProduction) {
      console.error("Error data:",error.response.data);
      console.error("Error status:",error.response.status);
      console.error("Error headers:",error.response.headers);
    }
    var errorbar = document.getElementById("errorbar");
    errorbar && errorbar.classList.add('show');
    setTimeout(function () {
      errorbar && errorbar.classList.remove('show')
    },2000);
  },

  // page scroll header show hide (landing)
  headerOnScroll(){
    var lastScrollTop = 0;
    window.addEventListener("scroll", function(){ // or window.addEventListener("scroll"....
      var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
      document.getElementById("header-scl").className = (st > lastScrollTop && (window.pageYOffset > 100)) ? "hdSclDn" : ((window.pageYOffset > 100) ? "hdSclUp" : "");
      lastScrollTop = st;
    }, this.store.isPassiveSupported ? { passive: true } : false );
  }

}
export default UIEffects
