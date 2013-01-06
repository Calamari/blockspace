/*globals Base, Vector, ShipPartDef, Cannon */

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
        pixelSize: 2,
        color: [255, 255, 255],
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
    }
  });

  var SpaceMineBlock = Cannon.extend({
    _baseColor: [255, 64, 64],
    type: 'SpaceMineBlock',
    subtype: 'simpleCannon',

    // constructor: function(position, config) {
    //   var cannonConfig = SpaceMineCannons[config.subtype || 'simpleCannon'];
    //   config = Object.extend(Object.extend({
    //     collisionSystem: null
    //   }, cannonConfig.config), config);
    //   this.base(position, config);
    //   this.cannonNose = new Vector(this._config.blockSize/2 - this._config.pixelSize/2, 0).add(this.position);
    //   this.lastFired  = config.lastFired || 0;
    //   this._audio = new Audio(this._config.audio);

    //   this._overrideEmitterLoop();
    // },

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
      return 'Cannon' === what || 'Cockpit' === what;
    }
  });

  win.SpaceMine = SpaceMine;
  win.SpaceMineBlock = SpaceMineBlock;
}(window, SpaceShip));
