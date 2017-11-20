module.exports = function(req, res, next) {
    req.clientIP = req.ip;
    //console.log("Client IP before:"+ req.ip + " : url:"+req.url);
    if(getUserIP){
        var ip = getUserIP(req);
        req.clientIP = ip ? ip : req.clientIP;
        res.setHeader('clientip',req.clientIP);
        res.clientIP = req.clientIP;
    }
    //console.log("Client IP after:"+ req.clientIP);
    next();
};

var ip2long = function(IP) {
    //  discuss at: http://phpjs.org/functions/ip2long/
    // original by: Waldo Malqui Silva
    // improved by: Victor
    //  revised by: fearphage (http://http/my.opera.com/fearphage/)
    //  revised by: Theriault
    //   example 1: ip2long('192.0.34.166');
    //   returns 1: 3221234342
    //   example 2: ip2long('0.0xABCDEF');
    //   returns 2: 11259375
    //   example 3: ip2long('255.255.255.256');
    //   returns 3: false

    var i = 0;
    // PHP allows decimal, octal, and hexadecimal IP components.
    // PHP allows between 1 (e.g. 127) to 4 (e.g 127.0.0.1) components.
    IP = IP.match(
    /^([1-9]\d*|0[0-7]*|0x[\da-f]+)(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?$/i
    ); // Verify IP format.
    if (!IP) {
        // Invalid format.
        return false;
    }
    // Reuse IP variable for component counter.
    IP[0] = 0;
    for (i = 1; i < 5; i += 1) {
        IP[0] += !! ((IP[i] || '').length);
        IP[i] = parseInt(IP[i], 10) || 0;
    }
    // Continue to use IP for overflow values.
    // PHP does not allow any component to overflow.
    IP.push(256, 256, 256, 256);
    // Recalculate overflow of last component supplied to make up for missing components.
    IP[4 + IP[0]] *= Math.pow(256, 4 - IP[0]);
    if (IP[1] >= IP[5] || IP[2] >= IP[6] || IP[3] >= IP[7] || IP[4] >= IP[8]) {
        return false;
    }
    return IP[1] * (IP[0] === 1 || 16777216) + IP[2] * (IP[0] <= 2 || 65536) + IP[3] * (IP[0] <= 3 || 256) + IP[4] * 1;
};
/** Function to check if the IP is in valid external IP range.
* I stores the private IP ranges in an array and marks any IP lying in the
* private IP range as invalid
* @param IP string representation of the the client IP in 4 octets
* @return boolean true in case IP is valid external and false if the IP is in private IP range
*/
var isIPValid = function(IP) {
    if(!IP){
        return false;
    }
    var longip = ip2long(IP);
    //console.log('longip='+longip + ' for ip='+IP);
    if (IP && longip!==-1 && longip!==false) {
        var private_ips = [
            ['0','50331647'],           // array('0.0.0.0','2.255.255.255'),
            ['167772160','184549375'],  // array('10.0.0.0','10.255.255.255'),
            ['2130706432','2147483647'],// array('127.0.0.0','127.255.255.255'),
            ['2851995648','2852061183'],// array('169.254.0.0','169.254.255.255'),
            ['2886729728','2887778303'],// array('172.16.0.0','172.31.255.255'),
            ['3221225984','3221226239'],// array('192.0.2.0','192.0.2.255'),
            ['3232235520','3232301055'],// array('192.168.0.0','192.168.255.255'),
            ['4294967040','4294967295'] // array('255.255.255.0','255.255.255.255')
           ];

       for(var rangeKey in private_ips) {
            var min = private_ips[rangeKey][0];
            var max = private_ips[rangeKey][1];
            //console.log('range min='+min+' max='+max);
            if ((longip >= min) && (longip <= max)){
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
};

/**
* Function to retrieve the users real IP by resolving accross various PHP headers
* and filtering out the proxy IPs if any
*/
var getUserIP = function(req){
    //console.log(req.headers);
    if (isIPValid(getHeader(req, "TRUE_CLIENT_IP"))) {
        return getHeader(req, "TRUE_CLIENT_IP");
    }
    //console.log('req.connection.remoteAddress='+req.connection.remoteAddress);
    if (req.connection && req.connection.remoteAddress && isIPValid(req.connection.remoteAddress)) {
        return req.connection.remoteAddress;
    }
    // Accessing IPs from left to right in XFF ip range
    if(getHeader(req, "X-Forwarded-For")){
        var xffIPArr = getHeader(req, "X-Forwarded-For").split(',');
        for (var ip in xffIPArr) {
            if (isIPValid(xffIPArr[ip].trim())) {
                return xffIPArr[ip];
            }
        }
    }
    return "";
};

var getHeader = function(req,headerName){
    if(!headerName || typeof(headerName) != 'string'){
        return '';
    }
    if(req.headers[headerName]){
        return req.headers[headerName];
    }
    if(req.headers[headerName.toLowerCase()]){
        return req.headers[headerName.toLowerCase()];
    }
    return "";
};
