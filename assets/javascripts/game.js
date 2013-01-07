/*globals Base */

;(function(win) {
  "use strict";

  var Game = Base.extend({
    constructor: function() {
      this.ships = [];
    }
  });

  win.Game = Game;
}(window));
