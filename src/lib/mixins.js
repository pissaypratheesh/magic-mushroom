
// wip
var zlib = require('zlib')
var _ = require('underscore');

module.exports = {
    at: at,
    deepExtend: deepExtend,
    bool: bool,
    isElementVisible: isElementVisible,
    roundToFloorDecimal: roundToFloorDecimal,
    screenResRoundOff: screenResRoundOff,
    removeFalsyValues: removeFalsyValues,
    gzipJson: gzipJson
};

function gzipJson(json, cb) {
   if(json && _.isObject(json)){
     zlib.gzip(JSON.stringify(json),function (err, buffer) {
       cb(err,buffer);
     })
   }
}

function removeFalsyValues(obj){
  if(obj && !_.isEmpty(obj)){
    Object.keys(obj).forEach(key =>
      (obj[key] && typeof obj[key] === 'object') && removeFalsyValues(obj[key]) ||
      (!obj[key]) && delete obj[key]
    );
    return obj;
  }
  return {}
}

function roundToFloorDecimal(val) {
  return ((Math.floor(val/10))*10)
}

function screenResRoundOff(str){
  if(str && _.isString(str)){
    str = str.toLowerCase();
    var values = str.includes('x') && str.split('x');
    if(values){
      return (roundToFloorDecimal(+values[0]) + 'x' + roundToFloorDecimal(+values[1]));
    }
  }
}

function isElementVisible(el) {
  var rect     = el.getBoundingClientRect(),
    vWidth   = window.innerWidth || doc.documentElement.clientWidth,
    vHeight  = window.innerHeight || doc.documentElement.clientHeight,
    efp      = function (x, y) { return document.elementFromPoint(x, y) };

  // Return false if it's not in the viewport
  if (rect.right < 0 || rect.bottom < 0
    || rect.left > vWidth || rect.top > vHeight)
    return false;

  // Return true if any of its four corners are visible
  return (
  el.contains(efp(rect.left,  rect.top))
  ||  el.contains(efp(rect.right, rect.top))
  ||  el.contains(efp(rect.right, rect.bottom))
  ||  el.contains(efp(rect.left,  rect.bottom))
  );
}

function at(o, path, def) {
  var pointer = o,
      failed = false;

  if (!o || !path) {
      return o;
  }
  _.each(path.split('.'), function(p) {
      if (pointer[p] !== null && pointer[p] !== undefined && !failed) {
          pointer = pointer[p];
      } else {
          failed = true;
      }
  });
  return failed ? (o[path] || def) : pointer;
}

function deepExtend(obj) {
    var parentRE = /#{\s*?_\s*?}/,
        slice = Array.prototype.slice,
        hasOwnProperty = Object.prototype.hasOwnProperty;

    _.each(slice.call(arguments, 1), function(source) {
        _.each(source, function(_v_, prop) {
            if (_.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop])) {
                obj[prop] = source[prop];
            } else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
                if (_.isString(obj[prop])) {
                    obj[prop] = source[prop].replace(parentRE, obj[prop]);
                }
            } else if (_.isArray(obj[prop]) || _.isArray(source[prop])) {
                if (!_.isArray(obj[prop]) || !_.isArray(source[prop])) {
                    throw 'Error: Trying to combine an array with a non-array (' + prop + ')';
                } else {
                    obj[prop] = _.reject(deepExtend(obj[prop], source[prop]), function(item) {
                        return _.isNull(item);
                    });
                }
            } else if (_.isObject(obj[prop]) || _.isObject(source[prop])) {
                if (!_.isObject(obj[prop]) || !_.isObject(source[prop])) {
                    throw 'Error: Trying to combine an object with a non-object (' + prop + ')';
                } else {
                    obj[prop] = deepExtend(obj[prop], source[prop]);
                }
            } else {
                obj[prop] = source[prop];
            }
        });

    });
    return obj;
}

//return boolean 0,1,"0", "1" , true, false, 'true', 'false'

function bool(val) {
    if (_.contains(['true', true, '1', 1, 'y', 'Y'], val)) {
        return true;
    } else if (_.contains(['false', false, '0', 0, 'n', 'N'], val)) {
        return false;
    }
    return val;
}
