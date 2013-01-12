/*jslint node: true */
"use strict";

var Vector = Vector || require(__dirname + '/vector');
var EventEmitter = EventEmitter || require('events').EventEmitter;
var Projection = Projection || require(__dirname + '/projection');
var nextCollidableId = 1;

var Collidable = function() {
  this.collisionType = 'none'
  this.id = nextCollidableId++;
};

Collidable.prototype = new EventEmitter;

Collidable.Rectangle = function(config) {
  config = config || {};
  this.collisionType = 'rectangle';
  this.position = config.position || new Vector();
  this.width = config.width || 0;
  this.height = config.height || 0;
  this.id = nextCollidableId++;
  this._calculatePoints();
};

Collidable.Rectangle.prototype = new Collidable;

Collidable.Rectangle.prototype._calculatePoints = function() {
  this.points = [new Vector(0,0), new Vector(this.width, 0), new Vector(this.width, this.height), new Vector(0, this.height)];
};


Collidable.Circle = function(config) {
  config = config || {};
  this.collisionType = 'circle';
  this.position = config.position || new Vector();
  this.radius = config.radius || 0;
  this.id = nextCollidableId++;
};
Collidable.Circle.prototype = new Collidable;

/**
 * Projection projects edge against vector we give in to it
 * Makes sense to project against a normal of some other edge or so
 */
Collidable.Circle.prototype.project = function(axis) {
  var pointOnAxis = axis.dot(this.position.clone()),
      l = axis.length()*this.radius;
  return new Projection(pointOnAxis - l, pointOnAxis + l);
};


Collidable.Polygon = function(config) {
  config = config || {};
  this.collisionType = 'polygon';
  this.position = config.position || new Vector();
  this.points = config.points || [];
  this.width = 0;
  this.height = 0;
  this.id = nextCollidableId++;
  this.calculateBoundingBox();
};

Collidable.Polygon.prototype = new Collidable;

/**
 * Projection projects edge against vector we give in to it
 * Makes sense to project against a normal of some other edge or so
 */
Collidable.Rectangle.prototype.project =
Collidable.Polygon.prototype.project = function(axis) {
  var min = axis.dot(this.position.clone().add(this.points[0])),
      max = min,
      i   = this.points.length,
      proj;

  while (--i) {
    proj = axis.dot(this.position.clone().add(this.points[i]));
    // Test performance of this against like: if (proj < min) min=proj else if (proj > max) max = proj
    min = Math.min(min, proj);
    max = Math.max(max, proj);
  }
  return new Projection(min, max);
};

Collidable.Polygon.prototype.calculateBoundingBox = function() {
  if (this.points.length) {
    var points = this.points,
        minX = points[0].x,
        minY = points[0].y,
        maxX = points[0].x,
        maxY = points[0].y;
    for (var i=points.length;i--;) {
      minX = Math.min(minX, points[i].x);
      minY = Math.min(minY, points[i].y);
      maxX = Math.max(maxX, points[i].x);
      maxY = Math.max(maxY, points[i].y);
    }
    this.width = maxX - minX;
    this.height = maxY - minY;
    // if the box does not begin with 0,0 coordinates
    this.offset = new Vector(minX, minY);
  } else {
    this.width = 0;
    this.height = 0;
    this.offset = new Vector();
  }
};

if (typeof module !== 'undefined') {
  module.exports = Collidable;
}
