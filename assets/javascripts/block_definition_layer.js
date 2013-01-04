/*globals Base, ArcadeText, Canvas */

;(function(win) {
  "use strict";

  var texts = {
    types: {
      acceleration: 'Acceleration',
      price: 'Costs',
      maxSpeed: 'Maximum speed',
      rotationSpeed: 'Rotation speed',

      range: 'Range',
      shootSpeed: 'Shootspeed',
      damageValue: 'Damage',
      fireRatio: 'Fire ratio'
    },
    descs: {
      acceleration: 'Acceleration one engine can give you. (Can be accumulated)',
      price: 'How much does this a new block of this type cost?',
      maxSpeed: 'Maximum speed one of those engines can reach. (Can be accumulated)',
      rotationSpeed: "How fast can the ship rotate? It's measured in degree per second.",

      range: 'Range of the bullets.',
      shootSpeed: 'How fast does the bullet travel?',
      damageValue: 'How much damage will it deal?',
      fireRatio: 'How many bullets per second does this cannon fire?'
    }
  };

  var BlockDefinitionLayer = Base.extend({
    constructor: function(position, block) {
      this.position = position;
      this._block = block;
    },

    setBlock: function(block) {
      this._block = block;
    },

    hide: function() {
      this._visible = false;
    },

    show: function() {
      this._visible = true;
    },

    draw: function(canvas) {
      if (!this._visible || !this._block) { return; }
      var p          = this.position,
          width      = 400,
          height     = 300,
          padding    = 10,
          block      = this._block,
          definition = block.getDefinition(),

          title   = new ArcadeText(definition.title, { x: padding + 40, y: padding, lineWidth: 20 }),
          desc    = new ArcadeText(definition.description, { x: padding, y: padding + title.height + 10, pixelSize: 1, lineWidth: 40 }),
          // y position where the body (blocks and stats) begin
          bodyY   = desc.height + 20 + padding + title.height + 10,

          drawObject = canvas.renderToCanvas(width, height, function(ctx) {
            ctx.fillStyle = 'rgba(0,0,0, 0.7)';
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(0, 0, width, height);
            ctx.strokeRect(3, 3, width - 6, height - 6);
            title.draw(ctx);
            desc.draw(ctx);

            block.draw(ctx, padding + 12, padding + 3);

            var key, typeText, valueText,
                yOffset=0;
            // TODO: this could also be done with only one text, and building a text block before it
            for (key in definition.config) {
              if (texts.types[key]) {
                typeText = new ArcadeText(texts.types[key] + ':', { x: padding + 50, y: bodyY + yOffset, pixelSize: 1, lineWidth: 30 });
                typeText.draw(ctx);
                valueText = new ArcadeText(definition.config[key], { x: padding + 50 + 30 * 8, y: bodyY + yOffset, pixelSize: 1 });
                valueText.draw(ctx);
                yOffset += typeText.height + 8;
              }
            }
          });

      canvas.drawImage(drawObject, p.x, p.y, Canvas.ALIGN.LEFT.TOP);
    }
  });

  win.BlockDefinitionLayer = BlockDefinitionLayer;
}(window));
