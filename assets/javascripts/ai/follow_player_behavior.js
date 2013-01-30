/*globals Base, Vector, Collidable, BehaviorTree */

;(function() {
  "use strict";

  var behave = new BehaviorTree.Sequence({
    nodes: [
      new BehaviorTree.Task({
        title: 'target player if in sight',
        run: function(ship) {
          var playerShip;
          ship.getShipsInRange(ship.viewRange).forEach(function(target) {
            if (target.isPlayer) {
              playerShip = target;
            }
          });
          if (playerShip) {
            ship.setTarget(playerShip);
            this.success();
          } else {
            this.fail();
          }
        }
      }),
      new BehaviorTree.Priority({
        title: 'shoot target if possible',
        nodes: [
          new BehaviorTree.Sequence({
            nodes: [
              new BehaviorTree.Task({
                title: 'check if target in firing range',
                run: function(ship) {
                  if (ship.hasMultiDirWeapons() || Math.abs(ship.calcRotationToDo(ship.currentTarget.position)) < 2) {
                    this.success();
                  } else {
                    this.fail();
                  }
                }
              }),
              new BehaviorTree.Task({
                title: 'shoot at target',
                run: function(ship) {
                  ship.firing(ship.currentTarget.position);
                  this.success();
                }
              })
            ]
          }),
          new BehaviorTree.Task({
            title: 'stop shooting',
            run: function(ship) {
              ship.firing(false);
              this.success();
            }
          })
        ]
      }),
      new BehaviorTree.Priority({
        title: 'follow target',
        nodes: [
          new BehaviorTree.Task({
            title: 'rotate to target',
            run: function(ship) {
              var rotationToTarget = ship.calcRotationToDo(ship.currentTarget.position);
              if (Math.abs(rotationToTarget) > 2) {
                ship.rotate(rotationToTarget > 0 ? 'right' : 'left');
                this.success();
              } else {
                this.fail();
              }
            }
          }),
          new BehaviorTree.Task({
            title: 'accelerate',
            run: function(ship) {
              ship.rotate(false);
              ship.accelerate(true);
              this.success();
            }
          })
        ]
      })
    ]
  });

  BehaviorTree.register('follow player', behave);
}());
