
module.exports = {
    at: at,
};


// at(o, 'a.b.c') // returns o.a.b.c, if it exists. use with caution.
// def => default

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

