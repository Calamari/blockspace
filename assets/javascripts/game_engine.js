/*globals Base, Vector, Canvas, SpaceShip, SpaceMine, ParticleSystem, CollisionDetection,
          ShipControls, GameControls, Collidable, CollisionController, Bullet, SpaceBackground,
          Game, GameMenu, StateMachine, Player, ShipCreator,
          BehaviorTree, Waypoint, ArcadeText, Levels */

var DEBUG_SHOW_WAY_POINTS = true,
    DEBUG_SHOW_VIEW_RANGE = true;

;(function(win, doc) {
  "use strict";

  var GameEngine = function(canvasId) {

    var fsm = StateMachine.create({
          events: [
            { name: 'initialize',  from: 'none',          to: 'menu' },
            { name: 'createship',  from: 'menu',          to: 'shipcreation' },
            { name: 'startgame',   from: 'shipcreation',  to: 'game' },
            { name: 'gameover',    from: 'game',          to: 'endscreen' },
            { name: 'pause',       from: 'game',          to: 'pause' },
            { name: 'unpause',     from: 'pause',         to: 'game' }
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
            },
            onenterendscreen: function() {
              console.log("GAME OVER");
              mainMessage = new ArcadeText("GAME OVER", { pixelSize: 4, color: '#fff', x: win.innerWidth/2 - 2*9*8, y: win.innerHeight/2 - 2*8 });
              controls.stop();
            }
          }
        }),

        game = new Game(fsm),

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

        space = new SpaceBackground('canvas-bg'),

        mainMessage,

        pauseMessage = new ArcadeText("PAUSE", { pixelSize: 4, color: '#fff', x: win.innerWidth/2 - 2*5*8, y: win.innerHeight/2 - 2*8 }),
        energyLevel  = new ArcadeText("Energy: 0", { pixelSize: 1, color: '#ff0', x: 4, y: win.innerHeight - 1*8 - 4 }),

//        hello = new TimedText('Hello world, how are you today?', { pixelSize: 1, x: win.innerWidth*3/4, y: win.innerHeight*3/4, width: win.innerWidth*1/4}),

        controls = new ShipControls(playerShip),
        gameControls = new GameControls(game);

    game.set({
      particleSystem: particleSystem,
      collisionController: collisionController,
      bulletSystem: bulletSystem
    });
    game.ships = [playerShip];

    Levels.start1(game);

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

      if (fsm.is('pause')) {
        pauseMessage.draw(context);
        return;
      }

      if (this.firstFrame) {
        this.camera = new Vector(-win.innerWidth/2, -win.innerHeight/2);
        canvasElement.width = win.innerWidth;
        canvasElement.height = win.innerHeight;

        playerShip.on('destroyed', function() {
          fsm.gameover();
        });

      } else {
        if (fsm.is('shipcreation')) {
          this.camera = shipCreator.cameraPosition;
        } else {
          this.camera = new Vector(-win.innerWidth/2, -win.innerHeight/2).add(playerShip.position);
        }
      }

      this.clear();
      space.draw(playerShip.position);

      energyLevel.text('Energy: ' + Math.round(playerShip.currentEnergy*100)/100);
      energyLevel.draw(context);

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

      if (mainMessage) {
        mainMessage.draw(context);
      }
    });

    return {
      addShip: function(ship) {
      }
    };
  };

  win.GameEngine = GameEngine;
}(window, document));
