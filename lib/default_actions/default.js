
var fs = require('fs');
var path = require('path');

module.exports = function(pmx) {
  pmx.action('getEnv', function(reply) {
    var omit = ['name', 'exec_mode', 'env', 'args', 'pm_cwd', 'exec_interpreter', 'pm_exec_path', 'node_args', 'pm_out_log_path', 'pm_err_log_path', 'pm_pid_path', 'pm_id', 'status', 'pm_uptime', 'created_at', 'unstable_restarts', 'restart_time', 'axm_actions', 'pmx_module', 'command', 'watch', 'versioning', 'vizion_runing', 'MODULE_DEBUG', 'pmx', 'axm_options', 'created_at', 'watch', 'vizion', 'axm_dynamic', 'axm_monitor', 'instances', 'automation', 'unstable_restart', 'treekill'];
    var origin = {};
    var keys = Object.keys(process.env);
    var i = keys.length;
    while (i--) {
  	  if (omit.indexOf(keys[i]) == -1 && origin[keys[i]] != '[object Object]')
        origin[keys[i]] = process.env[keys[i]];
    }

    process.nextTick(function() {
      return reply(origin);
    });
  });

  // pmx.action('getDeps', function(reply) {
  //   process.nextTick(function() {
  //     return reply({ module_cache : Object.keys(require('module')._cache) });
  //   });
  // });
}
