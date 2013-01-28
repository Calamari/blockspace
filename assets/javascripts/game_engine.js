/*globals Base, Vector, Canvas, SpaceShip, SpaceMine, ParticleSystem, CollisionDetection,
          ShipControls, Collidable, CollisionController, Bullet, SpaceBackground,
          Game, GameMenu, StateMachine, Player, ShipCreator,
          BehaviorTree */

;(function(win, doc) {
  "use strict";


  var GameEngine = function(canvasId) {

    var fsm = StateMachine.create({
          events: [
            { name: 'initialize',  from: 'none',  to: 'menu' },
            { name: 'createship',  from: 'menu',  to: 'shipcreation' },
            { name: 'startgame',   from: 'shipcreation',  to: 'game' },
            { name: 'gameover',    from: 'game',  to: 'endscreen' }
          ],
          callbacks: {
            onentermenu: function() {
              console.log("SHOW MENU");
              menu.appendToDom();
            },
            onleavemenu: function() {
              console.log("close menu");
              menu.removeFromDom();
            },
            onentershipcreation: function() {
              console.log("Create an awesome ship");
              shipCreator.open();
            },
            onentergame: function() {
              console.log("START GAME");
              shipCreator.close();
              controls.start();
            }
          }
        }),

        game = new Game(),

        menu = new GameMenu('Blockspace', function(action) {
          if (action === 'todo') {
            console.log("ACTION IS TODO");
          } else if (fsm[action] && fsm.can(action)) {
            fsm[action]();
          }
        }),

        canvasElement = doc.getElementById(canvasId),
        ctx = canvasElement.getContext('2d'),

        fpsDiv = doc.getElementById('showfps'),
        posDiv = doc.getElementById('showpos'),

        canvas,

        particleSystem = new ParticleSystem(),
        bulletSystem   = new ParticleSystem(),

        collisionController = new CollisionController(),

        player = new Player({
          credits: 3,
          particleSystem: particleSystem,
          collisionController: collisionController,
          bulletSystem: bulletSystem,
          game: game
        }),

        playerShip = player.ship,

        shipCreator = new ShipCreator(player, 'canvas', {
          onDone: function() {
            fsm.startgame();
          }
        }),

        enemyShip = new SpaceShip({
          position: new Vector(0, -300),
          particleSystem: particleSystem,
          collisionSystem: collisionController.getSystem(),
          rotation: -90,
          bulletSystem: bulletSystem,
          title: 'testEnemy1',
          behavior: 'flying waypoints',
          waypoints: [new Vector(-200, -200), new Vector(100, -200)],
          blueprint: [
            [Cannons.default, Hulls.default],
            [Hulls.default, Cockpits.default],
            [Engines.default, Hulls.default]
          ],
          game: game
        }),

        spaceMine = new SpaceMine({
          particleSystem: particleSystem,
          collisionSystem: collisionController.getSystem(),
          bulletSystem: bulletSystem,
          position: new Vector(-130, -160),
          // behavior: new ShootOnSightBehavior({
          //   friends: [enemyShip]
          // }),
          game: game
        }),

        space = new SpaceBackground('canvas-bg'),

        controls = new ShipControls(playerShip);

    game.ships = [playerShip, spaceMine, enemyShip];

    game.ships.forEach(function(ship) {
      ship.on('destroyed', function() {
        // remove ship from drawing objects
        for (var i=game.ships.length; i--;) {
          if (game.ships[i] === ship) {
            game.ships.splice(i, 1);
            break;
          }
        }
      });
    });

    fsm.initialize();
    // FOR TESTING:
   fsm.createship();
   fsm.startgame();

    canvas = new Canvas('canvas', 60, function(context, frameDuration, totalDuration, frameNumber) {
      var self = this;
      if (window.STOP) { return; }
      if (this.firstFrame) {
        this.camera = new Vector(-win.innerWidth/2, -win.innerHeight/2);
        canvasElement.width = win.innerWidth;
        canvasElement.height = win.innerHeight;

      } else {
        if (fsm.is('shipcreation')) {
          this.camera = shipCreator.cameraPosition;
        } else {
          this.camera = new Vector(-win.innerWidth/2, -win.innerHeight/2).add(playerShip.position);
        }
      }
      this.clear();
      space.draw(playerShip.position);

      if (fsm.is('shipcreation') && shipCreator.blocks) {
        shipCreator.drawBlocks(context);
      } else {
        // draw ships
        game.ships.forEach(function(ship) {
          ship.draw(self, context);
          ship.loop(frameDuration);
        });
      }

      // draw particles
      particleSystem.loop(frameDuration);
      particleSystem.draw(this);

      // draw bullets
      bulletSystem.loop(frameDuration);
      bulletSystem.draw(this);

      // draw fps rate
      fpsDiv.innerHTML = this.currentFps;

      // draw ships position
      posDiv.innerHTML = Math.round(playerShip.position.x) + ':' + Math.round(playerShip.position.y);

      collisionController.loop(frameDuration);
    });

    return {
      addShip: function(ship) {
      }
    };
  };

  win.GameEngine = GameEngine;
}(window, document));
