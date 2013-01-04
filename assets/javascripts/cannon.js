/*globals Base, Vector */

;(function(win, ShipPart, ShipPartDef, Bullet) {
  "use strict";

  var Cannons = {
    'default': new ShipPartDef('Cannon', 'default', {
      title: 'Regular Cannon',
      description: 'You want to have one. Seriously. Space is dangerous. With this simple regular cannon you will be able to defend against harmless rocks. Better then nothing, huh?',
      config: {
        price: 3,
        audio: '/sounds/shoot-bullet',
        direction: new Vector(0, 1),
        range: 200,
        shootSpeed: 200,
        damageValue: 50,
        pixelSize: 3,
        color: [255, 255, 255],
        fireRatio: 1000 // once per second
      }
    }),
    'type2': new ShipPartDef('Cannon', 'type2', {
      title: 'Another Regular Cannon',
      description: 'Something you definitly need more.',
      config: {
        price: 3,
        audio: '/sounds/shoot-bullet',
        direction: new Vector(0, 1),
        range: 50,
        shootSpeed: 300,
        damageValue: 50,
        pixelSize: 4,
        color: [127, 255, 255],
        fireRatio: 400 // once per second
      }
    })
  };

  var Cannon = ShipPart.extend({
    _baseColor: [255, 64, 64],
    type: 'Cannon',
    subtype: 'default',

    constructor: function(position, config) {
      var cannonConfig = Cannons[config.subtype || 'default'];
      config = Object.extend(Object.extend({
        collisionSystem: null
      }, cannonConfig.config), config);
      this.base(position, config);
      this.cannonNose = new Vector(this._config.blockSize/2 - this._config.pixelSize/2, 0).add(this.position);
      this.lastFired  = config.lastFired || 0;
      this._audio = new Audio(this._config.audio);

      this._overrideEmitterLoop();
    },

    fire: function() {
      var now = new Date().getTime();
      if (now - this.lastFired > this._config.fireRatio) {
        var position = this.cannonNose.clone().rotate(this._config.ship.rotation).add(this._config.ship.position),
            directionVector = new Vector(0, -1).rotate(this._config.ship.rotation);

        this._shoot(position, directionVector);
        this.lastFired = now;
      }
    },

    _shoot: function(position, directionVector) {
      var config = this._config,
          bullet = new Bullet({
            color:     config.color.join(','),
            pixelSize: config.pixelSize,
            range:     config.range,
            x: position.x,
            y: position.y,
            velX: directionVector.x * config.shootSpeed,
            velY: directionVector.y * config.shootSpeed,
            gravity: 0,
            damageValue: config.damageValue
          });
      bullet.ship = this.ship;
      config.bulletSystem.add(bullet);
      if (config.collisionSystem) {
        config.collisionSystem.add(bullet.getCollidable());
      }
      this._audio.play();
    },

    _overrideEmitterLoop: function() {
      if (this._config.collisionSystem) {
        var collisionSystem = this._config.collisionSystem;
        // override that looping method because of collisionSystem removal
        // TODO: could be removed if emitter fires event on particle
        this._config.bulletSystem.loop = function(frameDuration) {
          for (var i=this.particles.length; i--;) {
            // Remove destroyed bullets and bullets that have reached their end
            if (this.particles[i].destroyed || !this.particles[i].loop(frameDuration)) {
              collisionSystem.remove(this.particles[i].getCollidable());
              this.particles.splice(i, 1); // remove it
            }
          }
        };
      }
    }
  });

  win.Cannon = Cannon;
  win.Cannons = Cannons;
}(window, ShipPart, ShipPartDef, Bullet));
