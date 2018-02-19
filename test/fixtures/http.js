
var pmx = require('../..');
pmx.init({
  'event_loop_dump': true
});
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200);
  res.end('hey');
}).listen(8000);
