/*globals Base, Vector */

;(function(win, ShipPart, Bullet) {
  "use strict";

  var Cannon = ShipPart.extend({
    _baseColor: [255, 64, 64],
    type: 'Cannon',

    constructor: function(position, config) {
      config = Object.extend({
        shootSpeed: 200,
        direction: new Vector(0, 1),
        collisionSystem: null,
        pixelSize: 3,
        range: 200,
        color: [255, 255, 255],
        damageValue: 10,
        fireRatio: 1000 // once per second
      }, config);
      this.base(position, config);
      this.cannonNose = new Vector(this._config.blockSize/2 - this._config.pixelSize/2, 0).add(this.position);
      this.lastFired  = config.lastFired || 0;

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
}(window, ShipPart, Bullet));
