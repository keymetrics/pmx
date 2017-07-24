

var debug     = require('debug')('axm:events');
var Transport = require('./utils/transport.js');
var fclone = require('fclone');

var Events    = {};

Events.emit = function(name, data) {
  if (!name)
    return console.error('[PMX] emit.name is missing');

  var inflight_obj = {};

  if (typeof(data) == 'object')
    inflight_obj = fclone(data);
  else if (data)
    inflight_obj.data = data;
  else
    inflight_obj.data = {};

  inflight_obj.__name = name;

  Transport.send({
    type : 'human:event',
    data : inflight_obj
  }, true);
  return false;
};

module.exports = Events;
