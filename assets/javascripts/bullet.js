/*globals Base, Vector */

;(function(win, Collidable) {
  "use strict";

  var Bullet = function(config) {
    this.type = 'Bullet';
    this.size = config.pixelSize;
    this.range = config.range;
    this.config = Object.extend({
      damageValue: 5
    }, config);
    this.position = new Vector(config.x, config.y);
    this.velocity = new Vector(config.velX, config.velY);
    this.traveled = new Vector();
    this.damageValue = this.config.damageValue;
  };

  Bullet.prototype.getCollidable = function() {
    this.collidable = this.collidable || new Collidable.Circle({
      radius: this.size,
      position: new Vector(this.position.x + this.size/2, this.position.y + this.size/2)
    });
    this.collidable.parent = this;
    return this.collidable;
  };

  // defines what it is
  Bullet.prototype.is = function(what) {
    return this.type === what;
  };

  Bullet.prototype.loop = function(frameDuration) {
    var config   = this.config,
        timeDiff = frameDuration/1000;

    this.position.x += this.velocity.x * timeDiff;
    this.position.y += (this.velocity.y + config.gravity) * timeDiff;

    // for calculation how far we got
    this.traveled.x += this.velocity.x * timeDiff;
    this.traveled.y +=  (this.velocity.y + config.gravity) * timeDiff;

    // update position of collidable
    if (this.collidable) {
      this.collidable.position.x = this.position.x + this.size/2;
      this.collidable.position.y = this.position.y + this.size/2;
    }

    return this.traveled.length() <= this.range;
  };

  Bullet.prototype.draw = function(canvas) {
    // render it
    canvas.context.fillStyle = 'rgb(' + this.config.color + ')';
    canvas.context.fillRect(Math.round(this.position.x) - canvas.camera.x, Math.round(this.position.y) - canvas.camera.y, this.size, this.size);
  };

  Bullet.prototype.destroy = function() {
    this.destroyed = true;
  };

  win.Bullet = Bullet;
}(window, Collidable));
