var debug     = require('debug')('axm:profiling');
var utils     = require('../utils/module');

var Inspector = module.exports = {};

var MODULE_NAME = 'event-loop-inspector';

Inspector.exposeActions = function (pmx, inspectorPath) {
  try {
    var inspector = require(inspectorPath)(true);
  } catch (e) {
    console.error('error when requiring ' + MODULE_NAME + ' on path', inspectorPath);
    console.error(e);
    return false;
  }

  debug(MODULE_NAME + ' successfully enabled');

  /**
   * Heap snapshot
   */
  pmx.action('km:event-loop-dump', function (reply) {
    var dump = inspector.dump();

    return reply({
      success: true,
      dump: dump
    });
  });
};

Inspector.eventLoopDump = function (pmx) {
  utils.detectModule(MODULE_NAME, function (err, inspectorPath) {
    if (err) {
      return false;
    }

    return Inspector.exposeActions(pmx, inspectorPath);
  });
};
