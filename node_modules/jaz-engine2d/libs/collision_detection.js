
var Vector = Vector || require(__dirname + '/vector');
var CollisionDetection = function() {
  this.objects = [];
  this._config = { mtv: false };
  this.collisions = [];
  this.addObjects.apply(this, arguments);
};

CollisionDetection.prototype.set = function(config, value) {
  this._config[config] = value;
};

CollisionDetection.prototype.add =
CollisionDetection.prototype.addObjects = function() {
  for (var i=0, l=arguments.length; i<l; ++i) {
    if (arguments[i]) {
      if (arguments[i].constructor == Array) {
        this.objects.push.apply(this.objects, arguments[i]);
      } else {
        this.objects.push(arguments[i]);
      }
    }
  }
};

CollisionDetection.prototype.remove =
CollisionDetection.prototype.removeObject = function(obj) {
  for (var i=this.objects.length; i--;) {
    if (this.objects[i] === obj) {
      this.objects.splice(i, 1);
      break;
    }
  }
};

CollisionDetection.prototype.countElements = function() {
  return this.objects.length;
};

/**
 * @TODOs:
    Polygon checks, polygon vs circle, polygon vs rectangle, rectangle vs circle, etc..
 */
CollisionDetection.prototype.test = function() {
  var objects = this.objects,
      // hitObjects = [],
      previousHitObjects = [],
      hitLeavingObjects = [],
      distance, i, j, obj1, obj2, isHit, isPolygonCheck, data;
  this.collisions = [];
  for (i=objects.length; i--;) {
    for (j=i; j--;) {
      obj1 = objects[i];
      obj2 = objects[j];
      isHit = false;
      if (obj1.collisionType === 'circle' && obj2.collisionType === 'circle') {
        distance = new Vector(obj1.position.x, obj1.position.y).distanceTo(new Vector(obj2.position.x, obj2.position.y));
        isHit = (distance < obj1.radius + obj2.radius);
      } else if (obj1.collisionType === 'rectangle' && obj2.collisionType === 'rectangle') {
        isHit = this._checkBoxCollision(obj1, obj2);
      } else if (obj1.collisionType === 'polygon' && obj2.collisionType === 'polygon') {
        isHit = this._config.boundingBoxes ? this._checkBoxCollision(obj1, obj2) : true;
        isHit = isHit && this._checkPolygonCollision(obj1, obj2);
      } else if (obj1.collisionType === 'circle') {
        isHit = this._checkPolygonCircleCollision(obj2, obj1);
      } else if (obj2.collisionType === 'circle') {
        isHit = this._checkPolygonCircleCollision(obj1, obj2);
      }
      obj1.isHit && previousHitObjects.push(obj1);
      obj2.isHit && previousHitObjects.push(obj2);
      if (isHit) {
        if (this._config.mtv) {
          this.collisions.push([obj1, obj2, isHit]);
        } else {
          this.collisions.push([obj1, obj2]);
        }
      } else {
        obj1.isHit && hitLeavingObjects.push(obj1);
        obj2.isHit && hitLeavingObjects.push(obj2);
      }
    }
  }
  // fire events and remove isHit flags if needed
  for (i=this.collisions.length; i--;) {
    obj1 = this.collisions[i][0];
    obj2 = this.collisions[i][1];
    obj1.isHit = true;
    obj2.isHit = true;
    data = {};
    if (previousHitObjects.indexOf(obj1) === -1) {
      if (this._config.mtv) {
        data.mtv = this.collisions[i][2];
      }
      obj1.emit('hit', obj2, data);
    }
    if (previousHitObjects.indexOf(obj2) === -1) {
      if (this._config.mtv) {
        data.mtv = this.collisions[i][2];
      }
      obj2.emit('hit', obj1, data);
    }
  }
  for (i=hitLeavingObjects.length; i--;) {
    if (hitLeavingObjects[i].isHit) {
      hitLeavingObjects[i].emit('leaveHit');
      hitLeavingObjects[i].isHit = false;
    }
  }
};

