/*globals Base, SpaceShip, Vector,
          Cockpit, Engine, Hull, Cannon */

;(function(win, doc) {
  "use strict";

  var Player = function(config) {
    Object.extend(this, config || {});
    this._createShip = function() {
      this.ship = new SpaceShip({
        position: new Vector(0, 0),
        particleSystem: this.particleSystem,
        collisionSystem: this.collisionController.getSystem(),
        rotation: 0,
        bulletSystem: this.bulletSystem,
        blueprint: [
          [Cockpits.default],
          [Engine.default]
        ]
      });
    };

    this._createShip();
  };

  win.Player = Player;
}(window, document));
