
var CollisionDetection = CollisionDetection || require(__dirname + '/../libs/collision_detection');
var Collidable = Collidable || require(__dirname + '/../libs/collidable');
var Vector = Vector || require(__dirname + '/../libs/vector');

var getRect = function(x1, y1, x2, y2) {
  return new Collidable.Rectangle({
    position: new Vector(x1, y1),
    width: x2-x1,
    height: y2-y1
  });
};

var getCircle = function(x, y, r) {
  return new Collidable.Circle({
    position: new Vector(x, y),
    radius: r
  });
};

var getPolygon = function() {
  var poly = new Collidable.Polygon({
    points: [].slice.call(arguments)
  });
  poly.calculateBoundingBox();
  return poly;
};

describe(CollisionDetection, function() {
  it("can be instantiated", function(done) {
    var detector = new CollisionDetection();
    expect(detector.constructor).toEqual(CollisionDetection);
    done();
  });

  it("has method for getting number of Elements on it", function(done) {
    var detector = new CollisionDetection();
    expect(typeof detector.countElements).toEqual('function');
    done();
  });

  it("#countElements is 0 if no elements are inserted", function(done) {
    var detector = new CollisionDetection();
    expect(detector.countElements()).toEqual(0);
    done();
  });

  it("takes some objects as arguments", function(done) {
    var detector = new CollisionDetection({ test: 1 }, { test: 2 });
    expect(detector.countElements()).toEqual(2);
    done();
  });

  it("can take an array of objects as arguments", function(done) {
    var detector = new CollisionDetection([{ test: 1 }, { test: 2 }]);
    expect(detector.countElements()).toEqual(2);
    done();
  });

  it("can take an array and more objects as arguments", function(done) {
    var detector = new CollisionDetection([{ test: 1 }, { test: 2 }], { test: 3 });
    expect(detector.countElements()).toEqual(3);
    done();
  });

  it("#addObjects method adds more objects to test with", function(done) {
    var detector = new CollisionDetection([{ test: 1 }, { test: 2 }]);
    detector.addObjects({ test: 3 });
    expect(detector.countElements()).toEqual(3);
    done();
  });

  it("#add is an alias for #addObjects", function(done) {
    var detector = new CollisionDetection();
    expect(detector.add).toEqual(detector.addObjects);
    done();
  });

  it("#removeObject method removes objects again", function(done) {
    var a = { test: 1 },
        b = { test: 2 };
    var detector = new CollisionDetection([a, b]);
    detector.remove(a);
    expect(detector.countElements()).toEqual(1);
    done();
  });

  it("#removeObject does not remove similar objects", function(done) {
    var a = { test: 1 },
        b = { test: 2 };
    var detector = new CollisionDetection([a, b]);
    detector.remove({ test: 1 });
    expect(detector.countElements()).toEqual(2);
    done();
  });

  it("#set allowes to set some configuration", function(done) {
    var detector = new CollisionDetection();
    expect(typeof detector.set).toEqual('function');
    done();
  });

  describe('#getCollisions', function() {
    it("has a getCollisions method", function(done) {
      var detector = new CollisionDetection();
      expect(typeof detector.getCollisions).toEqual('function');
      done();
    });

    it("returns list of colliding objects", function(done) {
      var detector = new CollisionDetection();
      expect(detector.getCollisions().constructor).toEqual(Array);
      done();
    });

    it("is empty when not tested yet", function(done) {
      var detector = new CollisionDetection();
      expect(detector.getCollisions().length).toEqual(0);
      done();
    });

    it("is empty if only one object is registered", function(done) {
      var detector = new CollisionDetection(getCircle(0,0, 3));
      detector.test();
      expect(detector.getCollisions().length).toEqual(0);
      done();
    });

    it("is empty if no collisions are found", function(done) {
      var detector = new CollisionDetection(getCircle(0,0, 3), getCircle(6,0, 2));
      detector.test();
      expect(detector.getCollisions().length).toEqual(0);
      done();
    });

    it("includes both colliding objects", function(done) {
      var circle1 = getCircle(0,0, 3),
          circle2 = getCircle(4,0, 3),
          detector = new CollisionDetection(circle1, circle2);
      detector.test();
      expect(detector.getCollisions()[0].length).toEqual(2);
      expect(detector.getCollisions()[0]).toContain(circle1);
      expect(detector.getCollisions()[0]).toContain(circle2);
      done();
    });
  });

  describe('#test', function() {
    it("has a test method for the real collision checking", function(done) {
      var detector = new CollisionDetection();
      expect(typeof detector.test).toEqual('function');
      done();
    });


    describe('between circles', function() {
      it("finds collisions on circles", function(done) {
        var detector = new CollisionDetection(getCircle(0,0, 3), getCircle(4,0, 3));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds no collisions on not touching circles", function(done) {
        var detector = new CollisionDetection(getCircle(0,0, 3), getCircle(6,0, 3));
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });

      it("finds slightly touching circles", function(done) {
        var detector = new CollisionDetection(getCircle(0,0, 3), getCircle(5.9999,0, 3));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });
    });


    describe('between rectangles', function() {
      it("finds collisions on rectangles", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 3,3), getRect(2,2, 4,4));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds no collisions on not touching rectangles", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 3,3), getRect(3.0001,3, 4,4));
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });

      it("finds slightly touching rectangles", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 3,3), getRect(3,3, 4,4));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds containing rectangles", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 3,3), getRect(1,1, 2,2));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds big rectangle with small rectangle cutting through", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 3,3), getRect(-1,1, 4,2));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });
    });


    describe('between circles and rectangles', function() {
      it("finds collisions", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 4,4), getCircle(6,2, 2.1));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds collisions of circle in bottom left", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 4,4), getCircle(-2,-2, 2.84));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds no collisions if not colliding", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 4,4), getCircle(6,2, 1.9));
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });

      it("finds no collisions if not colliding but in widht area", function(done) {
        var detector = new CollisionDetection(getRect(0,0, 4,4), getCircle(6,6, 2.1));
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });
    });


    describe('between circles and polygons', function() {
      it("finds collisions", function(done) {
        var detector = new CollisionDetection(getPolygon(new Vector(0,0), new Vector(4,2), new Vector(0,4)), getCircle(6,2, 2.1));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds collisions of circle in bottom left", function(done) {
        var detector = new CollisionDetection(getPolygon(new Vector(0,0), new Vector(4,2), new Vector(0,4)), getCircle(-2,-2, 2.84));
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds no collisions if not colliding", function(done) {
        var detector = new CollisionDetection(getPolygon(new Vector(0,0), new Vector(4,2), new Vector(0,4)), getCircle(6,2, 1.9));
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });

      it("finds no collisions if not colliding but in width area", function(done) {
        var detector = new CollisionDetection(getPolygon(new Vector(0,0), new Vector(4,1.2), new Vector(0,4)), getCircle(6,2, 1.9));
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });
    });


    describe('between polygons', function() {
      it("finds collisions on polygons", function(done) {
        var detector = new CollisionDetection(
          getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0))
        );
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("finds collisions on polygons also with activated boundingBox check", function(done) {
        var detector = new CollisionDetection(
          getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0))
        );
        detector.set('boundingBoxes', true);
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("can find no collisions if polygons only intersect in bounding box", function(done) {
        var detector = new CollisionDetection(
          getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          getPolygon(new Vector(3,0), new Vector(3,2), new Vector(2,0))
        );
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });

      it("can find collisions if polygons although they have offset", function(done) {
        var detector = new CollisionDetection(
          getPolygon(new Vector(3,1), new Vector(3,3), new Vector(1,3)),
          getPolygon(new Vector(2,0), new Vector(4,0), new Vector(3,2))
        );
        detector.test();
        expect(detector.getCollisions().length).toEqual(1);
        done();
      });

      it("can find no collisions if polygons although they have offset", function(done) {
        var detector = new CollisionDetection(
          getPolygon(new Vector(2,1), new Vector(3,3), new Vector(1,3)),
          getPolygon(new Vector(2,0), new Vector(4,0), new Vector(3,2))
        );
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });

      it("adds mtv to collision of polygons if configured on collision detector", function(done) {
        var polygon1 = getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
            polygon2 = getPolygon(new Vector(0,6), new Vector(3,2), new Vector(0,2));
            detector = new CollisionDetection(polygon1, polygon2),
            count = 0;
        detector.set('mtv', true);
        polygon1.on('hit', function(obj, data) {
          expect(data.mtv.constructor).toBe(Vector);
          expect(data.mtv.x).toBe(0);
          // This should be -1 but I can't yet figure out how to get the direction to work
          expect(data.mtv.y).toBe(-1);
          ++count;
        });
        polygon2.on('hit', function(obj, data) {
          expect(data.mtv.constructor).toBe(Vector);
          expect(data.mtv.x).toBe(0);
          expect(data.mtv.y).toBe(-1);
          ++count;
        });
        detector.test();
        expect(count).toEqual(2);
        done();
      });

      it("adds no mtv to collision of polygons if configured not do calculate it", function(done) {
        var polygon1 = getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
            polygon2 = getPolygon(new Vector(0,6), new Vector(3,2), new Vector(0,2));
            detector = new CollisionDetection(polygon1, polygon2),
            count = 0;
        polygon1.on('hit', function(obj, data) {
          expect(data.mtv).toEqual(null);
          ++count;
        });
        detector.test();
        expect(count).toEqual(1);
        done();
      });

      describe('using positions', function() {
        var polygon1 = getPolygon(new Vector(2,0), new Vector(2,2), new Vector(0,2)),
            polygon2 = getPolygon(new Vector(0,0), new Vector(2,0), new Vector(1,2));

        it("can find collisions if polygons have a position and offset", function(done) {
          polygon2.position.x = 2;
          var detector = new CollisionDetection(
            getPolygon(new Vector(3,1), new Vector(3,3), new Vector(1,3)),
            polygon2
          );
          detector.test();
          expect(detector.getCollisions().length).toEqual(1);
          done();
        });

        it("can find collisions if polygons have a position but no offset", function(done) {
          polygon1.position.x = 2;
          polygon2.position.x = 2;
          var detector = new CollisionDetection(polygon1, polygon2);
          detector.test();
          expect(detector.getCollisions().length).toEqual(1);
          done();
        });

        it("can find collisions if polygons have a  different position but no offset", function(done) {
          polygon1.position.x = 2;
          polygon2.position.x = 3;
          var detector = new CollisionDetection(polygon1, polygon2);
          detector.test();
          expect(detector.getCollisions().length).toEqual(1);
          done();
        });

        it("does also find a collisions if polygons are touching with a penetration of 0", function(done) {
          polygon1.position.x = 3;
          polygon2.position.x = 2;
          var detector = new CollisionDetection(polygon1, polygon2);
          detector.test();
          expect(detector.getCollisions().length).toEqual(1);
          done();
        });
      });

      it("can find no collisions if polygons have a position and offset", function(done) {
        var detector = new CollisionDetection(
          getPolygon(new Vector(2,1), new Vector(3,3), new Vector(1,3)),
          getPolygon(new Vector(2,0), new Vector(4,0), new Vector(3,2))
        );
        detector.test();
        expect(detector.getCollisions().length).toEqual(0);
        done();
      });

    });

    it("finds collisions of two pairs of objects ", function(done) {
      var detector = new CollisionDetection(
        getRect(-10,0, -7,3), getRect(-12,2, -10,4),
        getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
        getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0))
      );
      detector.test();
      expect(detector.getCollisions().length).toEqual(2);
      done();
    });
  });

  it('emits hit event on every hit object', function(done) {
    var hitCircle1 = getCircle(0,0, 3),
        hitCircle2 = getCircle(4,0, 3),
        notHitCircle = getCircle(14,0, 3),
        count = 0;

    hitCircle1.on('hit', function(obj) { expect(obj).toBe(hitCircle2); ++count; });
    hitCircle2.on('hit', function(obj) { expect(obj).toBe(hitCircle1); ++count; });
    notHitCircle.on('hit', function(obj) { expect(true).toBe(false); });
    var detector = new CollisionDetection(hitCircle1, hitCircle2, notHitCircle);
    detector.test();
    expect(count).toBe(2);
    done();
  });

  it('emits hit event only once on first hitting an object', function(done) {
    var hitCircle1 = getCircle(0,0, 3),
        hitCircle2 = getCircle(4,0, 3),
        notHitCircle = getCircle(14,0, 3),
        count = 0;

    hitCircle1.on('hit', function(obj) { expect(obj).toBe(hitCircle2); ++count; });
    hitCircle2.on('hit', function(obj) { expect(obj).toBe(hitCircle1); ++count; });
    notHitCircle.on('hit', function(obj) { expect(true).toBe(false); });
    var detector = new CollisionDetection(hitCircle1, hitCircle2, notHitCircle);
    detector.test();
    detector.test();
    expect(count).toBe(2);
    done();
  });

  it('saves isHit flag on every hit object', function(done) {
    var hitCircle1 = getCircle(0,0, 3),
        hitCircle2 = getCircle(4,0, 3),
        notHitCircle = getCircle(14,0, 3);

    var detector = new CollisionDetection(hitCircle1, hitCircle2, notHitCircle);
    detector.test();
    expect(hitCircle1.isHit).toBe(true);
    expect(hitCircle2.isHit).toBe(true);
    expect(notHitCircle.isHit).not.toBe(true);
    done();
  });

  it('emits leaveHit event on every object leaving hit modus', function(done) {
    var hitCircle1 = getCircle(0,0, 3),
        hitCircle2 = getCircle(4,0, 3),
        notHitCircle = getCircle(14,0, 3),
        count = 0;

    var detector = new CollisionDetection(hitCircle1, hitCircle2, notHitCircle);
    detector.test();

    hitCircle2.position.x = 100;
    hitCircle1.on('leaveHit', function(obj) { ++count; });
    hitCircle2.on('leaveHit', function(obj) { ++count; });
    notHitCircle.on('leaveHit', function(obj) { expect(true).toBe(false); });

    detector.test();
    expect(count).toBe(2);
    done();
  });

  it('removes isHit flag on every object leaving hit modus', function(done) {
    var hitCircle1 = getCircle(0,0, 3),
        hitCircle2 = getCircle(4,0, 3),
        notHitCircle = getCircle(14,0, 3);

    var detector = new CollisionDetection(hitCircle1, hitCircle2, notHitCircle);
    detector.test();

    hitCircle2.position.x = 100;
    detector.test();
    expect(hitCircle1.isHit).not.toBe(true);
    expect(hitCircle2.isHit).not.toBe(true);
    expect(notHitCircle.isHit).not.toBe(true);
    done();
  });

  describe("hit events on polygons", function() {
    it("saves isHit flat on polygons", function(done) {
      var polygon1 = getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          polygon2 = getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0));
          detector = new CollisionDetection(polygon1, polygon2);
      detector.test();
      expect(polygon1.isHit).toBe(true);
      expect(polygon2.isHit).toBe(true);
      done();
    });

    it("emits hit event on polygons", function(done) {
      var polygon1 = getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          polygon2 = getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0));
          detector = new CollisionDetection(polygon1, polygon2),
          count = 0;

      polygon1.on('hit', function(obj) { expect(obj).toBe(polygon2); ++count; });
      polygon2.on('hit', function(obj) { expect(obj).toBe(polygon1); ++count; });
      detector.test();
      expect(count).toBe(2);
      done();
    });

    it("emits no leaveHit event on colliding polygons", function(done) {
      var polygon1 = getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          polygon2 = getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0)),
          polygon3 = getPolygon(new Vector(10,0), new Vector(10,2), new Vector(30,0));
          detector = new CollisionDetection(polygon1, polygon2, polygon3),
          count = 0;

      polygon1.on('leaveHit', function(obj) { ++count; });
      polygon2.on('leaveHit', function(obj) { ++count; });
      detector.test();
      expect(count).toBe(0);
      done();
    });

    it("emits no leaveHit event on never colliding polygons", function(done) {
      var polygon1 = getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          polygon2 = getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0)),
          polygon3 = getPolygon(new Vector(10,0), new Vector(10,2), new Vector(30,0));
          detector = new CollisionDetection(polygon1, polygon2, polygon3),
          count = 0;

      polygon3.on('leaveHit', function(obj) { expect(true).toBe(false); });
      detector.test();
      expect(count).toBe(0);
      done();
    });

    it("emits no leaveHit event if two pairs of objects ", function(done) {
      var rect1 = getRect(-10,0, -7,3),
          rect2 = getRect(-12,2, -10,4),
          polygon1 = getPolygon(new Vector(0,0), new Vector(3,3), new Vector(0,3)),
          polygon2 = getPolygon(new Vector(1,0), new Vector(1,2), new Vector(3,0));
      var detector = new CollisionDetection(rect1, rect2, polygon1, polygon2);
      rect1.on('leaveHit', function(obj) { expect(true).toBe(false); });
      rect2.on('leaveHit', function(obj) { expect(true).toBe(false); });
      polygon1.on('leaveHit', function(obj) { expect(true).toBe(false); });
      polygon2.on('leaveHit', function(obj) { expect(true).toBe(false); });
      detector.test();
      done();
    });

  });
});
