/*globals Base, ArcadeText */

;(function(win, doc, $) {
  "use strict";
  var BODY;
  var menu = [
    {
      title: 'play',
      action: 'createship'
    },
    {
      title: 'stats',
      action: 'todo'
    },
    {
      title: 'about',
      action: 'todo'
    }
  ];

  var GameMenu = Base.extend({
    constructor: function(title, callback) {
      BODY = doc.getElementsByTagName('body')[0];
      this._callback = callback;
      this._title = title;
      this.container = doc.createElement('div');
      this.container.id = "gamemenu";
      this.draw();
    },

    appendToDom: function() {
      BODY.appendChild(this.container);
      this.start();
    },

    removeFromDom: function() {
      BODY.removeChild(this.container);
      this.stop();
    },

    start: function() {
      this._onMouseDown = this._onMouseDown.bind(this);
      $(this.container)
        .on('mousedown', 'canvas', this._onMouseDown);
    },

    stop: function() {
      $(this.container)
        .off('mousedown', 'canvas', this._onMouseDown);
    },

    draw: function() {
      var pos = 100,
          container = this.container,
          text;

      this._drawTitle();

      menu.forEach(function(item) {
        text = new ArcadeText(item.title);
        pos += 40;
        item.canvas = text.draw();
        item.canvas.style.left = '50px';
        item.canvas.style.top = pos + 'px';
        item.canvas.dataMenuItem = item;
        item.canvas.setAttribute('data-menu-item', item.title);
        container.appendChild(item.canvas);
//        ctx.drawImage(item.canvas, 0, 100);
      });
    },

    _drawTitle: function() {
      var text = new ArcadeText(this._title, { pixelSize: 3 }),
          canvas = text.draw();
      canvas.id = "gametitle";
      this.container.appendChild(canvas);
    },

    _positionMenu: function() {
      //TODO
    },

    _onMouseDown: function(event) {
      var menuItem = event.target.getAttribute('data-menu-item'),
          cb       = this._callback;

      menu.forEach(function(item) {
        if (item.title === menuItem) {
          cb(item.action);
        }
      });
    }
  });

  win.GameMenu = GameMenu;
}(window, document, Gator));
