/**
some resultes so far:

1: with 100 instances each
  circle vs circle x 1,492 ops/sec ±1.20% (87 runs sampled) (6 collisions)
  AABB x 3,446 ops/sec ±0.60% (94 runs sampled) (1 collisions)
  SAT x 65.97 ops/sec ±1.00% (65 runs sampled) (11 collisions)
  SAT with circles x 125 ops/sec ±0.87% (76 runs sampled) (9 collisions)
  SAT incl. MTV x 62.94 ops/sec ±0.62% (62 runs sampled) (11 collisions)
  SAT with circles incl. MTV x 119 ops/sec ±0.78% (74 runs sampled) (9 collisions)
2: with 200 instances each
  circle vs circle x 381 ops/sec ±0.70% (88 runs sampled) (9 collisions)
  AABB x 863 ops/sec ±0.50% (94 runs sampled) (7 collisions)
  SAT x 17.96 ops/sec ±0.46% (45 runs sampled) (14 collisions)
  SAT with circles x 32.52 ops/sec ±0.86% (54 runs sampled) (6 collisions)
  SAT incl. MTV x 17.13 ops/sec ±0.64% (43 runs sampled) (14 collisions)
  SAT with circles incl. MTV x 31.11 ops/sec ±0.74% (51 runs sampled) (6 collisions)
  SAT with boundingBoxes x 450 ops/sec ±0.51% (92 runs sampled) (14 collisions)
  SAT with circles with boundingBoxes x 56.85 ops/sec ±0.32% (70 runs sampled) (6 collisions)
*/

var Benchmark = require('benchmark');
var CollisionDetection = require(__dirname + '/../libs/collision_detection');
var Collidable = require(__dirname + '/../libs/collidable');
var Vector = require(__dirname + '/../libs/vector');

var generateConvexPolygon = function(radius, numEdges) {
  var points = [],
      rotationSteps = 360/ numEdges,
      minX = 0,
      minY = 0,
      ar, br, v;
  while (numEdges--) {
    ar = (Math.random() * radius/3) - 5;
    br = (Math.random() * rotationSteps/3) - 5;
    v = new Vector(radius + ar, 0);
    v.rotate(numEdges * rotationSteps + br);
    minX = Math.min(minX, v.x);
    minY = Math.min(minY, v.y);
    points.push(v);
  }
  for (var i=points.length;i--;) {
    points[i].x -= minX;
    points[i].y -= minY;
  }
  return points;
};


var suite = new Benchmark.Suite(),

    rects = [],
    polygons = [],
    circles = [],
    polygonsAndCircles = [];

for (var i =0; i<200; ++i) {
  rects.push(new Collidable.Rectangle({
    position: new Vector(Math.random() * 1000, Math.random() * 1000),
    width: Math.random() * 20,
    height: Math.random() * 20,
  }));
}
for (var i =0; i<200; ++i) {
  polygons.push(new Collidable.Polygon({
    position: new Vector(Math.random() * 1000, Math.random() * 1000),
    points: generateConvexPolygon(5 + Math.random() * 10, Math.round(5 + Math.random() * 10))
  }));
}
for (var i =0; i<200; ++i) {
  circles.push(new Collidable.Circle({
    position: new Vector(Math.random() * 1000, Math.random() * 1000),
    radius: Math.random() * 10
  }));
}
for (var i =0; i<100; ++i) {
  polygonsAndCircles.push(new Collidable.Polygon({
    position: new Vector(Math.random() * 1000, Math.random() * 1000),
    points: generateConvexPolygon(5 + Math.random() * 10, Math.round(5 + Math.random() * 10))
  }));
}
for (var i =0; i<100; ++i) {
  polygonsAndCircles.push(new Collidable.Circle({
    position: new Vector(Math.random() * 1000, Math.random() * 1000),
    radius: Math.random() * 10
  }));
}

var DetectorCircles = new CollisionDetection(circles);
var DetectorPolygons = new CollisionDetection(polygons);
var DetectorRectangles = new CollisionDetection(rects);
var DetectorPolygonsCircles = new CollisionDetection(polygonsAndCircles);

var actualDetector;
suite
.add('circle vs circle', function() {
  DetectorCircles.test();
  actualDetector = DetectorCircles;
})
.add('AABB', function() {
  DetectorRectangles.test();
  actualDetector = DetectorRectangles;
})
.add('SAT', function() {
  DetectorPolygons.test();
  actualDetector = DetectorPolygons;
})
.add('SAT with circles', function() {
  DetectorPolygonsCircles.test();
  actualDetector = DetectorPolygonsCircles;
})
.add('SAT incl. MTV', function() {
  DetectorPolygons.test();
  DetectorPolygons.set('mtv', true);
  actualDetector = DetectorPolygons;
})
.add('SAT with circles incl. MTV', function() {
  DetectorPolygonsCircles.test();
  DetectorPolygonsCircles.set('mtv', true);
  actualDetector = DetectorPolygonsCircles;
})
.add('SAT with boundingBoxes', function() {
  DetectorPolygons.test();
  DetectorPolygons.set('mtv', false);
  DetectorPolygons.set('boundingBoxes', true);
  actualDetector = DetectorPolygons;
})
.add('SAT with circles with boundingBoxes', function() {
  DetectorPolygonsCircles.test();
  DetectorPolygonsCircles.set('mtv', false);
  DetectorPolygonsCircles.set('boundingBoxes', true);
  actualDetector = DetectorPolygonsCircles;
})
.on('cycle', function(event, bench) {
  console.log(String(bench), '(' + actualDetector.getCollisions().length + ' collisions)');
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run();
