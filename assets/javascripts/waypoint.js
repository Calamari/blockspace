/*globals Base, Vector */

;(function(win, Collidable) {
  "use strict";

  var Waypoint = Base.extend({
    type: 'Waypoint',

    constructor: function(x, y) {
      this.position = new Vector(x, y);
    },

    // defines what it is
    is: function(what) {
      return this.type === what;
    }
  });

  win.Waypoint = Waypoint;
}(window, Collidable));
