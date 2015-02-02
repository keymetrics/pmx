
var debug = require('debug')('axm:transport');

var Transport = module.exports = {};

function ipcSend(args, print) {
  if (!process.send) {
    var output = args.data;
    delete output.__name;

    if (print)
         return debug(output.stack || output);
    return false;
  }

  try {
    process.send(args);
  } catch(e) {
    console.error('Process disconnected from parent !!');
    console.error(e.stack);
    process.exit(1);
  }
};

Transport.send = function(args, print) {
  if (!print) print = false;

  ipcSend(args, print);
};
