
var axm = require('../..');

axm.catchAll();

process.on('unhandledRejection', function() {
  console.log('YEY');
});

var p = new Promise(function(resolve, reject) {
  throw new Error('fail')
  return resolve('ok')
})

p.then(function(e) {
})
