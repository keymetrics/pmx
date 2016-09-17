

var axm = require('../..');

axm.catchAll();

throw new Error('global error');
