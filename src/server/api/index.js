/**
 * Created by pratheesh on 19/5/17.
 */

var express = require('express');
var router = express.Router()
var urlMap2 = require('../../config/urls2.js');
var _ = require('underscore');
var path = require('path');
const webpush = require('web-push');
const queryString = require('query-string')
import {makeRequest} from "../../lib/makeRequest"
import {  isProduction } from '../../config/constants'
import {StoSTimeout} from '../../config/constants'
import jsonFormatter from '../jsonFormatter';
import {urlMap, baseUrl} from '../../config/urls2'
let cacheHeaders = 'public, max-age=' + 180;
const timeout = { timeout: StoSTimeout};
_.mixin(require('../../lib/mixins'));

var subscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/e6XqMp84Zd0:APA91bEYLJSBlEVI5ONzEHp4nDP…8dlFXk-UB71rP_UFs3tVFGfgSFhNWQaet0B7CECFCpyOIal0Zl--g9U1gBqqAulF04sD6i76zo","keys":{"p256dh":"BDO-AvR-q_cEyyallnqkRteTjk-to61HRmYctG7wslvdjsEW9Uk_BSSsHj1BrYptjKHIM1gbULAKWbboNEAhpO0=","auth":"3y5ZEHpm13K9Z85ozBbuZQ=="}};

const vapidKeys = {
  publicKey:
    'BHgQFissFxXid62unZLcaLguw9GkC3yW0CqQgYFfMUwMRpONtn3FCZy1f8Sn1jbPZkHJBRJQne0avDvM_65OmW4',
  privateKey: 'LABjE2_ZR1abzzWYy1pxGeJ2OTQgs26A-ZkhCEFkAZA'
};

var dataToSend = {"title" : 'Pratheesh user defined notif title',
  "body" : 'here is the sample push notification',
  "icon" : '/assets/img/homescreen144.png',
  "targetUrl" : "localhost:3000"
};

var options = {
  TTL: 60,
  //gcmAPIKey: 'AAAABqIBo4I:APA91bG33XLEm8qRU1lEl5OGoDP9qKakoZhhYSrpYvcdep7wWLsq4kRPiVC3ozp0EJiRLhwP0V6cFBK9WtPcvGKgphQJHDX4u0Gi1IHlZvYyF32DQ59qAZcAme9qyQeAOhvPgrreJQBg',
  vapidDetails: {
    subject: 'mailto:pissaypratheesh@gmail.com',
    publicKey:vapidKeys.publicKey,
    privateKey:vapidKeys.privateKey
  }
};

function extractSignature(cookie) {
  if(cookie){
    let list = cookie.split(';');
    return _.find(list,(val)=>{
      let keyVal = val.split('=');
      return (keyVal[0] === signatureName);
    });
  }
}
router.get('/apis/*',function (req, res) {
  console.log(" urllll-->",baseUrl + req.url.split('/apis')[1]);
  var urlObj = {urlList:[{url: baseUrl + req.url.split('/apis')[1],timeout:timeout.timeout, method:'get', clientReq : req}],source:'server'}
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      return res.status(500).send({error: "server error"});
    }
    return res.status(200).json(_.at(resp,'0.data')||{});
  });
})

router.post('/apis/pushnotification',function(req, res){
  var data = req.body.dataToSend || dataToSend
  return webpush.sendNotification(req.body || subscription, JSON.stringify(data), options)
    .then(function(data){
      //return res.status(200).send(data||{});
      res.send(JSON.stringify({ data: { success: true } }));
    })
    .catch((err) => {
      if(err.statusCode === 400) {
        console.error("Invalid request.");
      }
      else if(err.statusCode === 404) {
        console.error("Not Found. This is an indication that the subscription is expired and can't be used.");
        //return deleteSubscriptionFromDatabase(subscription._id)
      }
      else if (err.statusCode === 410) {
        console.error("\n\n errr-->",err)
        //return deleteSubscriptionFromDatabase(subscription._id);
      }
      else if(err.statusCode === 413) {
        console.error("Payload size too large. The minimum size payload a push service must support is 4096 bytes (or 4kb).");
      }
      else if(err.statusCode === 429) {
        console.error("Too many requests.");
      }
    });
});

// router.get("/manifest.json", function(req, res) {
//   res.sendFile(path.join(__dirname + "/../../../assets/manifest.json"));
// });

router.get("/sw-toolbox.js", function(req, res) {
  var pathRelative = (isProduction) ? "/../../../../node_modules/sw-toolbox/sw-toolbox.js" : "/../../../node_modules/sw-toolbox/sw-toolbox.js"
  res.sendFile(path.join(__dirname + pathRelative));
});

router.get("/sw.js", function(req, res) {

  res.set({
    "Content-Type": "application/javascript",
    "Cache-Control": "private, no-cache, must-revalidate, max-age=0",
    "Service-Worker-Allowed": "/",
    Expires: "-1",
    Pragma: "no-cache"
  });
  res.sendFile(path.resolve(__dirname + "/../../sw.js"));
});



module.exports = router;

