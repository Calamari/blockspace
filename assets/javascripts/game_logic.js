/*globals Base, GameMenu */

;(function(win, doc, StateMachine) {
  "use strict";

  // Handles all transitions
  var transitionCallback = function(action) {
        if (action === 'todo') {
          console.log("ACTION IS TODO");
        } else if (fsm[action] && fsm.can(action)) {
          fsm[action]();
        }
      },

      menu;

  var fsm = StateMachine.create({
    events: [
      { name: 'initialize',  from: 'none',  to: 'menu' },
      { name: 'createship',  from: 'menu',  to: 'shipcreation' },
      { name: 'startgame',  from: 'shipcreation',  to: 'game' }
    ],
    callbacks: {
      onentermenu: function() {
        console.log("SHOW MENU");
        menu = new GameMenu('Blockspace', transitionCallback);
        menu.appendToDom();
      },
      onleavemenu: function() {
        console.log("close menu");
        menu.removeFromDom();
      },
      onentershipcreation: function() {
        console.log("Create an awesome ship");
      },
      onentergame: function() {
        console.log("START GAME");
      }
    }
  });

  var GameLogic = Base.extend({
    constructor: function() {
      fsm.initialize();
    }
  });

  win.GameLogic = GameLogic;
}(window, document, StateMachine));
