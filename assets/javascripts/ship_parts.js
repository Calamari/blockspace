/*globals Base:true, Vector: true */

;(function(win) {
  "use strict";

  var ShipPart = Base.extend({
    _baseColor: '#ffffff',
    /**
     *
     * @param {Object}  config
     * @param {Number} [config.blockSize] Size of each block
     */
    constructor: function(position, config) {
      this._config = Object.extend({
        blockSize: 10
      }, config);
      this.position = position;
    },

    draw: function(canvas, x, y) {
      var blockSize = this._config.blockSize;
      // This has to be adapted to make sharp lines:
      // canvas.strokeStyle = this._baseColor;
      // canvas.strokeRect(x, y, blockSize-1, blockSize-1);
      canvas.fillStyle = this._baseColor;
      canvas.fillRect(x, y, blockSize-1, blockSize-1);
    }
  });

  var Engine = ShipPart.extend({
    _baseColor: '#40ff40',
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
    _baseColor: '#4040ff'
  });

  var Cannon = ShipPart.extend({
    _baseColor: '#ff80f0'
  });

  var Hull = ShipPart.extend({
  });

  win.Engine = Engine;
  win.Cockpit = Cockpit;
  win.Cannon = Cannon;
  win.Hull = Hull;
}(window));
