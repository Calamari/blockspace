/*globals Base, Cannon, Engine, Hull, Cockpit */

;(function(win) {
  "use strict";

  var ShipPartDef = function(type, subtype, shipPartConfig) {
    var self = this;

    return Object.extend({
      type: type,
      // used to construct instance of real ship part
      construct: function(position, config) {
        config = config || {};
        config.subtype = subtype;
        return new win[type](position, config);
      }

    // allow to access the default config for this block
    }, shipPartConfig);
  };

  win.ShipPartDef = ShipPartDef;
}(window));
