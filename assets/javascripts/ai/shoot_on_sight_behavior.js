/*globals Base, Vector, Behavior, Collidable, BehaviorTree */

;(function(win) {
  "use strict";

  var behave = new BehaviorTree.Priority({
    title: 'shoot on sight',
    nodes: [
      new BehaviorTree.Task({
        title: 'shoot at target',
        run: function(ship) {
          if (ship.currentTarget && !ship.currentTarget.destroyed && ship.inWeaponsRange(ship.currentTarget)) {
            ship.firing(ship.currentTarget.position);
            this.success();
          } else {
            ship.currentTarget = null;
            ship.firing(false);
            this.fail();
          }
        }
      }),
      new BehaviorTree.Task({
        title: 'select new target',
        run: function(ship) {
          ship.getShipsInRange().forEach(function(target) {
            if (ship.friends.indexOf(target) === -1) {
              ship.setTarget(target);
            }
          }.bind(this));
          this.success();
        }
      })
    ]
  });


// or better as function for initializing?
  BehaviorTree.register('shoot on sight', behave);

  /**
   * Simple behavior that shoots on every foe that is in range of this ship cannon
   * @param {Array} [config.friends] Array of SpaceShips on which this ship will NOT shoot
   *
  var ShootOnSightBehavior = Behavior.extend({
    // Setup proximity trigger, and shoot at the targets
    _onRegister: function() {
      this._friends = this._config.friends || [];
    },

    // shoots if something is in sight
    loop: function(frameDuration) {
      if (this._currentTarget) {
        if (!this._currentTarget.destroyed && this.inRange(this._currentTarget)) {
          this._ship.firing(this._currentTarget.position);
        } else {
          this._currentTarget = null;
          this._ship.firing(false);
        }
      } else {
        this._game.ships.forEach(function(ship) {
          if (!this._currentTarget && this._ship !== ship && this.inRange(ship) && this._friends.indexOf(ship) === -1) {
            this._currentTarget = ship;
          }
        }.bind(this));
      }
    }
  });

  win.ShootOnSightBehavior = ShootOnSightBehavior;
  */
}(window));
