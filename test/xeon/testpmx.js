var fs        = require('fs');
var Alert     = require('../..//lib/utils/alert.js');

var checker = function(filename, data, msg) {
  var i = 0;
  var tester = new Alert({
    mode  : 'smart',
    func  : () => { console.log(filename + msg); }
  });
  tester.start = true;
  console.log("Starting " + filename + ' with initial value ' + data[0]);
  var interval = setInterval(() => {
      tester.tick(data[i++]);
  }, 10);
  setTimeout(() => {
    clearInterval(interval);
    delete tester;
  }, 18000);
};

fs.readdir('samples/negative', (err, data) => {
  if (err) throw err;
  data.forEach((el) => {
    fs.readFile('samples/negative/' + el, (err, data) => {
      if (err) throw err;
        checker(el, JSON.parse(data), ' should not be called');
    });
  });
});

fs.readdir('samples/positive', (err, data) => {
  if (err) throw err;
  data.forEach((el) => {
    fs.readFile('samples/positive/' + el, (err, data) => {
      if (err) throw err;
        checker(el, JSON.parse(data), ' has been called!');
    });
  });
});
