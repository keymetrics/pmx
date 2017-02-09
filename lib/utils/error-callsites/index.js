'use strict'

var formatter = require('./node-0.10-formatter')

var orig = Error.prepareStackTrace
Error.prepareStackTrace = function (err, callsites) {
  Object.defineProperty(err, '__error_callsites', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: callsites
  })

  return (orig || formatter)(err, callsites)
}

module.exports = function (err) {
  err.stack
  return err.__error_callsites
}
