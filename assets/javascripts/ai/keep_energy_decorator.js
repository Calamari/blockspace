/* globals BehaviorTree */
(function(BehaviorTree, win) {
  'use strict';

  var KeepEnergyDecorator = BehaviorTree.Decorator.extend({
    run: function(ship) {
      if (ship.currentEnergy < this.minimum) {
        this._control.success();
      } else {
        this.base(ship);
      }
    },
  });

  win.KeepEnergyDecorator = KeepEnergyDecorator;
}(BehaviorTree, window));
