var date = require('../date'),
    _ = require('underscore');

module.exports = function() {
   /*
        Instrumentation middleware.
    */
    return function(req, res, next) {
        var start = Date.now();
        res.on('finish', function() {
            var duration = Date.now() - start;
            //console.log(" yhooooo in dureaion-->",duration,req.url);
        });
        next();
    };
};
