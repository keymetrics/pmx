
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

Options.loadConfig = function(conf) {
  var package_filepath = path.resolve(path.dirname(require.main.filename), 'package.json');

  if (!conf) {
    conf = {
      errors           : false,
      latency          : false,
      versioning       : false,
      show_module_meta : false
    };
  }

  try {
    var package_json = require(package_filepath);
  } catch(e) {
    throw new Error('[PMX] package.json problem (not found or mal formated', e);
  }

  conf.module_version = package_json.version;
  conf.module_name    = package_json.name;
  conf.description    = package_json.description;

  Options.configureModule(conf);
  return conf;
};

Options.getPID = function(file) {
  if (typeof(file) === 'number')
    return file;
  return parseInt(fs.readFileSync(file).toString());
};

module.exports = Options;
