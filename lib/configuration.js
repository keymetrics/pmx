
var debug     = require('debug')('axm:events');
var Transport = require('./utils/transport.js');
var Autocast  = require('./utils/autocast.js');
var path      = require('path');
var fs        = require('fs');
var util      = require('util');

var Options = {};

/**
 * https://github.com/Unitech/PM2/blob/master/lib/Satan.js#L249
 * Event axm:option:configuration caught in Satan.js
 */
Options.configureModule = function(opts) {
  Transport.send({
    type : 'axm:option:configuration',
    data : opts
  }, false);
};

Options.init = function(conf) {
  var package_filepath = path.resolve(path.dirname(require.main.filename), 'package.json');

  if (!conf.module_conf)
    conf.module_conf = {};

  /**
   * Merge package.json metadata
   */
  try {
    var package_json = require(package_filepath);

    conf.module_version = package_json.version;
    conf.module_name    = package_json.name;
    conf.description    = package_json.description;

    if (package_json.config) {
      conf = util._extend(conf, package_json.config);
      conf.module_conf = package_json.config;
    }
  } catch(e) {
    if (!process.env.name) {
      console.error('[PMX] package.json problem and app name not found');
    }
    else
      conf.module_name = process.env.name;
  }

  /**
   * If custom variables has been set, merge with returned configuration
   */
  try {
    if (process.env[conf.module_name]) {
      var casted_conf = Autocast(JSON.parse(process.env[conf.module_name]));
      conf = util._extend(conf, casted_conf);
      // Do not display probe configuration in Keymetrics
      delete casted_conf.probes;
      // This is the configuration variable modifiable from keymetrics
      conf.module_conf = util._extend(conf.module_conf, casted_conf);
    }
  } catch(e) {
    console.error(e);
    console.error('Error while parsing configuration in environment (%s)', conf.module_name);
  }

  Options.configureModule(conf);
  return conf;
};

Options.getPID = function(file) {
  if (typeof(file) === 'number')
    return file;
  return parseInt(fs.readFileSync(file).toString());
};

Options.resolvePidPaths = function(filepaths) {
  if (typeof(filepaths) === 'number')
    return filepaths;

  function detect(filepaths) {
    var content = '';

    filepaths.some(function(filepath) {
      try {
        content = fs.readFileSync(filepath);
      } catch(e) {
        return false;
      }
      return true;
    });

    return content.toString().trim();
  }

  var ret = parseInt(detect(filepaths));

  return isNaN(ret) ? null : ret;
};


module.exports = Options;
