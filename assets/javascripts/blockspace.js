/*globals Base, Vector, Canvas, SpaceShip, ParticleSystem, ShipControls */

;(function(win, doc) {
  "use strict";

  win.addEventListener('DOMContentLoaded', function() {
    var canvasElement = doc.getElementById('canvas'),
        ctx = canvasElement.getContext('2d'),

        fpsDiv = doc.getElementById('showfps'),
        posDiv = doc.getElementById('showpos'),

        canvas,

        particleSystem = new ParticleSystem(),
        bulletSystem   = new ParticleSystem(),

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

      // draw fps rate
      fpsDiv.innerHTML = this.currentFps;

      // draw ships position
      posDiv.innerHTML = Math.round(playerShip.position.x) + ':' + Math.round(playerShip.position.y);
    });

    win.controls = controls;
  });
}(window, document));
