/*globals Base, Vector */

;(function(win) {
  "use strict";

  var Bullet = function(config) {
    // for now its a circle
    //Collidable.Rectangle.call(this, { width: config.pixelSize, height: config.pixelSize });
    this.size = config.pixelSize;
    this.range = config.range;
    this.config = config;
    this.position = new Vector(config.x, config.y);
    this.velocity = new Vector(config.velX, config.velY);
    this.traveled = new Vector();
  };
  //Object.extend(Bullet.prototype, Collidable.Rectangle.prototype);

  Bullet.prototype.loop = function(frameDuration) {
    var config   = this.config,
        timeDiff = frameDuration/1000;

    this.position.x += this.velocity.x * timeDiff;
    this.position.y += (this.velocity.y + config.gravity) * timeDiff;

    // for calculation how far we got
    this.traveled.x += this.velocity.x * timeDiff;
    this.traveled.y +=  (this.velocity.y + config.gravity) * timeDiff;

    return this.traveled.length() <= this.range;
  };

  Bullet.prototype.draw = function(canvas) {
    // render it
    canvas.context.fillStyle = 'rgb(' + this.config.color + ')';
    canvas.context.fillRect(Math.round(this.position.x) - canvas.camera.x, Math.round(this.position.y) - canvas.camera.y, this.size, this.size);
  };

  win.Bullet = Bullet;
}(window));
