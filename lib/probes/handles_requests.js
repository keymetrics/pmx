
module.exports = function(pmx) {

  if (typeof process._getActiveRequests === "function") {
    pmx.probe().metric({
        name : 'Active requests',
        value: function() { return process._getActiveRequests().length }
    });
  }

  if (typeof process._getActiveHandles === "function") {
    pmx.probe().metric({
        name : 'Active handles',
        value: function () { return process._getActiveHandles().length }
    });
  }

};
