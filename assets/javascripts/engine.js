/*globals Base, Vector */

;(function(win, ShipPart) {
  "use strict";
  var Engine = ShipPart.extend({
    _baseColor: [64, 255, 64],
    type: 'Engine',

    constructor: function(position, config) {
      this.base(position, config);
      this.maxSpeed = config.maxSpeed;
      this.acceleration = config.acceleration;
      this.engineRear = new Vector(this._config.blockSize/2, this._config.blockSize).add(this.position);
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
        this._particleEmitter.position = this.engineRear.clone().rotate(this._config.ship.rotation).add(this._config.ship.position);
        //console.log(this._particleEmitter.direction.x, this._particleEmitter.direction.y, this.rotation);
        this._particleEmitter.direction = new Vector(0, 1).rotate(this._config.ship.rotation);
        this._particleEmitter.shoot();
      }
    }
  });

  win.Engine = Engine;
}(window, ShipPart));
