
var debug     = require('debug')('axm:profiling');
var os        = require('os');
var path      = require('path');
var fs        = require('fs');

var Options   = require('../pm2_module.js');

function exposeProfiling(pmx, profiler_path) {
  try {
    var profiler = require(profiler_path);
  } catch(e) {
    debug('v8-profiler module not installed', e);
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
    var dump_file = path.join(os.tmpDir(), Date.now() + '.heapsnapshot');

    var snapshot = profiler.takeSnapshot('km-heap-snapshot');
    var buffer    = '';

    snapshot.serialize(
      function iterator(data, length) {
        buffer += data;
      }, function complete() {
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
  pmx.action('km:cpu:profiling', function(reply) {
    var dump_file = path.join(os.tmpDir(), Date.now() + '.cpuprofile');
    var ns        = 'km-cpu-profiling';

    profiler.startProfiling(ns);

    setTimeout(function() {
      var cpu = profiler.stopProfiling(ns);
      fs.writeFile(dump_file, JSON.stringify(cpu), function(err) {
        if (err) {
          return reply({
            success   : false,
            err : err
          });
        }
        return reply({
          success     : true,
          cpuprofile  : true,
          dump_file   : dump_file
        });
      });


    }, 10000);
  });
}

module.exports = function(pmx) {

  var require_paths = require.main.paths;

  /**
   * Discover v8-profiler
   */
  (function look_for_profiler(require_paths) {
    if (!require_paths[0]) { return false; }

    var profiler_path = path.join(require_paths[0], 'v8-profiler');

    fs.exists(profiler_path, function(exist) {
      if (exist) return exposeProfiling(pmx, profiler_path);
      require_paths.shift();
      return look_for_profiler(require_paths);
    });
    return false;
  })(require_paths);
};
