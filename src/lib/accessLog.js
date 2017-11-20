var date = require('./date');
var _ = require('underscore');

/**
    options: optional arguments.
**/
module.exports = function(config) {

    var accessLog = config.accessLog;
    var exclusionPatterns = config.exclusionPatterns;
    if(!exclusionPatterns || !_.isArray(exclusionPatterns)){
        exclusionPatterns = [];
    }
    // access log middle ware. it should be at the begining as much as possible
    return function(req, res, next) {
        // avoid the health check pings and favicon
        if (_.contains(exclusionPatterns, req.path)) {
            return next();
        }
        if(!accessLog){
            return next();
        }
        var start = new Date();

        if (res._responseTime) return next();
        res._responseTime = true;

        // set a custom header to identify this is served by node
        res.setHeader('X-SB', 'N');
        res.on('finish', function() {
            var duration = new Date() - start;
            var msg = [
                date.getLocalTime(),
                ((req.ip !== req.clientIP) && req.clientIP) ? req.clientIP : req.ip,
                req.headers['x-forwarded-for'],
                req.originalUrl,
                res.statusCode,
                req.method,
                duration,
                req.headers.referer,
            req.headers['user-agent'],
            req.headers.accept,
              res._sent
            ];
            accessLog.write(msg.join('|'));
            accessLog.write("\n");
        });
        next();
    };
};
