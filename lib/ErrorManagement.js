
var debug = require('debug')('axm:notify');
var util  = require('util');
var Configuration = require('./Configuration.js');
var Transport = require('./utils/transport.js');

var Notify = {};

var jsonize = function(err, filter, space) {
  if (typeof(err) != 'object')
    return err;

  var plainObject = {};

  Object.getOwnPropertyNames(err).forEach(function(key) {
    plainObject[key] = err[key];
  });
  return plainObject;
};

Notify.catchAll = function(opts) {
  if (opts === undefined)
    opts = { errors : true };

  Configuration.configureModule({
    error : opts.errors
  });

  if (process.env.exec_mode === 'cluster_mode')
    return false;

  function getUncaughtExceptionListener(listener) {
    return function uncaughtListener(err) {
      var error = err && err.stack ? err.stack : err;

      if (err && err.length) {
        err._length = err.length;
        delete err.length;
      }

      if (listener === 'unhandledRejection') {
        error = 'You have triggered an unhandledRejection, you may have forgotten to catch a Promise rejection:\n' + error;
      }

      console.error(error);
      if (err)
        var errObj = Notify._interpretError(err);

      if (!errObj)
        errObj = {message: 'No error but ' + listener + ' was caught!' };

      errObj.level = 'fatal';

      Transport.send({
        type : 'process:exception',
        data : errObj
      }, true);

      if (!process.listeners(listener).filter(function (listener) {
        return listener !== uncaughtListener;
      }).length) {
        if (listener == 'uncaughtException')
          process.exit(1);
      }
    }
  }

  if (opts.errors === true && util.inspect(process.listeners('uncaughtException')).length === 2) {
    process.once('uncaughtException', getUncaughtExceptionListener('uncaughtException'));
    process.once('unhandledRejection', getUncaughtExceptionListener('unhandledRejection'));
  }
  else if (opts.errors === false
           && util.inspect(process.listeners('uncaughtException')).length !== 2) {
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
  }
};

Notify._interpretError = function(err) {
  var s_err = {};

  if (typeof(err) === 'string') {
    // Simple string processing
    s_err.message = err;
    s_err.stack = err;
  }
  else if (!(err instanceof Error) && typeof(err) === 'object') {
    // JSON processing
    s_err.message = err;
    s_err.stack = err;
  }
  else if (err instanceof Error) {
    // Error object type processing
    s_err = err;
  }

  return jsonize(s_err);
};

Notify.notify = Notify.error = Notify.reportError = function(err) {
  var ret_err = this._interpretError(err);

  ret_err.level = 'error';

  Transport.send({
    type : 'process:exception',
    data : ret_err
  }, true);

  return ret_err;
};

Notify.expressErrorHandler = function() {
  var self = this;

  return function errorHandler(err, req, res, next) {
    if (res.statusCode < 400) res.statusCode = 500;

    err.url = req.url;
    err.component = req.url;
    err.action = req.method;
    err.params = req.body;
    err.session = req.session;

    Transport.send({
      type  : 'process:exception',
      data  : jsonize(err)
    }, true);
    return next(err);
  };
};

module.exports = Notify;
