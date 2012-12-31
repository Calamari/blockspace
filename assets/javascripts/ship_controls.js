/*globals Base, Vector */

;(function(win, doc, $) {
  "use strict";

  var KEYCODE = {
    CANCEL: 3,
    HELP: 6,
    BACK_SPACE: 8,
    TAB: 9,
    CLEAR: 12,
    RETURN: 13,
    ENTER: 14,
    SHIFT: 16,
    CONTROL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    PRINTSCREEN: 44,
    INSERT: 45,
    DELETE: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    SEMICOLON: 59,
    EQUALS: 61,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90
  };

  var ShipControls = Base.extend({
    /**
     * @param {Spaceship} ship The ship to control
     */
    constructor: function(ship) {
      this.setShip(ship);
    },

    setShip: function(ship) {
      this._ship = ship;
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

    _onKeyDown: function(event) {
      var ship = this._ship;
      switch (event.which) {
        case KEYCODE.UP:
        case KEYCODE.W:
          ship.accelerate(true);
          break;
        case KEYCODE.RIGHT:
        case KEYCODE.D:
          ship.rotate('right');
          break;
        case KEYCODE.DOWN:
        case KEYCODE.S:
          break;
        case KEYCODE.LEFT:
        case KEYCODE.A:
          ship.rotate('left');
          break;
        case KEYCODE.SPACE:
          ship.firing(true);
          break;
      }
    },

    _onKeyUp: function(event) {
      var ship = this._ship;
      switch (event.which) {
        case KEYCODE.UP:
        case KEYCODE.W:
          ship.accelerate(false);
          break;
        case KEYCODE.RIGHT:
        case KEYCODE.D:
          ship.rotate(false);
          break;
        case KEYCODE.DOWN:
        case KEYCODE.S:
          break;
        case KEYCODE.LEFT:
        case KEYCODE.A:
          ship.rotate(false);
          break;
        case KEYCODE.SPACE:
          ship.firing(false);
          break;
      }
    }
  });

  win.ShipControls = ShipControls;
  win.KEYCODE = KEYCODE;
}(window, document, Gator));
