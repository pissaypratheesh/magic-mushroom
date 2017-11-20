
// wip
var _ = require('underscore');

module.exports = {
    at: at,
    deepExtend: deepExtend,
    bool: bool,
};

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
