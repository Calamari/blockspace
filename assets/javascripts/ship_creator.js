/*globals Base, SpaceShip, Vector, ArcadeText,
          Cockpits, Engines, Hulls, Cannons */

;(function(win, doc, $) {
  "use strict";
  var BLOCKSIZE = 10;

  var ShipCreator = Base.extend({
    constructor: function(player, gameCanvasId, config) {
      this._player = player;
      this._config = config;
      this._selectedBlock = null;
      this.blocks = [];
      this._ship = player.ship;
      this._initContainer();
      this.cameraPosition = new Vector(-200, -win.innerHeight/2);
      this.cameraPosition.y -= this.cameraPosition.y % 10;
      this._destructPlayerShip();
      this._gameCanvas = doc.getElementById(gameCanvasId);
    },

    // destruct the player ship and remember the blocks for own drawings
    _destructPlayerShip: function() {
      var self = this;
      this._ship.forEachBlock(function(block, x, y) {
        block = block.clone();
        block.position = new Vector(x * BLOCKSIZE, y * BLOCKSIZE).sub(self.cameraPosition);
        self.blocks.push(block);
        if (block.is('Cockpit')) {
          self._cockpit = block;
        }
      });
    },

    // reassambles the blueprint for the players ship
    _reconstructPlayerShip: function() {
      var minX = Number.MAX_VALUE,
          minY = Number.MAX_VALUE,
          maxX = 0,
          maxY = 0,
          camX = this.cameraPosition.x,
          camY = this.cameraPosition.y,
          blueprint = [],
          p;
      this.blocks.forEach(function(block) {
        p = block.position;
        minX = Math.min(minX, p.x+camX);
        minY = Math.min(minY, p.y+camY);
        maxX = Math.max(maxX, p.x+camX);
        maxY = Math.max(maxY, p.y+camY);
      });
      for (var i=(maxY-minY) / BLOCKSIZE + 1; i--;) {
        blueprint[i] = [];
      }
      this.blocks.forEach(function(block) {
        p = block.position;
        blueprint[(p.y+camY - minY) / BLOCKSIZE][(p.x+camX - minX) / BLOCKSIZE] = block.getDefinition();
      });
      // fill up array with nulls
      for (var y=(maxY - minY) / BLOCKSIZE+1;y--;) {
        for (var x=(maxX - minX) / BLOCKSIZE+1;x--;) {
          blueprint[y][x] = blueprint[y][x] || null;
        }
      }
      this._ship.setNewBlueprint(blueprint);
    },

    _redrawCredits: function() {
      this._creditsText.text(this._player.credits + ' Credits left');
      this._creditsText.draw();
    },

    _initContainer: function() {
      this._container = doc.getElementById('creatormenu');

      // Headline
      var text = new ArcadeText("Ship'o'matic 3000:", { pixelSize: 2 }),
          canvas = text.draw(),
          ctx, block, y;
      canvas.id = 'creator-headline';
      this._container.appendChild(canvas);

      // DONE button
      text = new ArcadeText("Done...", { pixelSize: 2 });
      canvas = text.draw();
      canvas.id = 'creator-done-btn';
      this._container.appendChild(canvas);

      // Credits hint
      this._creditsText = new ArcadeText(this._player.credits + ' Credits left', { pixelSize: 2 });
      canvas = this._creditsText.draw();
      canvas.id = 'creator-credits';
      this._container.appendChild(canvas);

      // Description text
      canvas = doc.createElement('canvas');
      canvas.id = 'creator-desc';
      this._container.appendChild(canvas);
      canvas.width = 400;
      canvas.height = 70;
      this._descContext = canvas.getContext('2d');
      this._writeDescription("This is your personal Ship'o'matic 3000. Here you can buy some more parts for your ship and make it awesome.");

      // Blocks
      canvas = doc.createElement('canvas');
      canvas.id = 'creator-blocks';
      this._container.appendChild(canvas);
      ctx = canvas.getContext('2d');
      this._blockCanvas = canvas;

      // Hull block
      block = Hulls.default.construct(new Vector());
      this._stdHull = block;
      block.draw(ctx, 0, 2);
      text = new ArcadeText('Hull (1)', { x: 40, pixelSize: 2 });
      text.draw(ctx);

      // Engine block
      block = Engines.default.construct(new Vector(), {
        maxSpeed: 10,
        acceleration: 10
      });
      this._stdEngine = block;
      block.draw(ctx, 0, 32);
      text = new ArcadeText('Engine (' + block.price + ')', { x: 40, y: 30, pixelSize: 2 });
      text.draw(ctx);

      // Cannon block
      block = Cannons.default.construct(new Vector());
      this._stdCannon = block;
      block.draw(ctx, 0, 62);
      text = new ArcadeText('Cannon (' + block.price + ')', { x: 40, y: 60, pixelSize: 2 });
      text.draw(ctx);

      // Cockpit block
      block = Cockpits.default.construct(new Vector());
      this._stdCockpit = block;
      block.draw(ctx, 0, 92);
      text = new ArcadeText('Cockpit (only 1)', { x: 40, y: 90, pixelSize: 2 });
      text.draw(ctx);

      // Shield block
      block = Shields.default.construct(new Vector());
      this._stdShield = block;
      block.draw(ctx, 0, 122);
      text = new ArcadeText('Shield (' + block.price + ')', { x: 40, y: 120, pixelSize: 2 });
      text.draw(ctx);
    },

    _writeDescription: function(str) {
      var ctx  = this._descContext,
          text = new ArcadeText(str, { pixelSize: 1, lineWidth: 40, lineSpacing: 3 });
      ctx.clearRect(0, 0, 400, 70);
      text.draw(ctx);
    },

    // opens the menu and starts mouse controls
    open: function() {
      var self = this;
      this._clickHandler.bind(this);
      this._mouseMoveHandler.bind(this);
      this._blockMouseMoveHandler.bind(this);
      this._blockClickHandler.bind(this);

      // workaround to make this available in gator:
      this._gameCanvas._creator = this;
      this._blockCanvas._creator = this;

      $(this._gameCanvas)
        .on('click', this._clickHandler)
        .on('mousemove', this._mouseMoveHandler);

      $(this._blockCanvas)
        .on('click', this._blockClickHandler)
        .on('mousemove', this._blockMouseMoveHandler);

      $(doc.getElementById('creator-done-btn')).on('click', function() {
        if (self._isShipComplete()) {
          self._reconstructPlayerShip();
          self._config.onDone();
        } else {
          alert("Ship not complete.\n TODO: make a better error message for this ;-)");
        }
      });
      this._container.style.display = 'block';
    },

    // closes the menu and stops mouse controls
    close: function() {
      $(this._gameCanvas)
        .off('click', this._clickHandler)
        .on('mousemove', this._mouseMoveHandler);

      $(this._blockCanvas)
        .off('click', this._blockClickHandler)
        .off('mousemove', this._blockMouseMoveHandler);
      this._container.style.display = 'none';
    },

    drawBlocks: function(context) {
      var self = this;
      this.blocks.forEach(function(block,i) {
        self._drawBlock(block, context);
      });
      this._drawBlock(this._selectedBlock, context);
    },

    _drawBlock: function(block, context) {
      var mp    = this._ship.middlePoint;

      if (block) {
        block.draw(context, block.position.x - mp.x, block.position.y - mp.y);
      }
    },

    drawBlock: function(context) {
      this._drawBlock(this._selectedBlock, context);
    },

    // Checks if at least a cockpit, a cannon and an engine are built in
    _isShipComplete: function() {
      // TODO
      var hasCannon = false,
          hasEngine = false,
          hasCockpit = true; // can't be removed
      this.blocks.forEach(function(block) {
        hasCannon = hasCannon || block.is('Cannon');
        hasEngine = hasEngine || block.is('Engine');
      });
      return hasCannon && hasEngine && hasCockpit;
    },

    _isBlockAdjacentTo: function(p) {
      var isAdjacent = false,
          p2;
      this.blocks.forEach(function(block) {
        p2 = block.position;
        if ((p.x === p2.x && (p.y - BLOCKSIZE === p2.y || p.y + BLOCKSIZE === p2.y)) ||
            (p.y === p2.y && (p.x - BLOCKSIZE === p2.x || p.x + BLOCKSIZE === p2.x))) {
          isAdjacent = true;
        }
      });
      return isAdjacent;
    },

    _isCockpitPosition: function(p) {
      var p2 = this._cockpit.position;
      return p.x === p2.x && p.y === p2.y;
    },

    _getBlockOnPosition: function(p) {
      var blockOnPos = null,
          p2;
      this.blocks.forEach(function(block) {
        p2 = block.position;
        if (p.x === p2.x && p.y === p2.y) {
          blockOnPos = block;
        }
      });
      return blockOnPos;
    },

    _removeBlock: function(block) {
      for (var i = this.blocks.length; i--;) {
        if (this.blocks[i] === block) {
          this.blocks.remove(i);
          this._player.credits += block.price;
        }
      }
    },

    _clickHandler: function(event) {
      var self              = this._creator,
          ship              = self._ship,
          block             = self._selectedBlock,
          additionalCredits = 0,
          blockOnPos;

      if (block) {
        blockOnPos = self._getBlockOnPosition(block.position);
        if (blockOnPos) {
          additionalCredits = blockOnPos.price;
        }
        if ((self._player.credits + additionalCredits) >= block.price && self._isBlockAdjacentTo(block.position) && !self._isCockpitPosition(block.position)) {
          self.blocks.push(block.clone());
          self._player.credits -= block.price;
          self._removeBlock(blockOnPos);
          self._redrawCredits();
        }
      }
    },

    _mouseMoveHandler: function(event) {
      var self  = this._creator,
          ship  = self._ship,
          block = self._selectedBlock,
          halfBlockSize = 4,
          px, py;

      if (block) {
        self.block = block;
        px = event.x;
        py = event.y;
        px -= px % BLOCKSIZE;
        py -= py % BLOCKSIZE;
        block.position = new Vector(px, py);
      }
    },

    _blockClickHandler: function(event) {
      var canvasOffset = 160, // from css
          y = event.y - canvasOffset,
          self = this._creator;

      // remove block from blocks
      if (this._creator._selectedBlock) {
        // TODO
      }

      if (y > 0 && y < 20) {
        self._selectedBlock = self._selectedBlock !== 'hull' ? self._stdHull.clone() : null;
      } else if (y > 30 && y < 50) {
        self._selectedBlock = self._selectedBlock !== 'engine' ? self._stdEngine.clone() : null;
      } else if (y > 60 && y < 80) {
        self._selectedBlock = self._selectedBlock !== 'cannon' ? self._stdCannon.clone() : null;
      }
    },

    _blockMouseMoveHandler: function(event) {
      var canvasOffset = 160, // from css
          y    = event.y - canvasOffset,
          self = this._creator;

      this.setAttribute('class', 'pointer');
      this.className = 'pointer';

      if (y > 0 && y < 20) {
        self._writeDescription(self._stdHull.getDefinition().description);
      } else if (y > 30 && y < 50) {
        self._writeDescription(self._stdEngine.getDefinition().description);
      } else if (y > 60 && y < 80) {
        self._writeDescription(self._stdCannon.getDefinition().description);
      } else if (y > 90 && y < 110) {
        self._writeDescription(self._stdCockpit.getDefinition().description);
      } else if (y > 120 && y < 140) {
        self._writeDescription(self._stdShield.getDefinition().description);
      } else {
        this.setAttribute('class', '');
        this.className = '';
      }
    }
  });

  win.ShipCreator = ShipCreator;
}(window, document, Gator));
