/*globals Base, Vector, Canvas */

;(function(win, EventEmitter, Collidable) {
  "use strict";
  var ENGINE_DAMAGE = 30, // TODO has to be configured by engine
      shipCount     = 0;

  var SpaceShip = Base.extend({
    type: 'SpaceShip',
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
        position: new Vector(),
        velocity: new Vector(),
        rotation: 0,
        collisionSystem: null
      }, config);
      config = this._config;
      this.title = config.title || 'SpaceShip' + (++shipCount);
      this.maxSpeed = 0;
      this.acceleration = 0;
      this.currentEnergy = 0;
      this._processBlueprint();
      this.position = config.position;
      this.rotation = config.rotation;
      this.velocity = config.velocity;
      this.friends = config.friends || [];
      this.isPlayer = config.player;
      this.viewRange = config.viewRange || 250;

      if (config.behavior) {
        this.registerBehavior(config.behavior);
      }

      this._setupCollisionDetection();
    },

    getViewVector: function() {
      return new Vector(0, -1).rotate(this.rotation);
    },

    registerBehavior: function(behavior) {
      this._behavior = new BehaviorTree({
        title: this.title,
        tree: behavior
      });
      this._behavior.setObject(this);
    },

    setNewBlueprint: function(blueprint) {
      this._config.blueprint = blueprint;
      this._processBlueprint();
      this.redraw();
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

    _removeFromCollisionDetection: function() {
      this._config.collisionSystem.remove(this.collidable);
    },

    getCollidable: function() {
      return this.collidable;
    },

    _processBlueprint: function() {
      var blueprint = [],
          config    = this._config,
          blockSize = config.blockSize,
          x,y;

      // TODO: CALCULATE THOSE:
      this.width = config.blueprint[0].length * blockSize;
      this.height = config.blueprint.length * blockSize;
      this.middlePoint = new Vector(this.width/2, this.height/2);
      this.mass = 0;

      this._onDestroyedBlock = this._onDestroyedBlock.bind(this);

      for (y=0; y<config.blueprint.length; ++y) {
        blueprint[y] = [];
        for (x=0; x<config.blueprint[y].length; ++x) {
          if (config.blueprint[y][x]) {
            blueprint[y][x] = config.blueprint[y][x].construct(new Vector(x * blockSize - this.width/2, y * blockSize - this.height/2), {
              blockSize: config.blockSize,
              ship: this,
              collisionSystem: config.collisionSystem,
              particleSystem: config.particleSystem,

              // needed for Cannons:
              bulletSystem: config.bulletSystem
            });
            if (blueprint[y][x].is('Cockpit')) {
              this._blueprintOffset = new Vector(x, y);
            }
            blueprint[y][x].once('destroyed', this._onDestroyedBlock);
            this.mass += blueprint[y][x].mass;
          } else {
            blueprint[y][x] = null;
          }
        }
      }
      this._blueprint = blueprint;
      this._recheckEverything();
    },

    _recheckEverything: function() {
      this._checkHullIntegrity();
      this._checkShielding();
      this._calcCannonValues();
      this._calcEngineValues();
      this._calcReactorValues();
    },

    _checkShielding: function() {
      this.forEachBlock(function(block) {
        block.resetShields();
      });
      this.forEachBlock(function(shield) {
        if (shield.is('Shield')) {
          var radius = shield.radius,
              pos    = shield.position;
          this.forEachBlock(function(block) {
            if (pos.distanceTo(block.position) <= this._config.blockSize * radius) {
              console.log("adding", shield, "to", block);
              block.addShield(shield);
            }
          });
        }
      }.bind(this));
    },

    _calcCannonValues: function() {
      this._cannons = [];
      this.forEachBlock(function(block) {
        if (block.is('Cannon')) {
          this._cannons.push(block);
          this.weaponsRange = Math.max(this.weaponsRange || 0, block.range);
        }
      }.bind(this));
    },

    _calcReactorValues: function() {
      this._reactors = [];
      this._energyProduced = 0;
      this._energyStorage = 0;
      this.forEachBlock(function(block) {
        if (block.is('Reactor')) {
          this._reactors.push(block);
          this._energyProduced += block.energyProduced;
          this._energyStorage += block.energyStorage;
        }
      }.bind(this));
    },

    _calcEngineValues: function() {
      this._engines = [];
      this.forEachBlock(function(block) {
        if (block.is('Engine')) {
          this._engines.push(block);
        }
      }.bind(this));
      this.maxSpeed = 0;
      this.acceleration = 0;
      this.rotationSpeed = 0;
      this._engineEnergyDrain = 0;
      this._engines.forEach(function(engine) {
        this.maxSpeed += engine.maxSpeed;
        this.acceleration += engine.acceleration;
        this.rotationSpeed += engine.rotationSpeed;
        this._engineEnergyDrain += engine.energyDrain;
      }.bind(this));
    },

    // find block and remove it
    _onDestroyedBlock: function(block) {
      this.forEachBlock(function(b, x, y) {
        if (b === block) {
          if (block.is('Cockpit')) {
            this.destroy();
          }
          this._blueprint[y][x] = null;
          // TODO: remove from _engine and _cannon if needed
        }
      }.bind(this));
      this._recheckEverything();
    },

    _checkHullIntegrity: function() {
      this.forEachBlock(function(block, x, y) {
        block._isConnected = false;
      });
      this._checkPathsToCockpit(this._blueprintOffset.x, this._blueprintOffset.y);
      this.forEachBlock(function(block, x, y) {
        if (!block._isConnected) {
          // TODO: make them drift away
          // but for now they will destroy right away
          block.destroy();
        }
      }.bind(this));
    },

    _checkPathsToCockpit: function(x, y) {
      var block = this._blueprint[y] && this._blueprint[y][x];
      if (block && !block._isConnected) {
        block._isConnected = true;
        this._checkPathsToCockpit(x-1, y);
        this._checkPathsToCockpit(x+1, y);
        this._checkPathsToCockpit(x, y-1);
        this._checkPathsToCockpit(x, y+1);
      }
    },

    forEachBlock: function(cb) {
      cb = cb.bind(this);
      for (var y=0; y<this._blueprint.length; ++y) {
        for (var x=0; x<this._blueprint[y].length; ++x) {
          if (this._blueprint[y][x]) {
            cb(this._blueprint[y][x], x, y);
          }
        }
      }
    },

    _generateEnergy: function(passedSeconds) {
      this.currentEnergy = Math.min(this._energyStorage, this.currentEnergy + this._energyProduced * passedSeconds);
    },

    hasEnergy: function(energy) {
      return this.currentEnergy >= energy;
    },

    drainEnergy: function(energy) {
      if (this.currentEnergy >= energy) {
        this.currentEnergy -= energy;
        return true;
      } else {
        return false;
      }
    },

    loop: function(frameDuration) {
      var passedSeconds = frameDuration/1000,
          config        = this._config,
          off           = Math.max(Math.abs(this.middlePoint.x), Math.abs(this.middlePoint.y)),
          energyMultiplier, neededEnergy;

      if (this._behavior) {
        this._behavior.step();
      }

      this._generateEnergy(passedSeconds);

      if (this.isAccel && this._engines.length) {
        neededEnergy = this._engineEnergyDrain * passedSeconds;
        if (this.hasEnergy(neededEnergy)) {
          energyMultiplier = 1;
          this.drainEnergy(neededEnergy);
        } else {
          energyMultiplier = this.currentEnergy / neededEnergy;
          this.currentEnergy = 0;
        }
        this.velocity.add(new Vector(0, -this.acceleration * energyMultiplier * passedSeconds).rotate(this.rotation));
        if (this.velocity.length() > this.maxSpeed) {
          this.velocity.normalize(this.maxSpeed);
        }

        // let the engine fire TODO:
        for (var i=this._engines.length; i--;) {
          this._engines[i].fire();
        }

        // TODO: if engine blocked, damage blocking block
        this.forEachBlock(function(block, x, y) {
          if (block && block.is('Engine') && this._blueprint[y+1] && this._blueprint[y+1][x]) {
            this._blueprint[y+1][x].damage(ENGINE_DAMAGE * energyMultiplier * passedSeconds);
          }
        });
      }

      if (this.rotationLeft || this.rotationRight) {
        this.rotation += (this.rotationLeft ? -1 : (this.rotationRight ? 1 : 0)) * this.rotationSpeed * passedSeconds;
      }

      if (this.isFiring) {
        this._fire(this.isFiring);
      }

      // move ship
      this.position.add(this.velocity.clone().skalar(passedSeconds));
      this.collidable.position = new Vector(this.position.x - off, this.position.y - off);
    },

    // remove cached drawn object so it gets redrawn
    redraw: function() {
      this.drawingObject = null;
    },

    draw: function(canvas, context) {
      if (this.destroyed) { return; }
      var self      = this,
          blockSize = self._config.blockSize;

      this.drawingObject = this.drawingObject || canvas.renderToCanvas(this.width, this.height, function(ctx) {
        for (var y=0; y<self._blueprint.length; ++y) {
          for (var x=0; x<self._blueprint[y].length; ++x) {
            if (self._blueprint[y][x]) {
              self._blueprint[y][x].draw(ctx, x*blockSize, y*blockSize);
            }
          }
        }
      });
      // ALIGN CENTER IS WRONG, it has to be done by this ship??
      canvas.drawImage(this.drawingObject, this.position.x - canvas.camera.x , this.position.y - canvas.camera.y, Canvas.ALIGN.CENTER.MIDDLE, this.rotation);
      canvas.fillStyle = 'red';
      context.fillRect(this.position.x-1, this.position.y-1, 2, 2);

      // DEBUGGING STUFF: if waypoints, draw them:
      if (DEBUG_SHOW_WAY_POINTS && this.waypoints) {
        this.waypoints.forEach(function(waypoint) {
          context.fillStyle = 'orange';
          context.fillRect(waypoint.x-1 - canvas.camera.x, waypoint.y-1 - canvas.camera.y, 2, 2);

        });
      }

      // DEBUGGING STUFF: show view Range:
      if (DEBUG_SHOW_VIEW_RANGE) {
        context.strokeStyle = '#999';
        context.beginPath();
        context.arc(this.position.x - canvas.camera.x , this.position.y - canvas.camera.y, this.viewRange, 0, Math.PI*2, true);
        context.closePath();
        context.stroke();
      }

      if (DEBUG_SHOW_ENERGY) {
        context.fillStyle = '#aaa';
        canvas.drawText('Energy: ' + Math.round(this.currentEnergy, 2), this.position.x - canvas.camera.x + this.width, this.position.y - canvas.camera.y + this.height, 0);
      }
    },

    destroy: function() {
      this.destroyed = true;
      this._removeFromCollisionDetection();
      this.emit('destroyed', this);
    },

    rotate: function(direction) {
      this.rotationLeft = direction === 'left';
      this.rotationRight = direction === 'right';
    },

    hasCannons: function() {
      return !!this._cannons.length;
    },

    /**
     *
     * @param {Boolean} accel True if it should accelerate, false or nothing else
     */
    accelerate: function(accel) {
      this.isAccel = accel;
    },

    /**
     *
     * @param {Boolean|Vector} value Trueish if it is actually firing, false or nothing else (if given Vector shoot to the vector)
     */
    firing: function(value) {
      this.isFiring = value;
      if (value) {
        this._fire(value);
      }
    },

    fire: function(vector) {
      this._fire(vector);
    },

    _fire: function(vector) {
      for (var i=this._cannons.length; i--;) {
        this._cannons[i].fire(vector && vector.constructor === Vector ? vector : null);
      }
    },

    // does ship have weapons that can shoot in different directions?
    hasMultiDirWeapons: function() {
      var has = false;
      for (var i=this._cannons.length; i--;) {
        has = has || this._cannons[i].multiDir;
      }
      return has;
    },

    // defines what it is
    is: function(what) {
      return 'SpaceShip' === what;
    },

    // define actual target of this vessel
    setTarget: function(target) {
      this.currentTarget = target;
    },

    inViewRange: function(ship) {
      return this._inRange(ship.position, this.viewRange);
    },

    inWeaponsRange: function(ship) {
      return this._inRange(ship.position, this.weaponsRange);
    },

    _inRange: function(point, range) {
      var distance = this.position.distanceTo(point);
      return distance < range;
    },

    getShipsInRange: function(range) {
      var self         = this,
          shipsInRange = [];
      this._config.game.ships.forEach(function(ship) {
        if (self !== ship && self._inRange(ship.position, range || self.weaponsRange)) {
          shipsInRange.push(ship);
        }
      });
      return shipsInRange;
    },

    hasReachedWaypoint: function(waypoint) {
      return this._inRange(waypoint.position, this.waypointTolerance);
    },

    targetNextWaypoint: function() {
      this.actualWaypoint = ++this.actualWaypoint % this.waypoints.length;
    },

    // is ship looking in target direction?
    isDirectionRight: function(point) {
      var a = point.clone().sub(this.position).normalize(1),
          b = this.getViewVector();
      return a.equals(b);
    },

    calcRotationToDo: function(point) {
      var a = point.clone().sub(this.position).rotate(90 - this.rotation);
      return Math.atan2(a.y,a.x) * 180/Math.PI;
    },

    // is ship flying in target direction?
    isVelocityRight: function(point) {
      var a = point.clone().sub(this.position).normalize(1),
          b = this.velocity.clone().normalize(1);
      return a.equals(b);
    },

    getCurrentWaypoint: function() {
      return this.waypoints[this.actualWaypoint];
    }

  });

  Object.extend(SpaceShip.prototype, EventEmitter.prototype);

  win.SpaceShip = SpaceShip;
}(window, EventEmitter, Collidable));
