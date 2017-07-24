
var probes = {
  'express': require('./express.js'),
  'mongo': require('./mongo.js')
};
var keys = Object.keys(probes);

module.exports = function (pmx, span) {
  if (!keys || !span || !span.name) return;
  keys.forEach(function (key) {
    if (new RegExp('/' + key + '/').match(span.name)) {
      probes[key](pmx, span);
    }
  });
};
