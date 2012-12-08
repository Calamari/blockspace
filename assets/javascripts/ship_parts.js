/*globals Base, Vector, EventEmitter, Collidable */

;(function(win) {
  "use strict";

  var TIME_DAMAGE_IS_VISIBLE = 1000; // in ms

  var ShipPart = Base.extend({
    _baseColor: [255, 255, 255],
    /**
     * @param {Object}     config
     * @param {Number}    [config.blockSize] Size of each block
     * @param {Number}    [config.health]    Amount of healt of that block
     * @param {SpaceShip}  config.ship       Ship that block belongs to
     */
    constructor: function(position, config) {
      this._config = Object.extend({
        blockSize: 10,
        health: 100
      }, config);
      this.position = position;
      this.health = this._config.health;
      this.ship = this._config.ship;
    },

    getCollidable: function() {
      var wh     = this._config.blockSize - 1,
          p      = this.position,
          ship   = this.ship,
          r      = ship.rotation,
          points = [new Vector(p.x, p.y), new Vector(p.x + wh, p.y), new Vector(p.x + wh, p.y + wh), new Vector(p.x, p.y + wh)],
          collidable;
      for (var i=points.length; i--;) {
        points[i].rotate(r);
      }
      collidable = new Collidable.Polygon({
        position: ship.position.clone(),
        points: points
      });
      collidable.parent = this;
      return collidable;
    },

    draw: function(canvas, x, y) {
      var blockSize = this._config.blockSize,
          // TODO: that is a basic version, better draw with cracks and stuff if damaged
          alpha     = this.health / this._config.health;
      // This has to be adapted to make sharp lines:
      canvas.strokeStyle = 'rgba(' + this._baseColor.join(',') + ', 1)';
      canvas.strokeRect(x+0.5, y+0.5, blockSize-1.5, blockSize-1.5);
      canvas.fillStyle = 'rgba(' + this._baseColor.join(',') + ',' + alpha + ')';
      canvas.fillRect(x, y, blockSize-1, blockSize-1);

      if (this._damagedTime) {
        // TODO: We need this time, if we want to make a smooth hit animation
        // var now = new Date().getTime();
        // if (this._damagedTime + TIME_DAMAGE_IS_VISIBLE < now) {
        //   this._damagedTime = null;
        // } else {
          canvas.fillStyle = 'rgba(255, 0, 0, .6)';
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
        this.destroy();
      }
    },

    destroy: function() {
      this.health = 0;
      this.emit('destroyed', this);
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
