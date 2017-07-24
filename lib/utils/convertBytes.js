
var convertBytes = function(bytes) {
  var to_fixed = 0;

  if (bytes === 0)
    ;
  else if (bytes < 1024)
    to_fixed = 6;
  else if (bytes < (1024 * 1024))
    to_fixed = 3;
  else
    to_fixed = 2;

  bytes = (bytes / (1024 * 1024)).toFixed(to_fixed);

  var cut_zeros = 0;

  for (var i = (bytes.length - 1); i > 0; --i) {
    if (bytes[i] === '.') {
      ++cut_zeros;
      break;
    }
    if (bytes[i] !== '0')
      break;
    ++cut_zeros;
  }

  if (cut_zeros > 0)
    bytes = bytes.slice(0, -(cut_zeros));

  return (bytes + 'mb/s');
};

module.exports = convertBytes;
