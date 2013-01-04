/*globals Base, Vector, Canvas, SpaceShip, ParticleSystem, CollisionDetection,
          ShipControls, Collidable, CollisionController, Bullet, SpaceBackground,
          Cannons, Engines, Cockpits, Hulls,
          ArcadeText, GameLogic */

//= require ../application
//= require ../block_definition_layer

;(function(win, doc) {
  "use strict";

  var BlockShowCase = function(canvasId) {
    var canvasElement = doc.getElementById(canvasId),

        canvas,

        particleSystem = new ParticleSystem(),
        bulletSystem   = new ParticleSystem(),

        collisionController = new CollisionController(),

        ships = [
          new SpaceShip({
            position: new Vector(30, 160),
            blueprint: [
              [Cannons.default],
              [Cockpits.default],
              [Engines.default]
            ],
            velocity: new Vector(0,0),
            particleSystem: particleSystem,
            collisionSystem: collisionController.getSystem(),
            bulletSystem: bulletSystem
          }),

          new SpaceShip({
            position: new Vector(80, 160),
            blueprint: [
              [Cannons.type2],
              [Cockpits.default],
              [Engines.default]
            ],
            velocity: new Vector(0,0),
            particleSystem: particleSystem,
            collisionSystem: collisionController.getSystem(),
            bulletSystem: bulletSystem
          })
        ],

        defLayer = new BlockDefinitionLayer(new Vector(50,50), ships[1]._engines[0]),

        space = new SpaceBackground('canvas-bg'),

        hEngines = new ArcadeText('Engines & cannons:', { x: 10, y: 10 });

    ships.forEach(function(ship) {
      ship._origPosition = ship.position.clone();
      ship.accelerate(true);
      ship.firing(true);
    });

    canvas = new Canvas('canvas', 60, function(context, frameDuration, totalDuration, frameNumber) {
      if (this.firstFrame) {
        this.camera = new Vector();
        canvasElement.width = win.innerWidth;
        canvasElement.height = win.innerHeight;
      }
      this.clear();
      space.draw(this.camera);
      hEngines.draw(context);

      // draw ships
      ships.forEach(function(ship) {
        ship.draw(this, context);
        ship.loop(frameDuration);
        ship.position = ship._origPosition.clone();
      }.bind(this));

      // draw particles
      particleSystem.loop(frameDuration);
      particleSystem.draw(this);

      // draw bullets
      bulletSystem.loop(frameDuration);
      bulletSystem.draw(this);

      defLayer.draw(this, context);
    });

  };

  win.addEventListener('DOMContentLoaded', function() {
    var gameEngine = new BlockShowCase('canvas');

  });
}(window, document));
