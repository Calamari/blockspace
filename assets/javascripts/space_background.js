/*globals Base, Vector */
/*
  Creates a space Background with some parallax scrolling effect
 */
;(function(win, doc) {
  "use strict";
  var BODY,
      LAYERS  = 3,
      DENSITY = 100,
      HEIGHT  = win.innerHeight,
      WIDTH   = win.innerWidth;

  var SpaceBackground = Base.extend({
    constructor: function(canvasId) {
      BODY = doc.getElementsByTagName('body')[0];
      this._canvas = doc.getElementById(canvasId);
      this._canvas.width = WIDTH;
      this._canvas.height = HEIGHT;
      this._ctx = this._canvas.getContext('2d');
      this._createSpace();
    },

    _createSpace: function() {
      var layers = [];
      for (var l = LAYERS; l--;) {
        layers[l] = [];
        for (var i = DENSITY; i--;) {
          layers[l].push({ x: Math.random() * WIDTH, y: Math.random() * HEIGHT, alpha: Math.random() / 2 + 0.5 });
        }
      }
      this._layers = layers;
    },

    draw: function(position) {
      var ctx = this._ctx,
          self = this,
          px, py, p;
      p = self._movePosition(position.clone());
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      this._layers.forEach(function(layer, i) {
        px = (-p.x + WIDTH) / i;
        py = (-p.y + HEIGHT) / i;
        layer.forEach(function(star) {
          ctx.fillStyle = 'rgba(255,255,255,' + star.alpha + ')';
          ctx.fillRect(px+star.x, py+star.y, 1, 1);
          ctx.fillRect(px+star.x, py+star.y-HEIGHT, 1, 1);
          ctx.fillRect(px+star.x, py+star.y+HEIGHT, 1, 1);
          ctx.fillRect(px+star.x+WIDTH, py+star.y+HEIGHT, 1, 1);
          ctx.fillRect(px+star.x+WIDTH, py+star.y, 1, 1);
          ctx.fillRect(px+star.x+WIDTH, py+star.y-HEIGHT, 1, 1);
          ctx.fillRect(px+star.x-WIDTH, py+star.y+HEIGHT, 1, 1);
          ctx.fillRect(px+star.x-WIDTH, py+star.y, 1, 1);
          ctx.fillRect(px+star.x-WIDTH, py+star.y-HEIGHT, 1, 1);
        });
      });
    },

    _movePosition: function(position) {
      while (position.x<0) { position.x += WIDTH; }
      while (position.y<0) { position.y += HEIGHT; }
      position.x %= WIDTH;
      position.y %= HEIGHT;
      return position;
    }
  });

  win.SpaceBackground = SpaceBackground;
}(window, document));
