var fs = require('fs');
var start = 100;
var len = 30 * 60
var next = function(n) { return n + start * 0.04 * (Math.random() - 0.5); }

var data = [];
var func = {
  "flat": function(n, i){ return n; },
  "random": function(n, i) { return next(n); },
  "spike": function(n, i) {
    if (i == len / 2 - 30)
      return next(n) + start * 2;
    else if (i == len / 2 + 30)
      return next(n) - start * 2;
    else
      return next(n);
  }

}


var apply = function(s, out) {
  var n = start;
  if (s in func) {
    for(i = 0; i < 30 * 60; i++) {
      data[i] = n 
      n = func[s](n, i);
    }
    if (out)
      fs.writeFile("data.json", JSON.stringify(data), (err) => {
        if (err) throw err
        console.log('done');
      });
    else
      console.log(data)
  }
  else {
    console.log('Unknow: ' + s);
    console.log('List of functions: ', Object.keys(func))
    return -1
  }
}


process.argv.splice(0, 2);
if (process.argv.length == 0) {
  console.log("Use: node gen.js [opt] [func]");
  console.log("-o to output in data.json, list of func: ", Object.keys(func));
  process.exit(0)
}
if ((out = process.argv.indexOf('-o')) > -1) {
  process.argv.splice(out, 1);
  process.argv.forEach(function(item) { apply(item, true) });
}
else 
  process.argv.forEach(function(item) { apply(item, false) });
