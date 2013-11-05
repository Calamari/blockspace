/*globals Base */

;(function(win, undef) {
  "use strict";

  var Game = Base.extend({
    constructor: function(fsm) {
      this.ships = [];
      this.fsm = fsm;
    },

    addShip: function(ship) {
      var game = this;
      // TODO: check if ship is already in here
      ship.on('destroyed', function() {
        // remove ship from drawing objects
        game.removeShip(ship);
      });
      this.ships.push(ship);
    },

    removeShip: function(ship) {
      for (var i=this.ships.length; i--;) {
        if (this.ships[i] === ship) {
          this.ships.splice(i, 1);
          break;
        }
      }
    },

    pause: function(value) {
      if (value === undef) {
        return this.fsm.is('pause');
      } else {
        if (value && this.fsm.can('pause')) {
          this.fsm.pause();
        } else if (!value && this.fsm.can('unpause')) {
          this.fsm.unpause();
        }
      }
    },

    set: function(options) {
      Object.extend(this, options);
    }
  });

  win.Game = Game;
}(window));
