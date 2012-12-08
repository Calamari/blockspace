/*globals Base, Vector, Hull, Cockpit, Cannon, Engine, Canvas */

;(function(win, Collidable) {
  "use strict";
  var EMPTY   = null,
      HULL    = Hull,
      COCKPIT = Cockpit,
      CANNON  = Cannon,
      ENGINE  = Engine,

      ENGINE_DAMAGE = 30;

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
          [CANNON, EMPTY, CANNON],
          [HULL, HULL, HULL],
          [EMPTY, HULL, EMPTY],
          [HULL, COCKPIT, HULL],
          [ENGINE, EMPTY, ENGINE],
          [HULL, EMPTY, HULL]
        ],
        position: new Vector(),
        velocity: new Vector(),
        rotation: 0,
        acceleration: 100,
        maxSpeed: 60,
        rotationSpeed: 60,
        collisionSystem: null
      }, config);
      this._processBlueprint();
      this.position = this._config.position;
      this._calcBoundingBox();
      this.rotation = this._config.rotation;
      this.velocity = this._config.velocity;

      this._setupCollisionDetection();
    },

    _setupCollisionDetection: function() {
      var wh = Math.max(this.width, this.height),
          off = Math.max(Math.abs(this.middlePoint.x), Math.abs(this.middlePoint.y));
      // Basic is-in-ship collision detection:
      this.collidable = new Collidable.Rectangle({
        width: wh,
        height: wh,
        position: new Vector(this.position.x - off, this.position.y - off)
      });
      this.collidable.parent = this;

      // add itself
      this._config.collisionSystem.add(this.collidable);
    },

    getCollidable: function() {
      return this.collidable;
    },

    _processBlueprint: function() {
      var blueprint = [],
          config    = this._config,
          blockSize = config.blockSize;
      this._engines = [];
      this._cannons = [];

      // TODO: CALCULATE THOSE:
      this.width = config.blueprint[0].length * blockSize;
      this.height = config.blueprint.length * blockSize;
      this.middlePoint = new Vector(this.width/2, this.height/2);

      this._onDestroyedBlock = this._onDestroyedBlock.bind(this);

      for (var y=0; y<config.blueprint.length; ++y) {
        blueprint[y] = [];
        for (var x=0; x<config.blueprint[y].length; ++x) {
          if (config.blueprint[y][x] !== EMPTY) {
            blueprint[y][x] = new config.blueprint[y][x](new Vector(x * blockSize - this.width/2, y * blockSize - this.height/2), {
              blockSize: config.blockSize,
              ship: this,
              collisionSystem: config.collisionSystem,

              // needed for Engines:
              particleSystem: config.particleSystem,
              // needed for Cannons:
              bulletSystem: config.bulletSystem
            });
            if (config.blueprint[y][x] === ENGINE) {
              this._engines.push(blueprint[y][x]);
            }
            if (config.blueprint[y][x] === CANNON) {
              this._cannons.push(blueprint[y][x]);
            }
            if (config.blueprint[y][x] === COCKPIT) {
              this._blueprintOffset = new Vector(-x, -y);
            }
            blueprint[y][x].once('destroyed', this._onDestroyedBlock);
          } else {
            blueprint[y][x] = EMPTY;
          }
        }
      }
      this._blueprint = blueprint;
    },

    // find block and remove it
    _onDestroyedBlock: function(block) {
      // TODO: if damaged part was only part holding things together, let them break away
      this._forEachBlock(function(b, x, y) {
        if (b === block) {
          this._blueprint[y][x] = null;
          // TODO: remove from _engine and _cannon if needed
        }
      }.bind(this));
    },

    _calcBoundingBox: function() {},

    _forEachBlock: function(cb) {
      cb = cb.bind(this);
      for (var y=0; y<this._blueprint.length; ++y) {
        for (var x=0; x<this._blueprint[y].length; ++x) {
          if (this._blueprint[y][x]) {
            cb(this._blueprint[y][x], x, y);
          }
        }
      }
    },

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
        this._forEachBlock(function(block, x, y) {
          if (block && block.type === 'Engine' && this._blueprint[y+1] && this._blueprint[y+1][x]) {
            this._blueprint[y+1][x].damage(ENGINE_DAMAGE * passedSeconds);
          }
        });
      }

      if (this.rotationLeft || this.rotationRight) {
        this.rotation += (this.rotationLeft ? -1 : (this.rotationRight ? 1 : 0)) * config.rotationSpeed * passedSeconds;
      }

      // move ship
      this.position.add(this.velocity.clone().skalar(passedSeconds));
    },

    // remove cached drawn object so it gets redrawn
    redraw: function() {
      this.object = null;
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
      this.isAccel = accel;
    },

    firing: function(value) {
      this.isValue = value;
      if (value) {
        this._fire();
      }
    },

    _fire: function() {
      for (var i=this._cannons.length; i--;) {
        this._cannons[i].fire();
      }
    }
  });

  win.SpaceShip = SpaceShip;
}(window, Collidable));
