

if (typeof module !== 'undefined') {
  module.exports = {
    CollisionDetection: require(__dirname + '/libs/collision_detection'),
    Collidable: require(__dirname + '/libs/collidable'),
    Vector: require(__dirname + '/libs/vector')
  };
}
