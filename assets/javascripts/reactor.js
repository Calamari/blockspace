/*globals Base, Vector, ShipPartDef */

;(function(win, ShipPart) {
  "use strict";

  var Reactors = {
    'default': new ShipPartDef('Reactor', 'default', {
      title: 'Small kitchen reactor',
      description: 'Produces enough energy to keep you flying.',
      config: {
        price: 3,
        energyProduced: 2,
        energyStorage: 20
      }
    })
  };

  var Reactor = ShipPart.extend({
    _baseColor: [64, 64, 128],
    type: 'Reactor',

    constructor: function(position, config) {
      var cockpitConfig = Reactors[config.subtype || 'default'];
      config = Object.extend(Object.extend({}, cockpitConfig ? cockpitConfig.config : {}), config);
      this.base(position, config);
      this.energyProduced = this._config.energyProduced;
      this.energyStorage = this._config.energyStorage;
    },

    // defines what it is
    is: function(what) {
      return 'Reactor' === what;
    }
  });

  win.Reactors = Reactors;
  win.Reactor = Reactor;
}(window, ShipPart));
