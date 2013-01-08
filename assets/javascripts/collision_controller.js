/*globals Base, Vector, Hull, Cockpit, Cannon, Engine, Canvas, SpaceShip */

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
      var obj1 = collision[0].parent,
          obj2 = collision[1].parent;
      if (obj1 && obj2) {
        if (obj1.is('SpaceShip') && obj2.is('SpaceShip')) {
          this._handleShipShipCollision(obj1, obj2);
        } else if (obj1.is('SpaceShip')) {
          this._handleShipCollision(obj1, obj2);
        } else if (obj2.is('SpaceShip')) {
          this._handleShipCollision(obj2, obj1);
        }
      }
    },

    _handleShipCollision: function(ship, object) {
      console.log("ship collision", ship, object);
      var subSystem = new CollisionDetection();
      subSystem.add(object.getCollidable());
      // add all blocks of ship
      ship.forEachBlock(function(block) {
        subSystem.add(block.getCollidable());
      });
      subSystem.test();
      subSystem
        .getCollisions()
        .forEach(this._handleBlockCollisions.bind(this));
    },

    _handleShipShipCollision: function(ship1, ship2) {
      console.log("ship ship collision", ship1, ship2);
      var subSystem = new CollisionDetection();
      // add all blocks of ship
      ship1.forEachBlock(function(block) {
        subSystem.add(block.getCollidable());
      });
      ship2.forEachBlock(function(block) {
        subSystem.add(block.getCollidable());
      });
      subSystem.test();
      // We need only to handle one block to block collision between the two ships
      var collisions = subSystem.getCollisions();
      if (collisions.length) {
        this._handleBlockBlockCollisions(collisions[0]);
      }
    },

    _handleBlockBlockCollisions: function(collision) {
      var ship1 = collision[0].parent.ship,
          ship2 = collision[1].parent.ship,
          FRICTION = 0,

          overlap, shipToDisplace;
      if (ship1.destroyed || ship2.destroyed) {
        return;
      }
      if (ship1 !== ship2) {
        // shipToDisplace = ship1;
        // if (Math.abs(ship2.velocity.length()) > Math.abs(ship1.velocity.length())) {
        //   shipToDisplace = ship2;
        // }
        // console.log(shipToDisplace);
        // overlap = this._calcMinimalDisplacementShip(collision, shipToDisplace);
        // console.log("overla", overlap, Math.abs(ship2.velocity.length()), Math.abs(ship1.velocity.length()));

        // ship1.velocity = new Vector();
        // ship2.velocity = new Vector();
        // return;
        // Version:: Projection XY

        // TODO: To be correct, we have to take the ship into account, to NOT put the ships into one another
        overlap = this._calcMinimalDisplacement(collision);

          console.log("calc", ship1.velocity, ship2.velocity);
        if (Math.abs(overlap.x) > Math.abs(overlap.y)) {
          if (Math.abs(ship1.velocity.x) > Math.abs(ship2.velocity.x)) {
            shipToDisplace = ship1;
          } else {
            shipToDisplace = ship2;
          }
          shipToDisplace.velocity.x *= -FRICTION;
        } else {
          if (Math.abs(ship1.velocity.y) > Math.abs(ship2.velocity.y)) {
            shipToDisplace = ship1;
          } else {
            shipToDisplace = ship2;
          }
          shipToDisplace.velocity.y *= -FRICTION;
        }
console.log(overlap, shipToDisplace.velocity);
        shipToDisplace.position.add(overlap);
        // shipToDisplace.velocity.skalar(-FRICTION);
        // ship1.velocity.skalar(-FRICTION);
        // ship2.velocity.skalar(-FRICTION);
        // window.STOP =1;
        return;
        var v1 = ship1.velocity,
            v2 = ship2.velocity,
            m1 = ship1.mass,
            m2 = ship2.mass,
            e = 0.9,
            // u1 = v1.clone().skalar(m1).add(v2.clone().skalar(2).sub(v1)).skalar(1/(m1+m2)),
            // u2 = v2.clone().skalar(m2).add(v1.clone().skalar(2).sub(v2)).skalar(1/(m1+m2));
            u1 = v1.clone().skalar((e+1)*m2).add(v1.clone().skalar(m1-e*m2)).skalar(1/(m1+m2)),
            u2 = v2.clone().skalar((e+1)*m1).sub(v2.clone().skalar(e*m1-m2)).skalar(1/(m1+m2));
        ship1.velocity = u2;
        ship2.velocity = u1;
        //USE THIS: http://www.metanetsoftware.com/technique/tutorialA.html
        console.log("diff", ship1.velocity, ship2.velocity, u1, u2);
        // TODO: calculate damage; 1/10 of velocity?
        // do some speed handling
        // TODO: optimieren mit genauem punkt der kollision (kleine diskrete steps)
        // http://www.leifiphysik.de/web_ph10_g8/grundwissen/05stoesse/elastisch.htm
      }
    },

    // calculate projection to displace a ship
    _calcMinimalDisplacement: function(collision) {
      var p1x = collision[0].project(new Vector(1, 0)),
          p2x = collision[1].project(new Vector(1, 0)),
          p1y = collision[0].project(new Vector(0, 1)),
          p2y = collision[1].project(new Vector(0, 1)),
          overlapX = p1x.distanceTo(p2x),
          overlapY = p1y.distanceTo(p2y);

      if (Math.abs(overlapX) > Math.abs(overlapY)) {
        return new Vector(0, overlapY);
      } else {
        return new Vector(overlapX, 0);
      }
    },

    // calculate projection to displace a ship
    _calcMinimalDisplacementShip: function(collision, ship) {
      var coords = ship.velocity.clone().normalize();
      var p1x = collision[0].project(new Vector(1, 0)),
          p2x = collision[1].project(new Vector(1, 0)),
          overlap = p1x.distanceTo(p2x);
      console.log(ship, coords, overlap);
      window.STOP=1;
      return coords.skalar(overlap);
    },

    _handleBlockCollisions: function(collision) {
      var obj1 = collision[0].parent,
          obj2 = collision[1].parent;

      if (obj1.destroyed || obj2.destroyed) {
        return;
      }
      if (obj1.is('Bullet')) {
        if (obj1.ship !== obj2.ship) {
          obj2.damage(obj1.damageValue);
          obj1.destroy();
        }
      } else if (obj2.is('Bullet')) {
        if (obj2.ship !== obj1.ship) {
          obj1.damage(obj2.damageValue);
          obj2.destroy();
        }
      } else if (obj1.is('ShipPart') && obj2.is('ShipPart')) {
        // TODO: Both were ships?
        console.log("Ships!", obj1, obj2);
      } else {
        console.log("What happened here?", obj1, obj2);
      }

    }
  });

  win.CollisionController = CollisionController;
}(window, CollisionDetection, Collidable));
