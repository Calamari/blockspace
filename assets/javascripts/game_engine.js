/*globals Base, Vector, Canvas, SpaceShip, ParticleSystem, CollisionDetection,
          ShipControls, Collidable, CollisionController, Bullet, SpaceBackground,
          ArcadeText, GameMenu, StateMachine,
          Cannon, Hull, Cockpit, Engine */

;(function(win, doc) {
  "use strict";


  var GameEngine = function(canvasId) {

    var fsm = StateMachine.create({
          events: [
            { name: 'initialize',  from: 'none',  to: 'menu' },
            { name: 'createship',  from: 'menu',  to: 'shipcreation' },
            { name: 'startgame',  from: 'shipcreation',  to: 'game' }
          ],
          callbacks: {
            onentermenu: function() {
              console.log("SHOW MENU");
              menu.appendToDom();
            },
            onleavemenu: function() {
              console.log("close menu");
              menu.removeFromDom();
              controls.start();
            },
            onentershipcreation: function() {
              console.log("Create an awesome ship");
            },
            onentergame: function() {
              console.log("START GAME");
            }
          }
        }),

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

        playerShip = new SpaceShip({
          position: new Vector(0, 0),
          particleSystem: particleSystem,
          collisionSystem: collisionController.getSystem(),
          rotation: 0,
          bulletSystem: bulletSystem
        }),

        ships = [
          playerShip,
          new SpaceShip({
            position: new Vector(10, -60),
            rotation: -90,
            blueprint: [
              [Cannon, Hull],
              [null, Hull],
              [null, Hull],
              [Hull, Cockpit],
              [Engine, Engine]
            ],
            velocity: new Vector(-10, -30),
            particleSystem: particleSystem,
            collisionSystem: collisionController.getSystem(),
            bulletSystem: bulletSystem
          })
        ],

        space = new SpaceBackground('canvas-bg'),

        controls = new ShipControls(playerShip);
    controls.stop();

    fsm.initialize();

    canvas = new Canvas('canvas', 60, function(context, frameDuration, totalDuration, frameNumber) {
      var self = this;
      if (window.STOP) { return; }
      if (this.firstFrame) {
        this.camera = new Vector(-win.innerWidth/2, -win.innerHeight/2);
        canvasElement.width = win.innerWidth;
        canvasElement.height = win.innerHeight;
      } else {
        this.camera = new Vector(-win.innerWidth/2, -win.innerHeight/2).add(playerShip.position);
      }
      this.clear();
      space.draw(playerShip.position);

      // draw ships
      ships.forEach(function(ship) {
        ship.draw(self, context);
        ship.loop(frameDuration);
      });

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
