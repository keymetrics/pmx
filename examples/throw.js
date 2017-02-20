
var pmx = require('..');

pmx.catchAll();


setTimeout(function() {
  throw new Error('ok');
}, 1000);
