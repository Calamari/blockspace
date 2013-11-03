/*globals Base, Vector, Canvas, SpaceShip, ParticleSystem, CollisionDetection,
          ShipControls, Collidable, CollisionController, Bullet, SpaceBackground,
          Cannons, Engines, Cockpits, Hulls,
          ArcadeText, GameLogic */

//= require ../application
//= require ../block_definition_layer

;(function(win, doc) {
  "use strict";

  var BlockShowCase = function(canvasId) {
    var canvasElement = doc.getElementById(canvasId),

        canvas,

        particleSystem = new ParticleSystem(),
        bulletSystem   = new ParticleSystem(),

        collisionController = new CollisionController(),

        ships = [
          {
            title: 'the easy one',
            design: new SpaceShip({
              position: new Vector(80, 130),
              blueprint: [
                [Cannons.default],
                [Cockpits.default],
                [Engines.default]
              ],
              velocity: new Vector(0,0),
              particleSystem: particleSystem,
              collisionSystem: collisionController.getSystem(),
              bulletSystem: bulletSystem,
              infinityEnergy: true
            })
          },
          {
            title: 'the traveler',
            design: new SpaceShip({
              position: new Vector(200, 130),
              blueprint: [
                [Cannons.default, Hulls.default],
                [Hulls.default, Cockpits.default],
                [Engines.default, Hulls.default]
              ],
              velocity: new Vector(0,0),
              particleSystem: particleSystem,
              collisionSystem: collisionController.getSystem(),
              bulletSystem: bulletSystem,
              infinityEnergy: true
            })
          },
          {
            title: 'star trekker',
            design: new SpaceShip({
              position: new Vector(320, 130),
              blueprint: [
                [null, null, Hulls.default, null, null],
                [null, Hulls.default, Hulls.default, Hulls.default, null],
                [Cannons.default, Hulls.default, Cockpits.default, Hulls.default, Cannons.default],
                [null, Hulls.default, Hulls.default, Hulls.default, null],
                [null, null, Hulls.default, null, null],
                [Hulls.default, null, Hulls.default, null, Hulls.default],
                [Hulls.default, Hulls.default, Hulls.default, Hulls.default, Hulls.default],
                [Engines.default, null, Hulls.default, null, Engines.default]
              ],
              velocity: new Vector(0,0),
              particleSystem: particleSystem,
              collisionSystem: collisionController.getSystem(),
              bulletSystem: bulletSystem,
              infinityEnergy: true
            })
          }
        ],

        defLayer = new BlockDefinitionLayer(new Vector(win.innerWidth - 450, win.innerHeight - 450)),

        space = new SpaceBackground('canvas-bg'),

        hDesigns = new ArcadeText('Ship designs:', { x: 10, y: 10 });

    ships.forEach(function(shipDef) {
      var ship = shipDef.design;
      ship._origPosition = ship.position.clone();
      ship.accelerate(true);
      ship.firing(true);
      shipDef.title = new ArcadeText(shipDef.title, { x: ship._origPosition.x - 50, y: ship._origPosition.y - 70, pixelSize: 1 });
    });

    canvas = new Canvas('canvas', 60, function(context, frameDuration, totalDuration, frameNumber) {
      var self = this;
      if (this.firstFrame) {
        this.camera = new Vector();
        canvasElement.width = win.innerWidth;
        canvasElement.height = win.innerHeight;

        // The click on a block
        Gator(canvasElement).on('click', function(event) {
          // hide definitoin layer if one is visible right now
          defLayer.hide();
          var clickCollision = new CollisionDetection(),
          // TODO: - is wrong, should be + when self.camera
              clickCollider  = new Collidable.Rectangle({ position: new Vector(event.pageX - self.camera.x, event.pageY - self.camera.y), width: 0.2, height: 0.2 }),
              clickCollider2  = new Collidable.Polygon({ position: new Vector(event.pageX - self.camera.x, event.pageY - self.camera.y), points: [new Vector(), new Vector(0,0.1), new Vector(0.1,0)] }),
              collisions;
          ships.forEach(function(ship) {
            clickCollision.add(ship.getCollidable());
          });
          clickCollision.add(clickCollider);
          clickCollision.test();
          collisions = clickCollision.getCollisions();
          if (collisions.length) {
            // check each block of that ship
            var subSystem = new CollisionDetection();
            subSystem.add(clickCollider2);
            (collisions[0][0].parent || collisions[0][1].parent).forEachBlock(function(block) {
              subSystem.add(block.getCollidable());
            });
            subSystem.test();
            subSystem
              .getCollisions()
              .forEach(function(collision) {
                var block = collision[0].parent || collision[1].parent;
                defLayer.setBlock(block);
                defLayer.show();
              });

          }
        });

      }
      this.clear();
      space.draw(self.camera);
      hDesigns.draw(context);

      // draw ships
      ships.forEach(function(shipDef) {
        var ship = shipDef.design;
        ship.draw(this, context);
        ship.loop(frameDuration);
        ship.position = ship._origPosition.clone();

        shipDef.title.draw(context);

      }.bind(this));

      // draw particles
      particleSystem.loop(frameDuration);
      particleSystem.draw(this);

      // draw bullets
      bulletSystem.loop(frameDuration);
      bulletSystem.draw(this);

      defLayer.draw(this, context);
    });

  };

  win.addEventListener('DOMContentLoaded', function() {
    var gameEngine = new BlockShowCase('canvas');

  });
}(window, document));
