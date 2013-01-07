/*globals Base, Vector */

;(function(win) {
  "use strict";

  var Behavior = Base.extend({
    constructor: function() {

    },

    setup: function(ship, game) {
      console.log("SET", arguments);
      this._ship = ship;
      this._game = game;
      this.started = true;
      this._onRegister();
    },

    // called when behavior is being registerd
    _onRegister: function() {

    },

    // called when behavior is being unregisterd (or ship is destroyed)
    _onDestroy: function() {

    },

    // should be overriden by real behavior that does something
    loop: function(frameDuration) {
    }
  });

  win.Behavior = Behavior;
}(window));
