
var debug     = require('debug')('axm:profiling');
var os        = require('os');
var path      = require('path');
var fs        = require('fs');

var Options   = require('../configuration.js');

var Profiling = module.exports = {};

Profiling.exposeProfiling = function(pmx, profiler_path) {
  try {
    var profiler = require(profiler_path);
  } catch(e) {
    console.error('error when requiring v8_profiler on path', profiler_path);
    console.error(e);
    return false;
  }

  debug('v8-profiler sucessfully enabled');

  /**
   * Tell Keymetrics that profiling is possible
   * (flag available in axm_options object)
   */
  Options.configureModule({
    heapdump : true
  });

  /**
   * Heap snapshot
   */
  pmx.action('km:heapdump', function(reply) {
    var dump_file = path.join(os.tmpdir(), Date.now() + '.heapsnapshot');

    var snapshot = profiler.takeSnapshot('km-heap-snapshot');
    var buffer    = '';

    snapshot.serialize(
      function iterator(data, length) {
        buffer += data;
      }, function complete() {
        snapshot.delete();

        fs.writeFile(dump_file, buffer, function (err) {
          debug('Heap dump file flushed (e=', err);

          if (err) {
            return reply({
              success   : false,
              err : err
            });
          }
          return reply({
            success   : true,
            heapdump  : true,
            dump_file : dump_file
          });
        });
      }
    );
  });

  /**
   * CPU profiling snapshot
   */
  var ns_cpu_profiling        = 'km-cpu-profiling';
  var cpu_dump_file = path.join(os.tmpdir(), Date.now() + '.cpuprofile');

  pmx.action('km:cpu:profiling:start', function(reply) {
    profiler.startProfiling(ns_cpu_profiling);
    return reply({ success : true });
  });

  pmx.action('km:cpu:profiling:stop', function(reply) {
    var cpu = profiler.stopProfiling(ns_cpu_profiling);

    fs.writeFile(cpu_dump_file, JSON.stringify(cpu), function(err) {
      if (err) {
        return reply({
          success   : false,
          err : err
        });
      }
      return reply({
        success     : true,
        cpuprofile  : true,
        dump_file   : cpu_dump_file
      });
    });
  });

};

/**
 * Discover v8-profiler
 */
Profiling.detectV8Profiler = function(module_name, cb) {
  require.main = require.main || {paths: ['./node_modules', '/node_modules']};

  var require_paths = require.main.paths.slice();

  (function look_for_profiler(require_paths) {
    if (!require_paths[0]) {
      debug('[x] %s NOT FOUND', module_name);
      return cb(new Error('v8-profiler not found'));
    }
    var profiler_path = path.join(require_paths[0], module_name);

    debug('Checking %s in path %s', module_name, profiler_path);
    // node > v0.11.15
    if(fs.access){
      fs.access(profiler_path, fs.R_OK || fs.constants.R_OK, function(err) {
        if (!err) {
          debug('[+] %s detected in path %s', module_name, profiler_path);
          return cb(null, profiler_path);
        }

        debug('[-] %s not found in path %s', module_name, profiler_path);
        require_paths.shift();
        return look_for_profiler(require_paths);
      });
    }else{
      // node < v0.11.15
      fs.exists(profiler_path, function(exist) {
        if (exist) {
          debug('[+] %s detected in path %s', module_name, profiler_path);
          return cb(null, profiler_path);
        }

        debug('[-] %s not found in path %s', module_name, profiler_path);
        require_paths.shift();
        return look_for_profiler(require_paths);
      });
    }

    return false;
  })(require_paths);
};

Profiling.v8Profiling = function(pmx) {
  Profiling.detectV8Profiler('v8-profiler', function(err, profiler_path) {
    if (err) {
      return Profiling.detectV8Profiler('v8-profiler-node8', function(err, profiler_path) {
        if (err)
          return false;
        return Profiling.exposeProfiling(pmx, profiler_path);
      });
    }
    return Profiling.exposeProfiling(pmx, profiler_path);
  });
};
