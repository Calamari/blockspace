/*globals Base, Vector, BehaviorTree, SpaceShip, SpaceMine, Waypoint */

;(function(win) {
  'use strict';

  var Mission = Base.extend({
    constructor: function(game) {
      this._game = game;
      this._ships = [];
      this.centralPosition = null;
    },
    _loop: function(passedSeconds) {},
    _isSuccess: function() { return false; },
    _isFailure: function() { return false; },
    start: function() {
      this._createShips();
    },
    end: function() {
      this._destroyShips();
    },
    _createShips: function() {},
    _destroyShips: function() {
      this._ships.forEach(function(ship) {
        ship.destroy();
      });
    }
  });
  var Mission1 = Mission.extend({
    _createShips: function() {
      this.centralPosition = new Vector(-500, -300);
      var game = this._game;
      var enemyBehavior = new BehaviorTree.Priority({
            title: 'follow or waypoints',
            nodes: [
              'flee if defenseless',
              'follow player',
              'flying waypoints'
            ]
          }),
          enemyShip = new SpaceShip({
            position: new Vector(0, -300),
            particleSystem: game.particleSystem,
            collisionSystem: game.collisionController.getSystem(),
            rotation: -90,
            bulletSystem: game.bulletSystem,
            title: 'testEnemy1',
            behavior: enemyBehavior,
            waypoints: [new Waypoint(-200, -200), new Waypoint(100, -200)],
            blueprint: [
              [Cannons.default, Hulls.default],
              [Hulls.default, Cockpits.default],
              [Engines.default, Hulls.default]
            ],
            game: game
          }),
          enemyShip2 = new SpaceShip({
            position: new Vector(0, -400),
            particleSystem: game.particleSystem,
            collisionSystem: game.collisionController.getSystem(),
            rotation: 60,
            bulletSystem: game.bulletSystem,
            title: 'testEnemy2',
            behavior: enemyBehavior,
            waypoints: [new Waypoint(-400, -400), new Waypoint(200, -280)],
            blueprint: [
              [Cannons.default, Hulls.default],
              [Hulls.default, Cockpits.default],
              [Engines.default, Hulls.default]
            ],
            game: game
          }),
          spaceMine = new SpaceMine({
            title: 'spaceMine1',
            particleSystem: game.particleSystem,
            collisionSystem: game.collisionController.getSystem(),
            bulletSystem: game.bulletSystem,
            position: new Vector(this.centralPosition.x+60, this.centralPosition.y),
            friends: [enemyShip, enemyShip2],
            behavior: 'shoot on sight',
            game: game
          });

      this._ships = [enemyShip, enemyShip2, spaceMine];
      this._ships.forEach(function(ship) {
        game.addShip(ship);
      });
    }
  });


  win.Mission = Mission;
  win.Mission1 = Mission1;
}(window));
