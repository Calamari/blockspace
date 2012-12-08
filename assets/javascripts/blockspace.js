/*globals Base, Vector, Canvas, SpaceShip, ParticleSystem, CollisionDetection, ShipControls, Collidable, CollisionController, Bullet */

;(function(win, doc) {
  "use strict";

  win.addEventListener('DOMContentLoaded', function() {
    var canvasElement = doc.getElementById('canvas'),
        ctx = canvasElement.getContext('2d'),

        fpsDiv = doc.getElementById('showfps'),
        posDiv = doc.getElementById('showpos'),

        canvas,

        particleSystem     = new ParticleSystem(),
        bulletSystem       = new ParticleSystem(),

        collisionController = new CollisionController(),

        playerShip = new SpaceShip({
          position: new Vector(0, 0),
          particleSystem: particleSystem,
          collisionSystem: collisionController.getSystem(),
          rotation: 0,
          bulletSystem: bulletSystem
        }),

        anotherShip = new SpaceShip({
          position: new Vector(0, -160),
          rotation: -90,
          blueprint: [
            [Cannon, Hull],
            [Hull, Cockpit],
            [Engine, Engine]
          ],
          particleSystem: particleSystem,
          collisionSystem: collisionController.getSystem(),
          bulletSystem: bulletSystem
        }),

        controls = new ShipControls(playerShip);

    canvas = new Canvas('canvas', 60, function(context, frameDuration, totalDuration, frameNumber) {
      if (this.firstFrame) {
        this.camera = new Vector(-win.innerWidth/2, -win.innerHeight/2);
        canvasElement.width = win.innerWidth;
        canvasElement.height = win.innerHeight;
      }
      this.clear();

      playerShip.draw(this, context);
      playerShip.loop(frameDuration);

      anotherShip.draw(this, context);
      anotherShip.loop(frameDuration);

      // draw particles
      particleSystem.loop(frameDuration);
      particleSystem.draw(this);

      // draw bullets
      bulletSystem.loop(frameDuration);
      bulletSystem.draw(this);

      // draw fps rate
      fpsDiv.innerHTML = this.currentFps;

      // draw ships position
      posDiv.innerHTML = Math.round(playerShip.position.x) + ':' + Math.round(playerShip.position.y);

      collisionController.loop(frameDuration);
    });

    win.controls = controls;
  });
}(window, document));
