
module.exports = function(pmx) {
  var metric = pmx.probe().metric({
    name        : 'Modules',
    value : function() { return 'N/A' }
  });

  var pace_interval = setInterval(function() {
    var module_count;

    try {
      module_count = Object.keys(require('module')._cache).length;
    } catch(e) {
      return false;
    }

    metric.set(module_count);
  }, 3000);

  pace_interval.unref();
};
