
var Events      = require('./events.js');
var Actions     = require('./actions.js');
var Notify      = require('./notify.js');
var Transaction = require('./transaction.js');
var Monitor     = require('./monitor.js');

var Probe       = require('./Probe.js');

var Options     = require('./options.js');

var util        = require('util');

var Export  = {};

/**
 * Flatten API
 */
util._extend(Export, Events);
util._extend(Export, Actions);
util._extend(Export, Notify);
util._extend(Export, Transaction);
util._extend(Export, Monitor);
util._extend(Export, Options);
util._extend(Export, Probe);

/**
 * Export
 */

module.exports = Export;
