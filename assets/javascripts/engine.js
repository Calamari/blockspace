/*globals Base, Vector */

;(function(win, ShipPart) {
  "use strict";

  var Engines = {
    'default': new ShipPartDef('Engine', 'default', {
      title: 'Regular Combustion Engine',
      description: 'Move it!',
      emitter: {
        variance: 60,
        direction: new Vector(0, -1),
        shootSpeed: 30,
        pixelSize: 2,
        drag: 0.995,
        fade: 0.26
      },
      config: {
        maxSpeed: 50,
        acceleration: 70,
        price: 2
      }
    })
  };

  var Engine = ShipPart.extend({
    _baseColor: [64, 255, 64],
    type: 'Engine',
    subtype: 'default',

    constructor: function(position, config) {
      var engineConfig = Engines[config.subtype || 'default'];
      config = Object.extend(Object.extend({
        // no defaults
      }, engineConfig.config), config);
      this.base(position, config);
      this.maxSpeed = config.maxSpeed;
      this.acceleration = config.acceleration;
      this.engineRear = new Vector(this._config.blockSize/2, this._config.blockSize).add(this.position);
      if (config.particleSystem) {
        this._particleEmitter = config.particleSystem.createEmitter(this.position.x, this.position.y, engineConfig.emitter);
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
  win.Engines = Engines;
}(window, ShipPart));
