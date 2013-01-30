/*globals Base */

;(function(win, undef) {
  "use strict";

  var Game = Base.extend({
    constructor: function(fsm) {
      this.ships = [];
      this.fsm = fsm;
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
    }
  });

  win.Game = Game;
}(window));
