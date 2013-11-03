/*globals Base, SpaceShip, Vector, ArcadeText,
          Cockpits, Engines, Hulls, Cannons */

;(function(win, doc, $) {
  "use strict";
  var BLOCKSIZE          = 10,
      DEFAULT_DESCIPTION = "This is your personal Ship'o'matic 3000. Here you can buy some more parts for your ship and make it awesome.";

  var ShipCreator = Base.extend({
    constructor: function(player, gameCanvasId, config) {
      this._player = player;
      this._config = config;
      this._selectedBlock = null;
      this._blockElements = [];
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

    _placeBlocks: function(ctx, description, yOffset, blockDefs) {
      var text = new ArcadeText(description, { x: 0, y: yOffset, pixelSize: 1 }),
          xPos = 0,

          BLOCK_SPACING = 15,
          type, block;

      text.draw(ctx);
      for (type in blockDefs) {
        block = blockDefs[type].construct(new Vector(), {
          maxSpeed: 10,
          acceleration: 10
        });
        block.draw(ctx, xPos, yOffset + 12);
        this._blockElements.push({
          x: xPos,
          y: yOffset + 12,
          block: block
        });
        xPos += BLOCK_SPACING;
      }
    },

    _initContainer: function() {
      this._container = doc.getElementById('creatormenu');
      this._infosContainer = doc.getElementById('showinfos');

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
      this._writeBlockDescription(DEFAULT_DESCIPTION);

      // Place the Blocks
      canvas = doc.createElement('canvas');
      canvas.id = 'creator-blocks';
      this._container.appendChild(canvas);
      ctx = canvas.getContext('2d');
      this._blockCanvas = canvas;

      this._placeBlocks(ctx, 'Hulls', 0, Hulls);
      this._placeBlocks(ctx, 'Engines', 30, Engines);
      this._placeBlocks(ctx, 'Cannons', 60, Cannons);
      this._placeBlocks(ctx, 'Cockpits (can\'t be exchanged)', 90, Cockpits);
      this._placeBlocks(ctx, 'Shields', 120, Shields);
    },

    _writeBlockDescription: function(str) {
      var ctx  = this._descContext,
          text = new ArcadeText(str, { pixelSize: 1, lineWidth: 40, lineSpacing: 3 });
      ctx.clearRect(0, 0, 400, 70);
      text.draw(ctx);
    },

    _removeBlockDescription: function() {
      this._writeBlockDescription(DEFAULT_DESCIPTION);
    },

    _removeBlockInformation: function() {
      this._infosText && this._infosText.text('');
      this._shownInfosForDef = null;
    },

    _showBlockInformation: function(def) {
      var infos = [],
          canvas;

      if (this._shownInfosForDef === def) {
        // We are already showing this object;
        return;
      }

      if (!this._infosText) {
        this._infosText = new ArcadeText('', { pixelSize: 1, lineSpacing: 3 });
        this._infosCanvas = this._infosText.draw();
        this._infosContainer.appendChild(this._infosCanvas);
      }

      this._shownInfosForDef = def;
      infos.push('Title: ' + def.title);
      if (def.type !== 'Cockpit') {
        infos.push('Price: ' + (def.config && def.config.price || 1));
      }
      switch (def.type) {
        case 'Cannon':
          infos.push('Damage: ' + def.config.damageValue);
          infos.push('Range: ' + def.config.range);
          infos.push('Fire Ratio: ' + def.config.fireRatio);
          infos.push('Bullet Speed: ' + def.config.shootSpeed);
          infos.push('Energy Drain: ' + def.config.energyDrain);
          break;
        case 'Shield':
          infos.push('Shielding Range: ' + def.config.radius);
          infos.push('Strength: ' + def.config.strength);
          infos.push('Energy Drain: ' + def.config.energyDrain);
          break;
        case 'Engine':
          infos.push('Acceleration: ' + def.config.radius);
          infos.push('Maximum Speed: ' + def.config.maxSpeed);
          infos.push('Rotation Speed: ' + def.config.rotationSpeed);
          infos.push('Energy Drain: ' + def.config.energyDrain);
          break;
        case 'Cockpit':
          infos.push('Energy Production: ' + def.config.energyProduced);
          infos.push('Energy Storage: ' + def.config.energyStorage);
          break;
        case 'Hull':
          break;
      }
      this._infosText.text(infos.join("\n"));
      this._infosText.draw();
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
          alert("Ship not complete.\n You need at least an engine, a cockpit and a cannon.");
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
        if ((self._player.credits + additionalCredits) < block.price) {
          // TODO show this to the user
          console.log("Cannot afford that.");
        } else if (!self._isBlockAdjacentTo(block.position)) {
          // TODO show this to the user
          console.log("The Block has to be connected to the ship.");
        } else if(self._isCockpitPosition(block.position)) {
          // TODO show this to the user
          console.log("You cannot replace your Cockpit.");
        } else {
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
      var y    = event.y - 160, // from css
          x    = event.x - this.getBoundingClientRect().left,
          self = this._creator;

      self._blockElements.some(function(item) {
        if (x >= item.x && x <= item.x+10 && y >= item.y && y <= item.y+10) {
          self._selectedBlock = self._selectedBlock === item.block ? null : item.block.clone();
          return true;
        }
      });
    },

    _blockMouseMoveHandler: function(event) {
      var y       = event.y - 160, // number from css
          x       = event.x - this.getBoundingClientRect().left,
          self    = this._creator,
          element = this,

          hoveredBlock;

      element.setAttribute('class', '');
      element.className = '';
      self._blockElements.some(function(item) {
        if (x >= item.x && x <= item.x+10 && y >= item.y && y <= item.y+10) {
          hoveredBlock = item.block;
          self._writeBlockDescription(hoveredBlock.getDefinition().description);
          self._showBlockInformation(hoveredBlock.getDefinition());
          element.setAttribute('class', 'pointer');
          element.className = 'pointer';
          return true;
        }
      });
      if (!hoveredBlock) {
        self._removeBlockDescription();
        self._removeBlockInformation();
      }
    }
  });

  win.ShipCreator = ShipCreator;
}(window, document, Gator));
