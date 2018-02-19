var pmx = require('../../..');
pmx.init();

setTimeout(function () {
  try {
    require('express');
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}, 1000);
