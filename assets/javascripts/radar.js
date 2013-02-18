/*globals Base, Vector, Canvas */

;(function(win) {
  "use strict";

  var Radar = Base.extend({
    constructor: function(game) {
      this._game = game;
    },

    draw: function(canvas, context, playerPosition, canvasWidth, canvasHeight, camera) {
      var self = this;
      this._game.ships.forEach(function(ship) {
        if (!ship.isPlayer && self._checkShip(ship.position, playerPosition, canvasWidth, canvasHeight)) {
          self._drawForShip(canvas, context, ship, playerPosition, camera, canvasHeight/2-20, canvasWidth/2-20);
        }
      });
    },

    _drawForShip: function(canvas, context, ship, playerPosition, camera, heightHalf, widthHalf) {
      var rotation = new Vector(0, 1).rotationBetween(playerPosition.clone().sub(ship.position)),
          position = new Vector(0, 1),
          arrow = this._drawArrow(canvas),
          arrowDistance;

      if (ship.position.x < playerPosition.x) {
        rotation *= -1;
      }
      position = position.rotate(rotation);
      arrowDistance = Math.min(Math.abs(heightHalf / Math.cos(rotation * Math.PI/180)), Math.abs(widthHalf / Math.cos((rotation-90) * Math.PI/180)));
      position = position.skalar(arrowDistance);

      canvas.drawImage(arrow, -position.x + playerPosition.x - canvas.camera.x , -position.y + playerPosition.y - canvas.camera.y, Canvas.ALIGN.CENTER.MIDDLE, rotation);
    },

    _drawArrow: function(canvas) {
      this._drawnArrow = this._drawnArrow || canvas.renderToCanvas(20, 20, function(ctx) {
        ctx.fillStyle = '#a00';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(16, 20);
        ctx.lineTo(2, 20);
        ctx.fill();
      });
      return this._drawnArrow;
    },

    _checkShip: function(shipPosition, playerPosition, canvasWidth, canvasHeight) {
      return shipPosition.x < playerPosition.x - canvasWidth/2 ||
             shipPosition.x > playerPosition.x + canvasWidth/2 ||
             shipPosition.y < playerPosition.y - canvasHeight/2 ||
             shipPosition.y > playerPosition.y + canvasHeight/2;
    }
  });

  win.Radar = Radar;
}(window));
