
var debug     = require('debug')('axm:events');
var Transport = require('./utils/transport.js');
var path      = require('path');
var fs        = require('fs');

var Options = {};

Options.configureModule = function(opts) {
  if (!this.running) {
    this.running = true;
    /* Avoid automatic exit of the script */

    setInterval(function() {}, 1000);
  }

  Transport.send({
    type : 'axm:option:configuration',
    data : opts
  }, false);
};

Options.loadConfig = function(file) {
  if (!file) file = path.resolve(path.dirname(require.main.filename), 'conf.js');

  try {
    var conf = require(file);
  } catch(e) {
    throw new Error('[PMX] conf.js file not found');
  }

  Options.configureModule(conf.internals);
  return conf;
};

Options.getPID = function(file) {
  if (typeof(file) === 'number')
    return file;
  return parseInt(fs.readFileSync(file).toString());
};

module.exports = Options;
