;(function (module) {"use strict";

  var VISIBILITY_THRESHOLD = 0.01;

  var Particle = function(config) {
    this.size = config.pixelSize;
    this.alpha = 1;
    this.config = config;
    this.position = new Vector(config.x, config.y);
    this.velocity = new Vector(config.velX, config.velY);
  };

  Particle.prototype.loop = function(frameDuration) {
    var config   = this.config,
        timeDiff = frameDuration/1000;

    this.velocity.skalar(config.drag);
    this.position.y += (this.velocity.y + config.gravity) * timeDiff;
    this.position.x += this.velocity.x * timeDiff;
    this.alpha -= config.fade * timeDiff || 0;
    console.log(this.alpha);
    this.size *= config.shrink * timeDiff || 1;

    return this.alpha >= VISIBILITY_THRESHOLD;
  };

  Particle.prototype.draw = function(canvas) {
    // render it
    canvas.context.fillStyle = 'rgba(' + this.config.color + ',' + this.alpha + ')';
//    console.log(Math.round(this.position.x) - canvas.camera.x, Math.round(this.position.y) - canvas.camera.y, this.size, this.size);;
    canvas.context.fillRect(Math.round(this.position.x) - canvas.camera.x, Math.round(this.position.y) - canvas.camera.y, this.size, this.size);

  };



  var ParticleEmitter = function(x, y, config) {
    this.shootSpeed = config.shootSpeed;
    this.variance   = config.variance;
    this.direction  = config.direction.normalize();
    this.position   = new Vector(x, y);
    this.system     = config.particleSystem;
    this.pixelSize  = config.pixelSize;
    this.fade       = config.fade;
    this.drag       = config.drag;
  };

  ParticleEmitter.prototype.shoot = function() {
    var colors = [],
        dir    = this.direction.clone().rotate((Math.random() * this.variance) - this.variance/2);
    for (var i=3; i--;) {
      colors[i] = Math.round(255 + -Math.random() * 100);
    }
    this.system.add(new Particle({
      color:     colors.join(','),
      pixelSize: this.pixelSize,
      x: this.position.x,
      y: this.position.y,
      velX: dir.x * this.shootSpeed,
      velY: dir.y * this.shootSpeed,
      gravity: 0,
      drag:    this.drag,
      fade:    this.fade + (Math.random() * 0.01)
    }));
  };


  var ParticleSystem = function() {
    this.particles = [];
  };

  ParticleSystem.prototype.createEmitter = function(x, y, config) {
    config.particleSystem = this;
    return new ParticleEmitter(x, y, config);
  };

  ParticleSystem.prototype.add = function(particle) {
    this.particles.push(particle);
  };

  ParticleSystem.prototype.loop = function(frameDuration) {
    for (var i=this.particles.length; i--;) {
      if (!this.particles[i].loop(frameDuration)) {
        this.particles.splice(i, 1); // remove it
      }
    }
  };

  ParticleSystem.prototype.draw = function(canvas) {
    for (var i=this.particles.length; i--;) {
      this.particles[i].draw(canvas);
    }
  };
  ParticleSystem.prototype.length = function(canvas) {
    return this.particles.length;
  };

  module.Particle = Particle;
  module.ParticleSystem = ParticleSystem;
  module.ParticleEmitter = ParticleEmitter;
}(window));
