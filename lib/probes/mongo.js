
module.exports = function(pmx, tracer) {

  var response_time = pmx.probe().histogram({
    name        : 'Mongodb: query time',
    measurement : 'mean',
    unit        : 'ms'
  });

  var req_per_min = pmx.probe().meter({
    name      : 'Mongodb: req/min',
    samples   : 1,
    timeframe : 60
  });

  tracer.on('mongo', function (data) {
    req_per_min.mark();
    if (data.duration)
      response_time.update(data.duration)
  })
  
};
