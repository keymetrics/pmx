
module.exports = function (pmx, tracer) {
  var latency = pmx.probe().histogram({
    name: 'MYSQL: Response time',
    type: 'mysql/latency',
    measurement: 'mean',
    unit: 'ms'
  })

  var throughput = pmx.probe().meter({
    name: 'MYSQL: Throughput',
    samples: 60,
    type: 'mysql/throughput',
    unit: 'req/min'
  })

  tracer.on('mysql', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })
}
