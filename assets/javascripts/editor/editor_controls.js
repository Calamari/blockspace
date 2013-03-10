/*globals Base, KEYCODE */

;(function(win, doc, $) {
  "use strict";

  var EditorControls = Base.extend({
    /**
     * @param {Spaceship} ship The ship to control
     */
    constructor: function(game, defLayer) {
      this._game = game;
      this._defLayer = defLayer;
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
      if (event.which === KEYCODE.B) {
        this._defLayer.toggle();
      }
    }
  });

  win.EditorControls = EditorControls;
}(window, document, Gator));
