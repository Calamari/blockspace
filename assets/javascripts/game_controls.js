/*globals Base, KEYCODE */

;(function(win, doc, $) {
  "use strict";

  var GameControls = Base.extend({
    /**
     * @param {Spaceship} ship The ship to control
     */
    constructor: function(game) {
      this._game = game;
      this.start();
    },

    start: function() {
      // enhance so they can be shut off again
      this._onKeyDown = this._onKeyDown.bind(this);
      this._onKeyUp = this._onKeyUp.bind(this);
      $(doc)
        .on('keydown', this._onKeyDown)
        .on('keyup', this._onKeyUp);
    },

    stop: function() {
      $(doc)
        .off('keydown', this._onKeyDown)
        .off('keyup', this._onKeyUp);
    },

    _onKeyDown: function(event) {},

    _onKeyUp: function(event) {
      var game = this._game;
      if (event.which === KEYCODE.P) {
        game.pause(!game.pause());
      }
    }
  });

  win.GameControls = GameControls;
}(window, document, Gator));
