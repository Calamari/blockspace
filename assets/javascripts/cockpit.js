/*globals Base, Vector, ShipPartDef */

;(function(win, ShipPart) {
  "use strict";

  var Cockpits = {
    'default': new ShipPartDef('Cockpit', 'default', {
      title: 'cockpit',
      description: 'The command center of every ship. If this is destroyed the ship is as well. This standard cockpit produces a bit of energy to power your ship as well.'
    })
  };

  var Cockpit = ShipPart.extend({
    _baseColor: [64, 64, 255],
    type: 'Cockpit'
  });

  win.Cockpits = Cockpits;
  win.Cockpit = Cockpit;
}(window, ShipPart));
