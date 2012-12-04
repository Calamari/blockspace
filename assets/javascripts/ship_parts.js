/*globals Base, Vector, EventEmitter */

;(function(win) {
  "use strict";

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
    },

    damage: function(value) {
      this.health -= value;
      // TODO: damage animation
      this._config.ship.redraw();
      if (this.health <= 0) {
        this.emit('destroyed', this);
      }
    }
  });

  Object.extend(ShipPart.prototype, EventEmitter.prototype);

  var Engine = ShipPart.extend({
    _baseColor: [64, 255, 64],
    type: 'Engine',

    constructor: function(position, config) {
      this.base(position, config);
      this.ship = config.ship;
      if (config.particleSystem) {
        this._particleEmitter = config.particleSystem.createEmitter(this.position.x, this.position.y, {
          variance: 60,
          direction: new Vector(0, -1),
          shootSpeed: 30,
          pixelSize: 2,
          drag: 0.995,
          fade: 0.26
        });
      }
    },

    fire: function() {
      if (this._particleEmitter) {
        this._particleEmitter.position = this.position.clone().rotate(this._config.ship.rotation).add(this._config.ship.position).sub(this._config.ship.middlePoint);
        //console.log(this._particleEmitter.direction.x, this._particleEmitter.direction.y, this.rotation);
        this._particleEmitter.direction = new Vector(0, 1).rotate(this._config.ship.rotation);
        this._particleEmitter.shoot();
      }
    }
  });

  var Cockpit = ShipPart.extend({
    _baseColor: [64, 64, 255],
    type: 'Cockpit'
  });

  var Cannon = ShipPart.extend({
    _baseColor: [255, 128, 240],
    type: 'Cannon'
  });

  var Hull = ShipPart.extend({
    type: 'Hull'
  });


  win.Engine = Engine;
  win.Cockpit = Cockpit;
  win.Cannon = Cannon;
  win.Hull = Hull;
}(window));
