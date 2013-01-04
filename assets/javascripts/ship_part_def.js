/*globals Base, Cannon, Engine, Hull, Cockpit */

;(function(win) {
  "use strict";

  var ShipPartDef = function(type, subtype, shipPartConfig) {
    var self = this;

    return Object.extend({
      // used to construct instance of real ship part
      construct: function(position, config) {
        config.subtype = subtype;
        var instance = new win[type](position, config);
        instance.definition = this;
        return instance;
      }

    // allow to access the default config for this block
    }, shipPartConfig);
  };

  win.ShipPartDef = ShipPartDef;
}(window));
