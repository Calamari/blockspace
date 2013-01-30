/*globals Base, Vector, Collidable, BehaviorTree */

;(function() {
  "use strict";

  var behave = new BehaviorTree.Sequence({
    nodes: [
      new BehaviorTree.Task({
        title: 'check for weapons',
        run: function(ship) {
          if (ship.hasCannons()) {
            this.fail();
          } else {
            this.success();
          }
        }
      }),
      new BehaviorTree.Task({
        title: 'if we have target to flee',
        run: function(ship) {
          if (ship.currentTarget) {
            this.success();
          } else {
            this.fail();
          }
        }
      }),
      new BehaviorTree.Priority({
        title: 'flee for target',
        nodes: [
          new BehaviorTree.Task({
            title: 'rotate away',
            run: function(ship) {
              var rotationToTarget = ship.calcRotationToDo(ship.currentTarget.position);
              if (Math.abs(rotationToTarget) < 160) {
                ship.rotate(rotationToTarget < 0 ? 'right' : 'left');
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

  BehaviorTree.register('flee if defenseless', behave);
}());
