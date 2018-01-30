var v8 = require('v8');
var utils = require('../utils/module');

module.exports = function (pmx) {
    if (typeof v8.getHeapSpaceStatistics === 'function') {
        var data = v8.getHeapSpaceStatistics();

        for (var i = 0; i < data.length; i++) {
            var item = data[i];

            if (item.space_name === 'new_space') {
                pmx.probe().metric({
                    name: 'New space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'old_space') {
                pmx.probe().metric({
                    name: 'Old space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'map_space') {
                pmx.probe().metric({
                    name: 'Map space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'code_space') {
                pmx.probe().metric({
                    name: 'Code space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'large_object_space') {
                pmx.probe().metric({
                    name: 'Large object space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }
        }
    }

    if (typeof v8.getHeapStatistics === 'function') {
        var heapStats = v8.getHeapStatistics();

        pmx.probe().metric({
            name: 'Heap size',
            value: function () {
                return heapStats.total_heap_size;
            }
        });

        pmx.probe().metric({
            name: 'Heap size executable',
            value: function () {
                return heapStats.total_heap_size_executable;
            }
        });

        pmx.probe().metric({
            name: 'Used heap size',
            value: function () {
                return heapStats.used_heap_size;
            }
        });

        pmx.probe().metric({
            name: 'Heap size limit',
            value: function () {
                return heapStats.heap_size_limit;
            }
        });
    }

    utils.detectModule('gc-stats', function (err, gcPath) {
        if (err) { return false; }
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

    gc.on('stats', function (stats) {
        pmx.probe().metric({
            name: 'GC Heap size',
            value: function () {
                return stats.after.totalHeapSize;
            }
        });

        pmx.probe().metric({
            name: 'GC Executable heap size',
            value: function () {
                return stats.after.totalHeapSize;
            }
        });

        pmx.probe().metric({
            name: 'GC Used heap size',
            value: function () {
                return stats.after.totalHeapSize;
            }
        });

        pmx.probe().metric({
            name: 'GC Type',
            value: function () {
                return stats.gctype;
            }
        });

        pmx.probe().metric({
            name: 'GC Pause',
            value: function () {
                return stats.pause;
            }
        });
    });
}
