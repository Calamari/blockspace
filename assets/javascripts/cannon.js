/*globals Base, Vector */

;(function(win, ShipPart, ShipPartDef, Bullet) {
  "use strict";

  var Cannons = {
    'default': new ShipPartDef('Cannon', 'default', {
      title: 'Regular Cannon',
      description: 'You want to have one. Seriously. Space is dangerous. With this simple regular cannon you will be able to defend against harmless rocks. Better then nothing, huh?',
      config: {
        audio: '/sounds/shoot-bullet',
        range: 200,
        shootSpeed: 200,
        damageValue: 50,
        pixelSize: 3,
        color: [255, 255, 255],
        energyDrain: 5,
        fireRatio: 1000 // once per second
      }
    }),
    'type2': new ShipPartDef('Cannon', 'type2', {
      title: 'Another Regular Cannon',
      description: 'Something you definitly need more.',
      config: {
        audio: '/sounds/shoot-bullet',
        range: 100,
        shootSpeed: 300,
        damageValue: 50,
        pixelSize: 4,
        color: [127, 255, 255],
        energyDrain: 7,
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
        price: 3,
        direction: new Vector(0, -1),
        collisionSystem: null
      }, cannonConfig ? cannonConfig.config : {}), config);
      this.base(position, config);
      // TODO: this works only with direction 0;-1
      this.cannonNose = new Vector(this._config.blockSize/2 - this._config.pixelSize/2, 0).add(this.position);
      this.lastFired  = config.lastFired || 0;
      this._audio = new Audio(this._config.audio);
      this.range = this._config.range;
      this.multiDir = this._config.direction === 'variable';

      this._overrideEmitterLoop();
    },

    fire: function(shootPosition) {
      var now    = new Date().getTime(),
          config = this._config,
          ship   = config.ship,
          directionVector;

      if (ship.drainEnergy(config.energyDrain) && now - this.lastFired > config.fireRatio) {
        var position = this.cannonNose.clone().rotate(ship.rotation).add(ship.position);
        if (shootPosition && config.direction === 'variable') {
          directionVector = shootPosition.clone().sub(ship.position).normalize(1);
        }  else {
          directionVector = config.direction.clone().rotate(ship.rotation);
        }

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

    // if bullet particle has been destroyed, also remove from collisionSystem
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
