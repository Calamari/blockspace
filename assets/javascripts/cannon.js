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
        fireRatio: 1000 // once per second
      }, config);
      this.base(position, config);
      this.position.add(new Vector(this._config.blockSize/2 - this._config.pixelSize/2, 0));
      this.ship = config.ship;
      this.lastFired  = config.lastFired || 0;

      this._overrideEmitterLoop();
    },

    fire: function() {
      var now = new Date().getTime();
      if (now - this.lastFired > this._config.fireRatio) {

        var position = this.position.clone().rotate(this._config.ship.rotation).add(this._config.ship.position).sub(this._config.ship.middlePoint),
            directionVector = new Vector(0, -1).rotate(this._config.ship.rotation);

        this._shoot(position, directionVector);
        this.lastFired = now;
      }
    },

    _shoot: function(position, directionVector) {
      var bullet = new Bullet({
        color:     this._config.color.join(','),
        pixelSize: this._config.pixelSize,
        range:     this._config.range,
        x: position.x,
        y: position.y,
        velX: directionVector.x * this._config.shootSpeed,
        velY: directionVector.y * this._config.shootSpeed,
        gravity: 0
      });
      this._config.particleSystem.add(bullet);
      if (this._config.collisionSystem) {
        this._config.collisionSystem.add(bullet);
      }
    },

    _overrideEmitterLoop: function() {
      if (this._config.collisionSystem) {
        // override that looping method because of collisionSystem removal
        // TODO: could be removed if emitter fires event on particle
        this._config.particleSystem.loop = function(frameDuration) {
          for (var i=this.particles.length; i--;) {
            if (this.particles[i].destroyed || !this.particles[i].loop(frameDuration)) {
              this._config.collisionSystem.remove(this.particles[i]);
              this.particles.splice(i, 1); // remove it
            }
          }
        }
      }
    }
  });

  win.Cannon = Cannon;
}(window, ShipPart, Bullet));
