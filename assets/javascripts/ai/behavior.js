/*globals Base, Vector */

;(function(win) {
  "use strict";

  /**
   * Baseclass for any behavior
   * @param {Object} [config] Hash containing some configuration for any behavior
   */
  var Behavior = Base.extend({
    constructor: function(config) {
      this._config = config;
    },

    /**
     * Call this to make this Behavior ready to work
     */
    setup: function(ship, game) {
      this._ship = ship;
      this._game = game;
      this.started = true;
      this._onRegister();
      this._ship.on('destroyed', function() {
        this.stop();
        this._onDestroy();
      }.bind(this));
    },

    stop: function() {
      this.started = false;
    },

    /**
     * called when behavior is being registered
     */
    _onRegister: function() {

    },

    /**
     * called when behavior is being unregisterd (or ship is destroyed)
     */
    _onDestroy: function() {

    },

    /**
     * should be overriden by real behavior that does something
     * @param {Number} [frameDuration] How many microseconds have passed since last frame
     */
    loop: function(frameDuration) {
    }
  });

  win.Behavior = Behavior;
}(window));
