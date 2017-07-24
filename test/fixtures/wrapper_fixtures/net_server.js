
require('../../..').init({
  ports : true,
  network : true
});

var net = require('net');

var server = net.createServer(function(socket) {
  socket.on('data', function(data) {
    socket.write(new Buffer(9999).fill('b') + '\r\n');
  });
});

server.listen('9876', '127.0.0.1', function() {
});
