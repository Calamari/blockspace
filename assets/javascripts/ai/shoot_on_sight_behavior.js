/*globals Base, Vector, Behavior, Collidable */

;(function(win) {
  "use strict";

  /**
   * Simple behavior that shoots on every foe that is in range of this ship cannon
   * @param {Array} [config.friends] Array of SpaceShips on which this ship will NOT shoot
   */
  var ShootOnSightBehavior = Behavior.extend({
    // Setup proximity trigger, and shoot at the targets
    _onRegister: function() {
      this._friends = this._config.friends;
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
    },

    inRange: function(ship) {
      var distance = this._ship.position.distanceTo(ship.position);
      return distance < this._ship.range;
    }
  });

  win.ShootOnSightBehavior = ShootOnSightBehavior;
}(window));
