/*globals Base, SpaceShip, Vector,
          Cockpits, Engines, Hulls, Cannons */

;(function(win, doc) {
  "use strict";

  var Player = function(config) {
    Object.extend(this, config || {});
    this._createShip = function() {
      this.ship = new SpaceShip({
        title: 'PlayerShip',
        position: new Vector(0, 0),
        particleSystem: this.particleSystem,
        collisionSystem: this.collisionController.getSystem(),
        rotation: 0,
        bulletSystem: this.bulletSystem,
        blueprint: [
          [Cannons.default],
          [Cockpits.default],
          [Engines.default]
        ],
        player: true
      });
    };

    this._createShip();
  };

  win.Player = Player;
}(window, document));
