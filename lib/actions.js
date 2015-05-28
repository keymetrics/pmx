var debug     = require('debug')('axm:events');
var Common    = require('./common.js');
var Transport = require('./utils/transport.js');

var Actions = {};

Actions.action = function(action_name, opts, fn) {
  if (!fn) {
    fn = opts;
    opts = null;
  }

  if (!action_name)
    return console.error('[PMX] action.action_name is missing');
  if (!fn)
    return console.error('[PMX] emit.data is mission');

  if (!process.send) {
    debug('Process not runned within PM2');
    return false;
  }

  // Notify the action
  Transport.send({
    type : 'axm:action',
    data : {
      action_name : action_name,
      opts        : opts,
      arity       : fn.length
    }
  });

  function reply(data) {
    Transport.send({
      type        : 'axm:reply',
      data        : {
        return      : data,
        action_name : action_name
      }
    });
  }

  process.on('message', function(data) {
    if (!data) return false;

    // In case 2 arguments has been set but no options has been transmitted
    if (fn.length === 2 && typeof(data) === 'string' && data === action_name)
      return fn({}, reply);

    // In case 1 arguments has been set but options has been transmitted
    if (fn.length === 1 && typeof(data) === 'object' && data.msg === action_name)
      return fn(reply);

    /**
     * Classical call
     */
    if (typeof(data) === 'string' && data === action_name)
      return fn(reply);

    /**
     * If data is an object == v2 protocol
     * Pass the opts as first argument
     */
    if (typeof(data) === 'object' && data.msg === action_name)
      return fn(data.opts, reply);

    return false;
  });

  return false;
};

module.exports = Actions;
