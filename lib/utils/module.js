var fs = require('fs');
var debug = require('debug')('axm:profiling');
var path = require('path');

var moduleUtils = {
    detectModule: function(module_name, cb) {
        require.main = require.main || {paths: ['./node_modules', '/node_modules']};

        var require_paths = require.main.paths.slice();

        (function look_for_module (require_paths) {
            if (!require_paths[0]) {
                debug('[x] %s NOT FOUND', module_name);
                return cb(new Error(module_name + ' not found'));
            }
            var profiler_path = path.join(require_paths[0], module_name);

            debug('Checking %s in path %s', module_name, profiler_path);
            // node > v0.11.15
            if (fs.access) {
                fs.access(profiler_path, fs.R_OK || fs.constants.R_OK, function (err) {
                    if (!err) {
                        debug('[+] %s detected in path %s', module_name, profiler_path);
                        return cb(null, profiler_path);
                    }

                    debug('[-] %s not found in path %s', module_name, profiler_path);
                    require_paths.shift();
                    return look_for_module(require_paths);
                });
            } else {
                // node version not supported
                return cb(new Error('Node version not supported'));
            }
        })(require_paths);
    }
};

module.exports = moduleUtils;
