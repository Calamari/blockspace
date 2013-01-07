/*globals Base, Vector, Behavior, Collidable */

;(function(win) {
  "use strict";

  var ShootOnSightBehavior = Behavior.extend({
    // Setup proximity trigger, and shoot at the targets
    _onRegister: function() {
    },

    // shoots if something is in sight
    loop: function(frameDuration) {
      if (this._currentTarget) {
        if (this.inRange(this._currentTarget)) {
          this._ship.firing(this._currentTarget.position);
        } else {
          this._currentTarget = null;
          this._ship.firing(false);
        }
      } else {
        this._game.ships.forEach(function(ship) {
          if (!this._currentTarget && this._ship !== ship && this.inRange(ship)) {
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
