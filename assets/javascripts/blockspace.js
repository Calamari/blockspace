/*globals Base, Vector, Canvas, SpaceShip */

;(function(win) {
  "use strict";

  window.addEventListener('DOMContentLoaded', function() {
    var canvasElement = document.getElementById('canvas'),
        ctx = canvasElement.getContext('2d'),

        fpsDiv = document.getElementById('showfps'),

        canvas,

        particleSystem      = new ParticleSystem(),
        bulletSystem        = new ParticleSystem(),

        playerShip = new SpaceShip({
          position: new Vector(0, 0),
          particleSystem: particleSystem,
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

      // draw particles
      particleSystem.loop(frameDuration);
      particleSystem.draw(this);

      // draw bullets
      bulletSystem.loop(frameDuration);
      bulletSystem.draw(this);
      fpsDiv.innerHTML = this.currentFps;
    });

    window.controls = controls;
  });
}(window));
