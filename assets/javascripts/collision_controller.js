/*globals Base, Vector, Hull, Cockpit, Cannon, Engine, Canvas */

;(function(win, CollisionDetection, Collidable) {
  "use strict";

  var CollisionController = Base.extend({
    constructor: function() {
      this._collisionDetection = new CollisionDetection();
      for (var i=arguments.length; i--;) {
        this._collisionDetection.add(arguments[i].getCollidable());
      }
      this._handleBoxCollisions = this._handleBoxCollisions.bind(this);
    },

    getSystem: function() {
      return this._collisionDetection;
    },

    loop: function() {
      this._checkBoxCollisions();
    },

    _checkBoxCollisions: function() {
      this._collisionDetection.test();
      this._collisionDetection
        .getCollisions()
        .forEach(this._handleBoxCollisions);
    },

    _handleBoxCollisions: function(collision) {
      if (collision[0].parent.constructor === SpaceShip) {
        this._handleShipCollision(collision[0].parent, collision[1].parent);
      } else if (collision[1].parent.constructor === SpaceShip) {
        this._handleShipCollision(collision[1].parent, collision[0].parent);
      }
    },

    _handleShipCollision: function(ship, object) {
        var subSystem = new CollisionDetection();
        subSystem.add(object.getCollidable());
        // add all blocks of ship
        ship._forEachBlock(function(block) {
          subSystem.add(block.getCollidable());
        });
        subSystem.test();
        subSystem
          .getCollisions()
          .forEach(this._handleBlockCollisions);
    },

    _handleBlockCollisions: function(collision) {
      var obj1 = collision[0].parent,
          obj2 = collision[1].parent;
      if (obj1.type === 'Bullet') {
        if (obj1.ship !== obj2.ship) {
          obj2.damage(obj1.damageValue);
          obj1.destroy();
        }
      } else if (obj2.type === 'Bullet') {
        if (obj2.ship !== obj1.ship) {
          obj1.damage(obj2.damageValue);
          obj2.destroy();
        }
      } else {
        // TODO: Both were ships?
      }

    }
  });

  win.CollisionController = CollisionController;
}(window, CollisionDetection, Collidable));
