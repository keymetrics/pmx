module.exports = function(pmx) {
  if (process._getActiveRequests()) {
    var active_req = pmx.probe().histogram({
      name        : 'Active Reqs'
    });

    var i = setInterval(function() {
      active_req.update(process._getActiveRequests().length);
    }, 990);

    i.unref();
  }

  if (process._getActiveHandles()) {
    var active_handles = pmx.probe().histogram({
      name        : 'Active Handles'
    });

    var j = setInterval(function() {
      active_handles.update(process._getActiveHandles().length);
    }, 990);

    j.unref();
  }
}