CollisionDetection.prototype._checkBoxCollision = function(obj1, obj2) {
  return (obj1.position.y + obj1.height >= obj2.position.y)
     && (obj1.position.y <= obj2.position.y + obj2.height)
     && (obj1.position.x + obj1.width >= obj2.position.x)
     && (obj1.position.x <= obj2.position.x + obj2.width);
};

CollisionDetection.prototype._checkPolygonCircleCollision = function(obj1, circle) {
  var points1 = obj1.points,
      axis, smallestAxis, smallestOverlap = null, overlap,
      distanceSquared, distanceVector, closestDistance = null,
      i, projection1, projection2;

  // check edges
  for (i=0, l=points1.length; i<l; ++i) {
    axis = points1[i].clone().sub(points1[(i == l-1 ? 0 : (i+1))]).rightNormal();
    if (this._config.mtv) {
      axis.normalize();
    }
    projection1 = obj1.project(axis);
    projection2 = circle.project(axis);
    overlap = projection1.distanceTo(projection2);
    if (overlap > 0) {
      return false;
    } else if (this._config.mtv) {
      if (smallestOverlap === null || overlap < smallestOverlap) {
        smallestOverlap = overlap;
        smallestAxis = axis.clone();
      }
    }
  }

  // find vertex closest to circle and get the distance there
  for (i=0, l=points1.length; i<l; ++i) {
    distanceVector = points1[i].clone().sub(circle.position);
    distanceSquared = distanceVector.x * distanceVector.x + distanceVector.y * distanceVector.y;

    if (closestDistance === null || distanceSquared < closestDistance)
    {
      closestDistance = distanceSquared;
      axis = distanceVector;
    }
  }
  axis.rightNormal().normalize();
  projection1 = obj1.project(axis);
  projection2 = circle.project(axis);
  overlap = projection1.distanceTo(projection2);
  if (overlap > 0) {
    return false;
  } else if (this._config.mtv) {
    if (smallestOverlap === null || overlap > smallestOverlap) {
      smallestOverlap = overlap;
      smallestAxis = axis.clone();
    }
  }

  if (this._config.mtv) {
    return smallestAxis.normalize(smallestOverlap);
  } else {
    return true;
  }
};

CollisionDetection.prototype._checkPolygonCollision = function(obj1, obj2) {
  var points1 = obj1.points,
      points2 = obj2.points,
      axis, smallestAxis, smallestOverlap = null, overlap,
      i, l, projection1, projection2;

  for (i = 0, l=points1.length; i<l; ++i) {
    axis = points1[i].clone().sub(points1[(i == l-1 ? 0 : (i+1))]).rightNormal();
    if (this._config.mtv) {
      axis.normalize();
    }
    projection1 = obj1.project(axis);
    projection2 = obj2.project(axis);
    overlap = projection1.distanceTo(projection2);
    if (overlap > 0) {
      return false;
    } else if (this._config.mtv) {
      if (smallestOverlap === null || overlap > smallestOverlap) {
        smallestOverlap = overlap;
        smallestAxis = axis.clone();
      }
    }
  }

  for (i = 0, l=points2.length; i<l; ++i ) {
    axis = points2[i].clone().sub(points2[(i == l-1 ? 0 : (i+1))]).rightNormal();
    if (this._config.mtv) {
      axis.normalize();
    }
    projection1 = obj1.project(axis);
    projection2 = obj2.project(axis);
    overlap = projection1.distanceTo(projection2);
    if (overlap > 0) {
      return false;
    } else if (this._config.mtv) {
      if (smallestOverlap === null || overlap > smallestOverlap) {
        smallestOverlap = overlap;
        smallestAxis = axis.clone();
      }
    }
  }

  if (this._config.mtv) {
    return smallestAxis.normalize(smallestOverlap);
  } else {
    return true;
  }
};

CollisionDetection.prototype.getCollisions = function() {
  return this.collisions;
};

if (typeof module !== 'undefined') {
  module.exports = CollisionDetection;
}
