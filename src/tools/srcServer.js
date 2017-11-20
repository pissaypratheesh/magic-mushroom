import express from 'express';
import webpack from 'webpack';
import path from 'path';
import { isProduction, assetsExpiry, bundleExpiry} from '../config/constants'
import configDev from '../webpack.config.dev';
import configProd from '../webpack.config.prod';

const port = 1443;
const app = express();
const compiler = isProduction ? webpack(configProd) : webpack(configDev);
const api = require('../server/api/index');
var ipLocator = require('ip-locator')
var fs = require("fs");
var bodyParser = require('body-parser');
var compression = require('compression');
var countResponseSize = require('count-response-size-middleware');
var _ = require('underscore');
_.mixin(require('../lib/mixins'));

//For logs
app.rootDir = path.resolve(__dirname, isProduction ? '../../../'  : '../../');
app.logPath = path.resolve(__dirname, isProduction ? '/mnt/vol2/dh-wap-data/node-logs/'  : '../../');
var accessLogFile =  path.join(app.logPath,'logs', 'pwa.access.log');
var accessLog = fs.createWriteStream(accessLogFile , {flags: 'a+'});
app.use(countResponseSize());
app.use(require('../lib/accessLog')({'accessLog': accessLog}));
// Middle ware to add req.clientIP from TRUE_CLIENT_IP/XFF/ClientIP
app.use(require('../lib/clientIP.js'));
app.use(require('../lib/middlewares/instrument')({
  app: 'pwa',
  prefix: ".web."
}));

app.use("/pwa",function (req, res, next) {
  var file = path.join(app.rootDir,'pwa.html');
  fs.exists(file, function(exists) {
    if (exists) {
      res.sendFile(file);
      return;
    } else {
     return  res.status(500).send({error: "No such file"})
    }
  });
 });

app.use("/hc.html",function (req, res, next) {
  var file = path.join(app.rootDir,'pwa.html');
  fs.exists(file, function(exists) {
    if (exists) {
      res.sendFile(file);
      return;
    } else {
     return  res.status(500).send({error: "No such file"})
    }
  });
 });

app.use(function(req, res, next) {
  var ip = (req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress).split(",")[0];
  ipLocator.getDomainOrIPDetails(ip,'json', function (err, data) {
    //console.log(" data err-->",err,data,typeof data)
    res.setHeader('ip',ip);
    !err && _.isObject(data) && res.setHeader('clientData',JSON.stringify(data));
    next();
  });
});
app.use(compression());
app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: isProduction ? configProd.output.publicPath : configDev.output.publicPath,
  headers:{'Cache-Control': 'public, max-age=' + bundleExpiry}
}));
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json())
app.use("/assets", express.static("assets",{
  maxAge: assetsExpiry
}));
app.use("/src", express.static("src",{
  maxAge: assetsExpiry
}));

app.use("/assets/img", express.static("assets/img",{
  maxAge: assetsExpiry
}));
app.use("/dist", express.static("dist",{
  maxAge: assetsExpiry
}));
app.use("/swhelper.js", function(req, res) {
  let pathToFile =  isProduction ? path.join( __dirname, '../../../src/swHelper.js'): path.join( __dirname, '../../src/swHelper.js');
  res.setHeader('Cache-Control', 'public, max-age=' + bundleExpiry);
  res.sendFile(pathToFile);
});

app.use(require('webpack-hot-middleware')(compiler));

app.use(api);

app.get('*', function(req, res) {
  let pathToIndex =  isProduction ? path.join( __dirname, '../../../index.html'): path.join( __dirname, '../../indexDev.html');
  res.setHeader('Cache-Control', 'public, max-age=0');
  return res.sendFile(pathToIndex);
});

app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`http://localhost:${port}`);
  }
});
