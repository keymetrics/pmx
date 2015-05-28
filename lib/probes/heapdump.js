
var debug     = require('debug')('axm:heapdump');
var os        = require('os');
var path      = require('path');

var Options   = require('../pm2_module.js');

module.exports = function(pmx) {

  /**
   * Check if heapdump module is available
   */
  try {
    // Try to require user heapdump
    var heapdump = require(path.join(process.cwd(), 'node_modules', 'heapdump'));
  } catch(e) {
    debug('heapdump module not installed', e);
    return false;
  }

  debug('heapdump sucessfully enabled');

  /**
   * Tell Keymetrics that heapdump is possible
   * (flag available in axm_options object)
   */
  Options.configureModule({
    heapdump : true
  });

  /**
   * Expose action
   */
  pmx.action('km:heapdump', function(reply) {
    var dump_file = path.join(os.tmpDir(), Date.now() + '.heapsnapshot');

    heapdump.writeSnapshot(dump_file, function(err, filename) {
      if (err) {
        return reply({
          success   : false,
          err : err
        });
      }
      reply({
        success   : true,
        heapdump  : true,
        dump_file : dump_file
      });
    });
  });
};
