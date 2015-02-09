
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

Options.loadConfig = function(filepath) {
  if (!filepath) filepath = path.resolve(path.dirname(require.main.filename), 'conf.js');

  var package_filepath = path.resolve(path.dirname(require.main.filename), 'package.json');

  try {
    var conf = require(filepath);
    var package_json = require(package_filepath);
  } catch(e) {
    throw new Error('[PMX] conf.js file not found');
  }

  conf.internals.module_version = package_json.version;
  conf.internals.module_name    = package_json.name;

  Options.configureModule(conf.internals);
  return conf;
};

Options.getPID = function(file) {
  if (typeof(file) === 'number')
    return file;
  return parseInt(fs.readFileSync(file).toString());
};

module.exports = Options;
