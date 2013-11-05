/*globals Base, Vector, Canvas */

;(function(win) {
  "use strict";

  var Radar = Base.extend({
    constructor: function(game) {
      this._game = game;
      this._drawnArrow = {};
    },

    draw: function(canvas, context, playerPosition, canvasWidth, canvasHeight, camera) {
      var self = this,
          game = this._game;
      game.ships.forEach(function(ship) {
        if (!ship.isPlayer && self._checkShip(ship.position, playerPosition, canvasWidth, canvasHeight)) {
          self._drawForPosition(canvas, context, ship.position, playerPosition, camera, canvasHeight/2-20, canvasWidth/2-20, '#a00');
        }
      });
      if (game.activeMission && game.activeMission.centralPosition &&
          self._checkShip(game.activeMission.centralPosition, playerPosition, canvasWidth, canvasHeight)) {
        self._drawForPosition(canvas, context, game.activeMission.centralPosition, playerPosition, camera, canvasHeight/2-20, canvasWidth/2-20, '#dda');
      }
    },

    _drawForPosition: function(canvas, context, pointPosition, playerPosition, camera, heightHalf, widthHalf, color) {
      var rotation = new Vector(0, 1).rotationBetween(playerPosition.clone().sub(pointPosition)),
          position = new Vector(0, 1),
          arrow = this._drawArrow(canvas, color),
          arrowDistance;

      if (pointPosition.x < playerPosition.x) {
        rotation *= -1;
      }
      position = position.rotate(rotation);
      arrowDistance = Math.min(Math.abs(heightHalf / Math.cos(rotation * Math.PI/180)), Math.abs(widthHalf / Math.cos((rotation-90) * Math.PI/180)));
      position = position.skalar(arrowDistance);

      canvas.drawImage(arrow, -position.x + playerPosition.x - canvas.camera.x , -position.y + playerPosition.y - canvas.camera.y, Canvas.ALIGN.CENTER.MIDDLE, rotation);
    },

    _drawArrow: function(canvas, color) {
      this._drawnArrow[color] = this._drawnArrow[color] || canvas.renderToCanvas(20, 20, function(ctx) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(16, 20);
        ctx.lineTo(2, 20);
        ctx.fill();
      });
      return this._drawnArrow[color];
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
