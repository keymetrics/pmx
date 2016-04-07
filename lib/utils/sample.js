var Sample = function(size) {
  this._elements = [];
  this._size = size || 300;
  this._sum = 0;
  this._count = 0;
  this._varianceM = 0;
  this._varianceS = 0;
}

Sample.prototype.update = function(value) {
  if (this._count >= this._size) { 
    this._elements.push(value);
    this._sum += (value - this._elements.shift());
  }
  else {
    this._count++;
    this._elements.push(value);
    this._sum += value;
    var oldM = this._varianceM;
    this._varianceM += ((value - oldM) / this._count);
    this._varianceS += ((value - oldM) * (value - this._varianceM));
  }
}

Sample.prototype.getMean = function() {
  return (this._count === 0)
    ? 0
    : this._sum / this._count;
}

//need change 1 return - fixes early 0 divide issues
Sample.prototype.getVariance = function () {
  return (this._count < 2)
    ? 1
    :  this._varianceS / (this._count -1)
}

Sample.prototype.getStddev = function () {
  return (this._count < 2)
    ? 1
    : Math.sqrt(this.getVariance());
}

module.exports = Sample;
