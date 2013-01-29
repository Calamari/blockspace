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
      new BehaviorTree.Selector({
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
