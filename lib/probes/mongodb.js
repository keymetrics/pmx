
module.exports = function (pmx, tracer) {
  var latency = pmx.probe().histogram({
    name: 'Mongo: Response time',
    type: 'mongodb/latency',
    measurement: 'mean',
    unit: 'ms'
  })

  var throughput = pmx.probe().meter({
    name: 'Mongo: Throughput',
    samples: 60,
    type: 'mongodb/throughput',
    unit: 'req/min'
  })

  tracer.on('mongo', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })
}
