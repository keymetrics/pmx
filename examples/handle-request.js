
const fs = require('fs');
const net = require('net');

// for (let i = 0; i < 12; i++)
//   fs.open(__filename, 'r', () => {});


var server = net.createServer(function(socket) {
  socket.on('data', function(data) {
    socket.write(new Buffer(9999).fill('b') + '\r\n');
  });
});

server.listen('9876', '127.0.0.1', function() {
});

var client = net.connect({port: 9876}, function() {
  setInterval(function() {
    client.write(new Buffer(9999).fill('a') + '\r\n');
  }, 5);
});


var client2 = net.connect({port: 9876}, function() {
  setInterval(function() {
    client2.write(new Buffer(9999).fill('a') + '\r\n');
  }, 5);
});

var client3 = net.connect({port: 9876}, function() {
  setInterval(function() {
    client3.write(new Buffer(9999).fill('a') + '\r\n');
  }, 5);
});

setInterval(function() {
  console.log(process._getActiveHandles().length, process._getActiveRequests().length);
}, 100);
