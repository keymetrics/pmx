
var http = require('http');

var pmx = require('../../..').init();
var pmx = require('../../..').init();
var pmx = require('../../..').init();

process.on('SIGINT', function() {
  console.log('Child app has caught SIGINT');
});

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('hey');
}).listen();
