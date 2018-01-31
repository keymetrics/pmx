var fs = require('fs');
var debug = require('debug')('axm:profiling');
var path = require('path');

var moduleUtils = {
  detectModule: function (moduleName, cb) {
    require.main = require.main || {paths: ['./node_modules', '/node_modules']};

    var requirePaths = require.main.paths.slice();

    (function lookForModule (requirePaths) {
      if (!requirePaths[0]) {
        debug('[x] %s NOT FOUND', moduleName);
        return cb(new Error(moduleName + ' not found'));
      }
      var profilerPath = path.join(requirePaths[0], moduleName);

      debug('Checking %s in path %s', moduleName, profilerPath);
      // node > v0.11.15
      if (fs.access) {
        fs.access(profilerPath, fs.R_OK || fs.constants.R_OK, function (err) {
          if (!err) {
            debug('[+] %s detected in path %s', moduleName, profilerPath);
            return cb(null, profilerPath);
          }

          debug('[-] %s not found in path %s', moduleName, profilerPath);
          requirePaths.shift();
          return lookForModule(requirePaths);
        });
      } else {
        // node version not supported
        return cb(new Error('Node\'s version not supported'));
      }
    })(requirePaths);
  }
};

module.exports = moduleUtils;
