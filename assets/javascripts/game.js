/*globals Base */

;(function(win, undef) {
  "use strict";

  var Game = Base.extend({
    constructor: function() {
      this.ships = [];
    },

    pause: function(value) {
      if (value === undef) {
        return this._pause;
      } else {
        this._pause = value;
      }
    }
  });

  win.Game = Game;
}(window));
