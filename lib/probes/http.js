
module.exports = function (pmx, tracer) {
  var latency = pmx.probe().histogram({
    name: 'HTTP: Response time',
    type: 'http/inbound/latency',
    measurement: 'mean',
    unit: 'ms'
  })

  var throughput = pmx.probe().meter({
    name: 'HTTP: Throughput',
    samples: 60,
    type: 'http/inbound/throughput',
    unit: 'req/min'
  })

  tracer.on('http', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })

  tracer.on('https', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })
}
