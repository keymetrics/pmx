
module.exports = function (pmx, tracer) {
  var latency = pmx.probe().histogram({
    name: 'WS: Response time',
    type: 'socketio/latency',
    measurement: 'mean',
    unit: 'ms'
  })

  var throughput = pmx.probe().meter({
    name: 'WS: Throughput',
    samples: 60,
    type: 'socketio/throughput',
    unit: 'req/min'
  })

  tracer.on('socketio', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })
}
