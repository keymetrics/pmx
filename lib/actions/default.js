
var fs = require('fs');
var path = require('path');

module.exports = function(pmx) {
  pmx.action('getEnv', function(reply) {
    process.nextTick(function() {
      return reply({ env : process.env });
    });
  });

  // pmx.action('getDeps', function(reply) {
  //   process.nextTick(function() {
  //     return reply({ module_cache : Object.keys(require('module')._cache) });
  //   });
  // });
}
