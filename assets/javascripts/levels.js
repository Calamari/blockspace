/*globals Base, Vector, BehaviorTree, SpaceShip, Waypoint */

;(function(win) {
  "use strict";

  var Levels = {
    start1: function(game) {
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
          });

      game.ships.push(enemyShip);
      game.ships.push(enemyShip2);
    }
  };


  win.Levels = Levels;
}(window));
