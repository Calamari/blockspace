/*globals Base, Vector, Behavior, Collidable, BehaviorTree */

;(function(win) {
  "use strict";

  var rotationToWaypoint;

  var behave = new BehaviorTree.Sequence({
    title: 'flying waypoints',
    nodes: [
      new BehaviorTree.Task({
        title: 'initIfNecessary',
        run: function(ship) {
          // TODO: have to be a decorator, or done somewhere else?:
          if (!ship.waypointsInitialized) {
            var config = ship._config;

            ship.waypoints = config.waypoints;
            // tolerance should be height enough to make ship not fly in circle around waypoint
            ship.waypointTolerance = config.pointTolerance || 50;
            ship.actualWaypoint = 0;
            ship.recentlyRotated = 0;

            ship.waypointsInitialized = true;
          }
          this.success();
        }
      }),
      new BehaviorTree.Task({
        title: 'target next waypoint if waypoint reached',
        run: function(ship) {
          if (ship.hasReachedWaypoint(ship.waypoints[ship.actualWaypoint])) {
            ship.targetNextWaypoint();
          }
          this.success();
        }
      }),
      new BehaviorTree.Selector({
        nodes: [
          new BehaviorTree.Task({
            title: 'rotate to waypoint',
            run: function(ship) {
              var rotationToWaypoint = ship.calcRotationToDo(ship.getCurrentWaypoint().position);
              if (Math.abs(rotationToWaypoint) > 4) {
                ship.rotate(rotationToWaypoint > 0 ? 'right' : 'left');
                ++ship.recentlyRotated;
                this.success();
              } else {
                this.fail();
              }
            }
          }),
          new BehaviorTree.Task({
            title: 'fly to waypoint',
            run: function(ship) {
              ship.rotate(false);
              //ship.accelerate(ship.recentlyRotated > 5 || ship.velocity.length() < ship.maxSpeed - 0.0001);
              ship.accelerate(true);
              if (ship.recentlyRotated > 5) {
                ship.recentlyRotated = 0;
              }
              this.success();
            }
          })
        ]
      })
    ]
  });

  BehaviorTree.register('flying waypoints', behave);






  /**
   * Simple behavior that flies ship from waypoint to waypoint
   * @param {Number} [config.viewRange]      How far can unit see?
   * @param {Array}   config.waypoints       Array of Vectors defining the waypoints the ship should follow
   * @param {Number} [config.pointTolerance] How near has unit to get to waypoint?
   *
  var WaypointBehavior = Behavior.extend({
    // Setup proximity trigger, and shoot at the targets
    _onRegister: function() {
      this._viewRange = this._config.viewRange || 100;
      this._waypoints = this._config.waypoints;
      // tolerance should be height enough to make ship not fly in circle around waypoint
      this._tolerance = this._config.pointTolerance || 50;
      this._actualWaypoint = 0;
      this._recentlyRotated = 0;
    },

    // shoots if something is in sight
    loop: function(frameDuration) {
      var ship = this._ship,
          waypoint = this._waypoints[this._actualWaypoint],
          rotationToWaypoint;
// waypoint reached
      if (this._isWaypointReached(waypoint)) {
        this._targetNextWaypoint();
        waypoint = this._waypoints[this._actualWaypoint];
        console.log("NEXT waypoint", waypoint);
      }
      //ship.accelerate(true);
      //console.log(this._calcRotationToDo(waypoint));

// selector: move
  //rotate for waypoint
      rotationToWaypoint = this._calcRotationToDo(waypoint);
      //console.log(rotationToWaypoint, Math.abs(rotationToWaypoint));
      if (Math.abs(rotationToWaypoint) > 4) {
        // turn ship
        ship.rotate(rotationToWaypoint > 0 ? 'right' : 'left');
        ++this._recentlyRotated;
      } else {
  // accelerate
        ship.rotate(false);
        ship.accelerate(this._recentlyRotated > 5 || ship.velocity.length() < ship.maxSpeed - 0.0001)
        ship.accelerate(true);
        if (this._recentlyRotated > 5) {
          this._recentlyRotated = 0;
        }
      }
//      win.STOP = 1;
    },

    inRange: function(ship) {
      var distance = this._ship.position.distanceTo(ship.position);
      return distance < this._viewRange;
    },

    _isWaypointReached: function(point) {
      var distance = this._ship.position.distanceTo(point);
      return distance <= this._tolerance;
    },

    _targetNextWaypoint: function() {
      this._actualWaypoint = ++this._actualWaypoint % this._waypoints.length;
    },

    // is ship looking in target direction?
    _isDirectionRight: function(point) {
      var a = point.clone().sub(this._ship.position).normalize(1),
          b = this._ship.getViewVector();
      return a.equals(b);
    },

    _calcRotationToDo: function(point) {
      var a = point.clone().sub(this._ship.position).rotate(90 - this._ship.rotation);
      return Math.atan2(a.y,a.x) * 180/Math.PI;

          //b = this._ship.getViewVector();
      console.log("A:", Math.atan2(a.y,a.x) * 180/Math.PI, Math.atan2(b.y,b.x) * 180/Math.PI, this._ship.rotation - 90);
      //console.log(point, point.clone().sub(this._ship.position), this._ship.position.clone().sub(point));
      return new Vector(0, -1).rotationBetween(a);
    },

    // is ship flying in target direction?
    _isVelocityRight: function(point) {
      var a = point.clone().sub(this._ship.position).normalize(1),
          b = this._ship.velocity.clone().normalize(1);
      return a.equals(b);
    }
  });

  win.WaypointBehavior = WaypointBehavior;*/
}(window));
