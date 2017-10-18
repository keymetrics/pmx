
var debug     = require('debug')('axm:dependencies');
var childProcess = require('child_process');
var Transport = require('./utils/transport.js');

var Dependencies = {};

Dependencies.collect = function() {
  childProcess.execFile(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['ls', '--json', '--production'], {
    maxBuffer: 1024 * 1024
  }, function (error, stdout, stderr) {
    if (error) {
      // ignore
    }

    var parsedDependencies
    try {
      parsedDependencies = JSON.parse(stdout).dependencies

      if (!parsedDependencies) {
        debug('No modules found for project');
        return
      }
    } catch (ex) {
      debug('Error when getting modules');
      return false;
    }

    Object.keys(parsedDependencies).forEach(function(dep_key, index) {
      if (parsedDependencies[dep_key] && parsedDependencies[dep_key].dependencies) {
        // Delete sub dependencies
        delete parsedDependencies[dep_key].dependencies;
      }
    });

    Transport.send({
      type : 'application:dependencies',
      data : parsedDependencies
    });
  })
}

module.exports = Dependencies;
