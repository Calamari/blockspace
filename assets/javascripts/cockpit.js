/*globals Base, Vector, ShipPartDef */

;(function(win, ShipPart) {
  "use strict";

  var Cockpits = {
    'default': new ShipPartDef('Cockpit', 'default', {
      title: 'One man cockpit',
      description: 'The command center of every ship. If this is destroyed the ship is as well. This standard cockpit produces a bit of energy to power your ship as well.',
      config: {
        energyProduced: 4,
        energyStorage: 30
      }
    })
  };

  var Cockpit = ShipPart.extend({
    _baseColor: [64, 64, 255],
    type: 'Cockpit',

    constructor: function(position, config) {
      var cockpitConfig = Cockpits[config.subtype || 'default'];
      config = Object.extend(Object.extend({}, cockpitConfig ? cockpitConfig.config : {}), config);
      this.base(position, config);
      this.energyProduced = this._config.energyProduced;
      this.energyStorage = this._config.energyStorage;
    },

    // defines what it is
    is: function(what) {
      return 'Cockpit' === what || 'Reactor' === what;
    }
  });

  win.Cockpits = Cockpits;
  win.Cockpit = Cockpit;
}(window, ShipPart));
