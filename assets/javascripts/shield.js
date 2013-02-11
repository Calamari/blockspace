/*globals Base, Vector, ShipPartDef */


/**
 * A shield drains energy if hit but absorbs the damage then
 */
;(function(win, ShipPart) {
  "use strict";
  var TYPE_SHIELD = 'Shield';

  var Shields = {
    'default': new ShipPartDef(TYPE_SHIELD, 'default', {
      title: 'Regular Phase Shield',
      description: 'A phase shield from the hardware store. Small, practical and energy consuming.',
      config: {
        strength: 20,
        radius: 1,
        price: 6,
        energyDrain: 10
      }
    })
  };

  var Shield = ShipPart.extend({
    _baseColor: [255, 184, 64],
    type: TYPE_SHIELD,
    subtype: 'default',

    constructor: function(position, config) {
      var shieldConfig = Shields[config.subtype || 'default'];
      config = Object.extend(Object.extend({
        // no defaults
      }, shieldConfig.config), config);
      this.base(position, config);
      this.strength = config.strength;
      this.radius = config.radius;
      this.energyDrain = config.energyDrain;
    },

    absorb: function(damage) {
      // TODO: nice absorbtion effect
      var absorbingDamage = Math.min(this.strength, damage),
          neededEnergy = (absorbingDamage / this.strength) * this.energyDrain,
          multiplier;
      if (!this.ship.drainEnergy(neededEnergy)) {
        multiplier = this.ship.currentEnergy / neededEnergy;
        absorbingDamage *= multiplier;
        this.ship.drainEnergy(neededEnergy * multiplier);
      }
      return absorbingDamage;
    }
  });

  win.Shield = Shield;
  win.Shields = Shields;
}(window, ShipPart));
