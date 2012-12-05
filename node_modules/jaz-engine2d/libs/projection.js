
var Vector = Vector || require(__dirname + '/vector');

var Projection = function(min, max) {
  this.min = min;
  this.max = max;
};

/**
 * Calculates distance between this projection and another one
 * negative distance means they are overlapping and it returns the span they are overlapping
 */
Projection.prototype.distanceTo = function(projection2) {
  return (this.min < projection2.min) ? (projection2.min - this.max) : (this.min - projection2.max);
};

if (typeof module !== 'undefined') {
  module.exports = Projection;
}
