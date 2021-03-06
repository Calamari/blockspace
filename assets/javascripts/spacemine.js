/*globals Base, ShipPartDef, Cannon */

;(function(win, SpaceShip) {
  "use strict";

  var SpaceMineCannons = {
    simpleCannon: new ShipPartDef('SpaceMineBlock', 'simpleCannon', {
      title: 'Simple SpaceMine cannon',
      description: 'bam bam bam',
      config: {
        audio: '/sounds/shoot-bullet',
        range: 200,
        shootSpeed: 200,
        damageValue: 50,
        pixelSize: 3,
        direction: 'variable',
        bulletColor: [255, 255, 255],
        energyDrain: 6,
        energyProduced: 4,
        energyStorage: 30,
        fireRatio: 1000 // once per second
      }
    })
  };

  var SpaceMine = SpaceShip.extend({
    constructor: function(config) {
      config.blueprint = [[SpaceMineCannons.simpleCannon]];
      this.base(config);
    },

    // If the block is destroyed, destroy the whole mine
    _onDestroyedBlock: function(block) {
      this.forEachBlock(function(b, x, y) {
        this.destroy();
      }.bind(this));
    },

    draw: function(canvas, context) {
      this.base(canvas, context);
      // draw a circle for proximity trigger
      context.strokeStyle = '#666';
      context.beginPath();
      context.arc(this.position.x - canvas.camera.x , this.position.y - canvas.camera.y, this.range, 0, Math.PI*2, true);
      context.closePath();
      context.stroke();
    }
  });

  var SpaceMineBlock = Cannon.extend({
    _baseColor: [255, 64, 64],
    type: 'SpaceMineBlock',
    subtype: 'simpleCannon',

    constructor: function(position, config) {
      var cannonConfig = SpaceMineCannons[config.subtype || 'simpleCannon'];
      config = Object.extend(Object.extend({
        collisionSystem: null
      }, cannonConfig.config), config);
      this.base(position, config);
      this.energyProduced = this._config.energyProduced;
      this.energyStorage = this._config.energyStorage;
      // override cannonNose, because it does not work well with not directional cannons
      this.cannonNose = this.position.clone();
    },

    draw: function(canvas, x, y) {
      var blockSize = this._config.blockSize,
          // TODO: that is a basic version, better draw with cracks and stuff if damaged
          alpha     = this.health / this._config.health;
      // This has to be adapted to make sharp lines:
      canvas.strokeStyle = 'rgba(' + this._baseColor.join(',') + ', 1)';
      canvas.strokeRect(x+0.5, y+0.5, blockSize-1.5, blockSize-1.5);
      canvas.fillStyle = 'rgba(' + this._baseColor.join(',') + ',' + alpha + ')';
      canvas.fillRect(x, y, blockSize-1, blockSize-1);

      if (this._damagedTime) {
        // TODO: We need this time, if we want to make a smooth hit animation
        // var now = new Date().getTime();
        // if (this._damagedTime + TIME_DAMAGE_IS_VISIBLE < now) {
        //   this._damagedTime = null;
        // } else {
          canvas.fillStyle = 'rgba(255, 0, 0, .6)';
          canvas.fillRect(x-1, y-1, blockSize+1, blockSize+1);
        // }
        this._config.ship.redraw();
      }
    },

    // defines what it is
    is: function(what) {
      return 'Cannon' === what || 'Cockpit' === what || 'Reactor' === what;
    }
  });

  win.SpaceMine = SpaceMine;
  win.SpaceMineBlock = SpaceMineBlock;
}(window, SpaceShip));
