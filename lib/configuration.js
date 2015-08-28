
var debug     = require('debug')('axm:events');
var Transport = require('./utils/transport.js');
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

Options.initModuleConf = function(conf) {
  var package_filepath = path.resolve(path.dirname(require.main.filename), 'package.json');

  if (!conf.module_conf)
    conf.module_conf = {};

  if (!conf.alert_conf)
    conf.alert_conf = {};

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
    throw new Error('[PMX] package.json problem (not found or mal formated', e);
  }

  /**
   * If custom variables has been set, merge with returned configuration
   */
  try {
    if (process.env[package_json.name]) {
      conf = util._extend(conf, JSON.parse(process.env[package_json.name]));
      conf.module_conf = util._extend(conf.module_conf, JSON.parse(process.env[package_json.name]));
    }
  } catch(e) {
    console.error(e);
    console.error('Error while parsing configuration in environment (%s)', package_json.name);
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
