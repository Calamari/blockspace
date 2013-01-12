/*jslint node: true */
"use strict";

var Vector = Vector || require(__dirname + '/vector');
var CollisionDetection = function() {
  this._config = { mtv: false };

  // contains all the added objects
  this.objects = []; // as array
  this._objects = {}; // as hash

  // contains cache of objects that should be removed (outside a test run)
  this._removedObjects = [];

  this.collisions = [];

  this._objectHitsLastTime = {};
  this.addObjects.apply(this, arguments);
};

CollisionDetection.prototype.set = function(config, value) {
  this._config[config] = value;
};

CollisionDetection.prototype.add =
CollisionDetection.prototype.addObjects = function() {
  for (var i=0, l=arguments.length; i<l; ++i) {
    var objOrArray = arguments[i];
    if (objOrArray) {
      if (objOrArray.constructor == Array) {
        this.addObjects.apply(this, objOrArray);
      } else {
        this.objects.push(objOrArray);
        this._objects[objOrArray.id] = objOrArray;
      }
    }
  }
};

// TODO: has to accept multiple items like add
CollisionDetection.prototype.remove =
CollisionDetection.prototype.removeObject = function(obj) {
  this._removedObjects.push(obj);
  if (!this._inTest) {
    this._processRemovals();
  }
};

CollisionDetection.prototype._processRemovals = function() {
  var i,l,obj;
  for (l=this._removedObjects.length; l--;) {
    obj = this._removedObjects[l];
    for (i=this.objects.length; i--;) {
      if (this.objects[i] === obj) {
        this.objects.splice(i, 1);
        break;
      }
    }
    delete this._objects[obj.id];
    delete this._objectHitsLastTime[obj.id];
  }
  this._removedObjects = [];
};

CollisionDetection.prototype.countElements = function() {
  return this.objects.length;
};

/**
 * @TODOs:
    Polygon checks, polygon vs circle, polygon vs rectangle, rectangle vs circle, etc..
 */
CollisionDetection.prototype.test = function() {
  var objects            = this.objects,
      // hitObjects = [],
      previousHitObjects = [],
      hitLeavingObjects  = [],
      // new version as hash with ids and array:
      objectHits = {},
      distance, i, j, l, obj1, obj2, isHit, isPolygonCheck, obj, hits, data, id, hitsLastTime;

  function _addCollision(obj1, obj2, mtv) {
    if (!objectHits[obj1.id]) {
      objectHits[obj1.id] = {};
    }
    if (!objectHits[obj2.id]) {
      objectHits[obj2.id] = {};
    }
    // TODO: should the mtv not be inverted in one of those?
    objectHits[obj1.id][obj2.id] = { object: obj2, mtv: mtv };
    objectHits[obj2.id][obj1.id] = { object: obj1, mtv: mtv };
  }

  this._inTest = true;

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
      // TODO: this could then be solved through _objectHitsLastTime
      obj1.isHit && previousHitObjects.push(obj1);
      obj2.isHit && previousHitObjects.push(obj2);
      if (isHit) {
        _addCollision(obj1, obj2, isHit);
        this.collisions.push([obj1, obj2, isHit]);
      } else {
        // object is hitting nothing anymore
        obj1.isHit && hitLeavingObjects.push(obj1);
        obj2.isHit && hitLeavingObjects.push(obj2);
      }
    }
  }

  // fire hit events
  for (id in objectHits) {
    obj          = this._objects[id];
    hits         = objectHits[id];
    data         = {};
    hitsLastTime = this._objectHitsLastTime[id];

    obj.isHit      = true;
    for (i in hits) {
      if (this._config.mtv) {
        data.mtv = hits[i].mtv;
      }
      if (!hitsLastTime || !hitsLastTime[hits[i].object.id]) {
        obj.emit('startHitting', hits[i].object, data);
      }
      obj.emit('hit', hits[i].object, data);
    }
  }

  // fire leaveHit events and remove isHit flags if needed
  for (id in this._objectHitsLastTime) {
    obj  = this._objects[id];
    hits = this._objectHitsLastTime[id];

    for (i in hits) {
      // so it has no hit this time with this object
      if ((!objectHits[id] || !objectHits[id][hits[i].object.id]) && this._objects[hits[i].object.id]) {
        obj.emit('leaveHit', hits[i].object);
      }
    }

    // this means: it is completely hit free:
    if (!objectHits[id]) {
      obj.isHit = false;
      obj.emit('stopHitting', obj);
    }
  }

  this._objectHitsLastTime = objectHits;
  this._inTest = false;
  this._processRemovals();
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
      i, l, projection1, projection2;

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
