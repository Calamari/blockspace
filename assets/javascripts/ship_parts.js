/*globals Base, Vector, EventEmitter */

;(function(win) {
  "use strict";

  var TIME_DAMAGE_IS_VISIBLE = 1000; // in ms

  var ShipPart = Base.extend({
    _baseColor: [255, 255, 255],
    /**
     *
     * @param {Object}  config
     * @param {Number} [config.blockSize] Size of each block
     */
    constructor: function(position, config) {
      this._config = Object.extend({
        blockSize: 10,
        health: 100
      }, config);
      this.position = position;
      this.health = this._config.health;
    },

    draw: function(canvas, x, y) {
      var blockSize = this._config.blockSize,
          // TODO: that is a basic version, better draw with cracks and stuff if damaged
          alpha     = this.health / this._config.health;
      // This has to be adapted to make sharp lines:
      // canvas.strokeStyle = this._baseColor;
      // canvas.strokeRect(x, y, blockSize-1, blockSize-1);
      canvas.fillStyle = 'rgba(' + this._baseColor.join(',') + ',' + alpha + ')';
      canvas.fillRect(x, y, blockSize-1, blockSize-1);

      if (this._damagedTime) {
        // var now = new Date().getTime();
        // if (this._damagedTime + TIME_DAMAGE_IS_VISIBLE < now) {
        //   this._damagedTime = null;
        // } else {
          canvas.fillStyle = 'red';
          canvas.fillRect(x-1, y-1, blockSize+1, blockSize+1);
        // }
        this._config.ship.redraw();
      }
    },

    damage: function(value) {
      this._damagedTime = new Date().getTime();
      this.health -= value;
      setTimeout(function() {
        this._damagedTime = null;
        this._config.ship.redraw();
      }.bind(this), TIME_DAMAGE_IS_VISIBLE);
      this._config.ship.redraw();
      if (this.health <= 0) {
        this.emit('destroyed', this);
      }
    }
  });

  Object.extend(ShipPart.prototype, EventEmitter.prototype);

  var Cockpit = ShipPart.extend({
    _baseColor: [64, 64, 255],
    type: 'Cockpit'
  });

  var Hull = ShipPart.extend({
    type: 'Hull'
  });

  win.ShipPart = ShipPart;
  win.Cockpit = Cockpit;
  win.Hull = Hull;
}(window));
