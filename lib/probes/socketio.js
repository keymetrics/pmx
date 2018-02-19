
module.exports = function (pmx, tracer) {
  var latency;
  var throughput;

  tracer.on('socketio', function (data) {
    if (!latency) {
      latency = pmx.probe().histogram({
        name: 'WS: Response time',
        type: 'socketio/latency',
        measurement: 'mean',
        unit: 'ms'
      });
    }
    if (!throughput) {
      throughput = pmx.probe().meter({
        name: 'WS: Throughput',
        samples: 60,
        type: 'socketio/throughput',
        unit: 'req/min'
      });
    }

    data = JSON.parse(data);
    throughput.mark();
    if (data.duration) {
      latency.update(data.duration);
    }
  });
};
