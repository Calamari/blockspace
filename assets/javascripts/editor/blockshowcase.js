/*globals Base, Vector, Canvas, SpaceShip, ParticleSystem, CollisionDetection,
          ShipControls, Collidable, CollisionController, Bullet, SpaceBackground,
          ArcadeText, GameLogic */
//= require ../application

;(function(win, doc) {
  "use strict";

  var BlockShowCase = function(canvasId) {
    var canvasElement = doc.getElementById(canvasId),

        canvas,

        particleSystem = new ParticleSystem(),
        bulletSystem   = new ParticleSystem(),

        collisionController = new CollisionController(),

        player = new Player({
          credits: 6,
          particleSystem: particleSystem,
          collisionController: collisionController,
          bulletSystem: bulletSystem
        }),

        ship1 = new SpaceShip({
          position: new Vector(30, 160),
          blueprint: [
            [Cannon],
            [Cockpit],
            [Engine]
          ],
          velocity: new Vector(0,0),
          particleSystem: particleSystem,
          collisionSystem: collisionController.getSystem(),
          bulletSystem: bulletSystem
        }),

        ship2 = new SpaceShip({
          position: new Vector(30, 160),
          blueprint: [
            [Cannon],
            [Cockpit],
            [Engine]
          ],
          velocity: new Vector(0,0),
          particleSystem: particleSystem,
          collisionSystem: collisionController.getSystem(),
          bulletSystem: bulletSystem
        }),

        ships = [
          ship1
        ],

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
    });

  };

  win.addEventListener('DOMContentLoaded', function() {
    var gameEngine = new BlockShowCase('canvas');

  });
}(window, document));
