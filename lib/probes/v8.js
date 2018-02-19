var semver = require('semver');

if (!semver.satisfies(process.version, '>= 4.0.0'))  {
  module.exports = function (pmx) {};
} else {
  var v8 = v8 = require('v8');
  var utils = require('../utils/module');

  module.exports = function (pmx) {
    var TIME_INTERVAL = 1000;

    if (typeof v8.getHeapSpaceStatistics === 'function') {
      var heapSpaceProbes = {
        new_space: pmx.probe().metric({
          name: 'New space used size',
          type: 'v8/heap/space/new',
          unit: 'kB',
          historic: true
        }),
        old_space: pmx.probe().metric({
          name: 'Old space used size',
          type: 'v8/heap/space/old',
          unit: 'kB',
          historic: true
        }),
        map_space: pmx.probe().metric({
          name: 'Map space used size',
          type: 'v8/heap/space/map',
          unit: 'kB',
          historic: false
        }),
        code_space: pmx.probe().metric({
          name: 'Code space used size',
          type: 'v8/heap/space/code',
          unit: 'kB',
          historic: false
        }),
        large_object_space: pmx.probe().metric({
          name: 'Large object space used size',
          type: 'v8/heap/space/large',
          unit: 'kB',
          historic: false
        })
      };
    }

    if (typeof v8.getHeapStatistics === 'function') {
      var heapStatsTotal = pmx.probe().metric({
        name: 'Heap size',
        type: 'v8/heap/used',
        unit: 'kB',
        historic: true
      });

      var heapStatsExecutable = pmx.probe().metric({
        name: 'Heap size executable',
        type: 'v8/heap/executable',
        unit: 'kB',
        historic: false
      });

      var heapStatsUsed = pmx.probe().metric({
        name: 'Used heap size',
        type: 'v8/heap/used',
        unit: 'kB',
        historic: true
      });

      var heapStatsLimit = pmx.probe().metric({
        name: 'Heap size limit',
        type: 'v8/heap/limit',
        unit: 'kB',
        historic: true
      });
    }

    var timer = setInterval(function () {
      if (typeof v8.getHeapSpaceStatistics === 'function') {
        var data = v8.getHeapSpaceStatistics();

        for (var i = 0; i < data.length; i++) {
          var item = data[i];

          heapSpaceProbes[item.space_name].set(Math.round(item.space_used_size / 1000));
        }
      }

      if (typeof v8.getHeapStatistics === 'function') {
        var heapStats = v8.getHeapStatistics();
        heapStatsTotal.set(Math.round(heapStats.total_heap_size / 1000));
        heapStatsExecutable.set(Math.round(heapStats.total_heap_size_executable / 1000));
        heapStatsUsed.set(Math.round(heapStats.used_heap_size / 1000));
        heapStatsLimit.set(Math.round(heapStats.heap_size_limit / 1000));
      }
    }, TIME_INTERVAL);

    timer.unref();

    utils.detectModule('gc-stats', function (err, gcPath) {
      if (err) {
        return false;
      }
      return sendGCStats(pmx, gcPath);
    });
  };
}

function sendGCStats (pmx, gcPath) {
  try {
    var gc = (require(gcPath))();
  } catch (e) {
    console.error('error when requiring gc-stats on path', gcPath);
    console.error(e);
    return false;
  }

  var gcHeapSize = pmx.probe().metric({
    name: 'GC Heap size',
    type: 'v8/gc/heap/size',
    unit: 'kB',
    historic: true
  });

  var gcExecutableSize = pmx.probe().metric({
    name: 'GC Executable heap size',
    type: 'v8/gc/heap/executable',
    unit: 'kB',
    historic: false
  });

  var gcUsedSize = pmx.probe().metric({
    name: 'GC Used heap size',
    type: 'v8/gc/heap/used',
    unit: 'kB',
    historic: true
  });

  var gcType = pmx.probe().metric({
    name: 'GC Type',
    type: 'v8/gc/type',
    historic: false
  });

  var gcPause = pmx.probe().metric({
    name: 'GC Pause',
    type: 'v8/gc/pause',
    unit: 'ms',
    historic: false
  });

  gc.on('stats', function (stats) {
    gcHeapSize.set(Math.round(stats.after.totalHeapSize / 1000));
    gcExecutableSize.set(Math.round(stats.after.totalHeapExecutableSize / 1000));
    gcUsedSize.set(Math.round(stats.after.usedHeapSize / 1000));
    gcType.set(stats.gctype);
    gcPause.set(Math.round(stats.pause / 1000000)); // convert to milliseconds (cause pauseMs seems to use Math.floor)
  });
}
