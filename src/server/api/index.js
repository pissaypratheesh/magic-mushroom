/**
 * Created by pratheesh on 19/5/17.
 */

var express = require('express');
var router = express.Router()
var urlMap = require('../../config/urls.js');

var _ = require('underscore');
var path = require('path');
var ipLocator = require('ip-locator')
var defHeader =  require('../../lib/httpHeader');
const webpush = require('web-push');
const queryString = require('query-string')
import {makeRequest} from "../../lib/makeRequest"
import { cacheAPIHeader, isProduction } from '../../config/constants'
import {StoSTimeout} from '../../config/constants'
import jsonFormatter from '../jsonFormatter';
import statesMapping from '../../config/statesMapping'

let header = {
  headers:defHeader.header
};
let cacheHeaders = 'public, max-age=' + cacheAPIHeader;
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

router.get('/apis/cities/:state',function (req, res) {

  var urlObj = {urlList:[{url:urlMap.cities + (statesMapping[req.params.state] || 1),timeout:timeout.timeout, headers:header.headers, method:'get'}]}
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      //return res.status(500).send({error: "server error"});
    }
    return res.status(200).json([
      {name:'blr'},{name:'hyd'},{name:'mys'}
      ]);
  });
})


//Below to be deleted


router.all('/apis/news', function(req, res) {
  var url = req.query.url ? decodeURIComponent(req.query.url) : (urlMap.news  + (req.query.langCode || "en") );
  var reqQuery = req.query;
  if(req.query.url){
    reqQuery = queryString.parse(url.split("?")[1])
  }
  !_.isUndefined(req.query.nextIndex) && (reqQuery.nextIndex = req.query.nextIndex)

  //Supports multiple calls at ones, like url0, url1, url2
  if(req.query.url0){
    return jsonFormatter.fetchMultipleNews(req,function (resObj,err) {
      var respObj = _.extend({},{results: resObj},req.query)
      if(!err){
        //res.setHeader('Cache-Control',cacheHeaders);
        return res.status(200).send(respObj)
      }
      return res.status(500).send({error:"server error"});
    });
  }
  var urlObj = {urlList:[{url,timeout:timeout.timeout, headers:header.headers, method:'get'}]}
  return makeRequest(urlObj,(err, resp)=>{
    if(err){
      return res.status(500).send({error:"server error"});
    }
    var formattedResp = jsonFormatter.news(resp[0], _.deepExtend({},reqQuery,req.query));
    formattedResp && _.extend(formattedResp,req.query);
    //res.setHeader('Cache-Control',cacheHeaders);
    return res.status(200).json(formattedResp);
  })
});

router.get('/apis/proxy',function (req, res) {
  var urlObj = {urlList:[{url:decodeURIComponent(req.query.url),timeout:timeout.timeout, headers:header.headers, method:'get'}]};
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      return res.status(500).send({error: "server error"});
    }
    //res.setHeader('Cache-Control', cacheHeaders);
    return res.status(200).json(_.at(resp, '0.data') || {});
  })
});

router.get('/apis/moredetails',function (req, res) {
  jsonFormatter.moreDetails(req, function (err, data) {
    if(err){
      return res.status(500).send({error: err});
    }
    return res.status(200).json(data);
  })
});

//This is for fetching landing newspage topics like entertainment etc
router.get('/apis/alltopics', function(req, res) {
  return jsonFormatter.fetchAllTopicsWithData(req,function (err,resp) {
    if(err || !resp){
     return res.status(500).send({error: "server error"});
    }
    //res.setHeader('Cache-Control',cacheHeaders);
    return res.status(200).send(resp)
  })
});

//This is for fetching landing newspage topics like entertainment etc
router.post('/apis/getclientid', function(req, res) {
  var urlObj = {urlList:[{url:urlMap.getClientId, source:'server', timeout:timeout.timeout, headers:header.headers, method:'post', body:req.body}]};
  return res.status(200).json({clientid: "pratheesh"});
  /*return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      //return res.status(500).send({error: "server error"});
    }
    return res.status(200).json({clientid: "pratheesh"});
  })*/
});

//This is for fetching topics landing newspage topics like entertainment etc
router.get('/apis/topics', function(req, res) {
  var urlObj = {urlList:[{url:urlMap.topics + (req.query.langCode || "en"),timeout:timeout.timeout, headers:header.headers, method:'get'}]};
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      return res.status(500).send({error: "server error"});
    }
    //res.setHeader('Cache-Control', cacheHeaders);
    return res.status(200).json(jsonFormatter.trends(resp && resp[0]));
  })
});

router.get('/apis/details/:id', function(req, res) {
  if(!req.params.id) {
    return res.status(500).send("Id required");
  }
  var urlObj = {urlList:[{url:urlMap.details + req.params.id,timeout:timeout.timeout, headers:header.headers, method:'get'}]};
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      return res.status(500).send({error: "server error"});
    }
    //res.setHeader('Cache-Control', cacheHeaders);
    return res.status(200).json(jsonFormatter.details(resp && resp[0]));
  })
});

router.get('/apis/detailsdirect/:id',function (req, res) {
  if(!req.params.id) {
    return res.status(500).send("Id required");
  }
  jsonFormatter.detailsdirect(req,function (err,respObj) {
    if(err){
      return res.status(500).send("Id required");
    }
    return res.status(200).json(respObj);
  })
});

router.get('/apis/allgroups', function(req, res) {
  var urlObj = {urlList:[{url:urlMap.group,timeout:timeout.timeout, headers:header.headers, method:'get'}]};
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      return res.status(500).send({error: "server error"});
    }
    var formattedResp = jsonFormatter.groups(resp&&resp[0], req.query.langCode || "en");
    _.extend(formattedResp,req.query);
    //res.setHeader('Cache-Control',cacheHeaders);
    return res.status(200).json(formattedResp);
  })
});

router.get('/apis/languages', function(req, res) {
  var urlObj = {urlList:[{url:urlMap.lang,timeout:timeout.timeout, headers:header.headers, method:'get'}]};
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      return res.status(500).send({error: "server error"});
    }
    //res.setHeader('Cache-Control', cacheHeaders);
    return res.status(200).json(jsonFormatter.languages(resp && resp[0]));
  })
});

router.get('/apis/npByCategory', function(req, res) {
  var url = req.query.url || (urlMap.npByCategory  + (req.query.edition || "india") + "&langCode=" + (req.query.langCode || "en") + "&groupKey=" + (req.query.grpKey || "news") + "&pageSize=" + (req.query.pageSize || "20"));
  var urlObj = {urlList:[{url:url,timeout:timeout.timeout, headers:header.headers, method:'get'}]};
  return makeRequest(urlObj,(err, resp)=> {
    if (err) {
      return res.status(500).send({error: "server error"});
    }
    var formattedResp = jsonFormatter.npByCategory(resp&&resp[0]);
    _.extend(formattedResp, req.query);
    //res.setHeader('Cache-Control',cacheHeaders);
    return res.status(200).json(formattedResp);
  })
});

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

