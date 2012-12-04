/*globals Base, Vector, Hull, Cockpit, Cannon, Engine, Canvas */

;(function(win) {
  "use strict";
  var EMPTY   = null,
      HULL    = Hull,
      COCKPIT = Cockpit,
      CANNON  = Cannon,
      ENGINE  = Engine;

  var SpaceShip = Base.extend({
    /**
     *
     * @param {Object}  config
     * @param {Array}   config.blueprint  The Blueprint of that ship
     * @param {Number} [config.blockSize] Size of each block
     * @param {Number} [config.position]  Position Vector of Ship
     */
    constructor: function(config) {
      this._config = Object.extend({
        blockSize: 10,
        blueprint: [
          [EMPTY, CANNON, EMPTY],
          [HULL, COCKPIT, HULL],
          [ENGINE, EMPTY, ENGINE]
        ],
        position: new Vector(),
        velocity: new Vector(),
        acceleration: 100,
        maxSpeed: 60,
        rotationSpeed: 60
      }, config);
      this._processBlueprint();
      this.position = this._config.position;
      this._calcBoundingBox();
      this.rotation = 0;
      this.velocity = this._config.velocity;
    },

    _processBlueprint: function() {
      var blueprint = [],
          config    = this._config,
          blockSize = config.blockSize;
      this._engines = [];

      // TODO: CALCULATE THOSE:
      this.width = config.blueprint.length * blockSize;
      this.height = config.blueprint[0].length * blockSize;
      this.middlePoint = new Vector(this.width/2, this.height/2);

      for (var y=0; y<config.blueprint.length; ++y) {
        blueprint[y] = [];
        for (var x=0; x<config.blueprint[y].length; ++x) {
          if (config.blueprint[y][x] !== EMPTY) {
            blueprint[y][x] = new config.blueprint[y][x](new Vector(x * blockSize + blockSize/2 - this.width/2, y * blockSize + blockSize - this.height/2), {
              blockSize: config.blockSize,

              // needed for Engines:
              particleSystem: config.particleSystem,
              ship: this
            });
            if (config.blueprint[y][x] === ENGINE) {
              this._engines.push(blueprint[y][x]);
            }
            if (config.blueprint[y][x] === COCKPIT) {
              this._blueprintOffset = new Vector(-x, -y);
            }
          } else {
            blueprint[y][x] = EMPTY;
          }
        }
      }
      this._blueprint = blueprint;
    },

    _calcBoundingBox: function() {},

    loop: function(frameDuration) {
      var passedSeconds = frameDuration/1000,
          config        = this._config;

      if (this.isAccel) {
        this.velocity.add(new Vector(0, -config.acceleration * passedSeconds).rotate(this.rotation));
        if (this.velocity.length() > config.maxSpeed) {
          this.velocity.normalize(config.maxSpeed);
        }

        // let the engine fire TODO:
        for (var i=this._engines.length; i--;) {
          this._engines[i].fire();
        }

        // TODO: if engine blocked, damage blocking block
      }

      if (this.rotationLeft || this.rotationRight) {
        this.rotation += (this.rotationLeft ? -1 : (this.rotationRight ? 1 : 0)) * config.rotationSpeed * passedSeconds;
      }

      // move ship
      this.position.add(this.velocity.clone().skalar(passedSeconds));
    },

    draw: function(canvas, context) {
      var self      = this,
          blockSize = self._config.blockSize;

      this.object = this.object || canvas.renderToCanvas(this.width, this.height, function(ctx) {
        for (var y=0; y<self._blueprint.length; ++y) {
          for (var x=0; x<self._blueprint[y].length; ++x) {
            if (self._blueprint[y][x] !== EMPTY) {
              self._blueprint[y][x].draw(ctx, x*blockSize, y*blockSize);
            }
          }
        }
      });

      // ALIGN CENTER IS WRONG, it has to be done by this ship??
      canvas.drawImage(this.object, this.position.x - canvas.camera.x , this.position.y - canvas.camera.y, Canvas.ALIGN.CENTER.MIDDLE, this.rotation);
      canvas.fillStyle = 'red';
      context.fillRect(this.position.x-1, this.position.y-1, 2, 2);
    },

    rotate: function(direction) {
      this.rotationLeft = direction === 'left';
      this.rotationRight = direction === 'right';
    },

    accelerate: function(accel) {
      if (typeof accel === 'undefined') {
        accel = true;
      }
      this.isAccel = accel;
    }
  });

  win.SpaceShip = SpaceShip;
}(window));
