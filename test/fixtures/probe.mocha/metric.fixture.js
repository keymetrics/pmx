

var axm = require('../../..');

var probe = axm.probe();

var users = {
  'alex'  : 'ok',
  'musta' : 'fa'
};

/**
 * Monitor synchronous return of functions
 */
var rt_users = probe.metric({
  name : 'Realtime user',
  historic : false,
  unit : 'kb',
  type : 'v8/smthing',
  value : function() {
    return Object.keys(users).length;
  }
});

setInterval(function() {
  // keep event loop active
}, 1000);
