var v8 = require('v8');
var utils = require('../utils/module');

module.exports = function (pmx) {
  var TIME_INTERVAL = 1000;

  if (typeof v8.getHeapSpaceStatistics === 'function') {
    var heapSpaceProbes = {
      new_space: pmx.probe().metric({
        name: 'New space used size'
      }),
      old_space: pmx.probe().metric({
        name: 'Old space used size'
      }),
      map_space: pmx.probe().metric({
        name: 'Map space used size'
      }),
      code_space: pmx.probe().metric({
        name: 'Code space used size'
      }),
      large_object_space: pmx.probe().metric({
        name: 'Large object space used size'
      })
    };
  }

  if (typeof v8.getHeapStatistics === 'function') {
    var heapStatsTotal = pmx.probe().metric({
      name: 'Heap size'
    });

    var heapStatsExecutable = pmx.probe().metric({
      name: 'Heap size executable'
    });

    var heapStatsUsed = pmx.probe().metric({
      name: 'Used heap size'
    });

    var heapStatsLimit = pmx.probe().metric({
      name: 'Heap size limit'
    });
  }

  var timer = setInterval(function () {
    if (typeof v8.getHeapSpaceStatistics === 'function') {
      var data = v8.getHeapSpaceStatistics();

      for (var i = 0; i < data.length; i++) {
        var item = data[i];

        heapSpaceProbes[item.space_name].set(item.space_used_size);
      }
    }

    if (typeof v8.getHeapStatistics === 'function') {
      var heapStats = v8.getHeapStatistics();
      heapStatsTotal.set(heapStats.total_heap_size);
      heapStatsExecutable.set(heapStats.total_heap_size_executable);
      heapStatsUsed.set(heapStats.used_heap_size);
      heapStatsLimit.set(heapStats.heap_size_limit);
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

function sendGCStats (pmx, gcPath) {
  try {
    var gc = (require(gcPath))();
  } catch (e) {
    console.error('error when requiring gc-stats on path', gcPath);
    console.error(e);
    return false;
  }

  var gcHeapSize = pmx.probe().metric({
    name: 'GC Heap size'
  });

  var gcExecutableSize = pmx.probe().metric({
    name: 'GC Executable heap size'
  });

  var gcUsedSize = pmx.probe().metric({
    name: 'GC Used heap size'
  });

  var gcType = pmx.probe().metric({
    name: 'GC Type'
  });

  var gcPause = pmx.probe().metric({
    name: 'GC Pause'
  });

  gc.on('stats', function (stats) {
    gcHeapSize.set(stats.after.totalHeapSize);
    gcExecutableSize.set(stats.after.totalHeapExecutableSize);
    gcUsedSize.set(stats.after.usedHeapSize);
    gcType.set(stats.gctype);
    gcPause.set(stats.pause);
  });
}
