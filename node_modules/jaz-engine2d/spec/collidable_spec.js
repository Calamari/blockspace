
var Vector = require(__dirname + '/../libs/vector');
var Collidable = require(__dirname + '/../libs/collidable');
var Projection = require(__dirname + '/../libs/projection');

var behavesLikeProject = function(obj) {
  describe('#project', function() {
    it("is a method", function(done) {
      expect(typeof obj.project).toEqual('function');
      done();
    });

    it("returns a Projection", function(done) {
      var projection = obj.project(new Vector(1,0));
      expect(projection.constructor).toEqual(Projection);
      expect(typeof projection.min).toEqual('number');
      expect(typeof projection.max).toEqual('number');
      done();
    });

    it("returns min 0 and max 1 if projected onto the x axis", function(done) {
      var projection = obj.project(new Vector(1,0));
      expect(projection.min).toEqual(0);
      expect(projection.max).toEqual(1);
      done();
    });

    it("returns min 0 and max 2 if projected onto the y axis", function(done) {
      var projection = obj.project(new Vector(0,1));
      expect(projection.min).toEqual(1);
      expect(projection.max).toEqual(3);
      done();
    });

    it("includes obj position into projection calculation", function(done) {
      obj.position.add(new Vector(1,2));
      var projection = obj.project(new Vector(0,1));
      expect(projection.min).toEqual(3);
      expect(projection.max).toEqual(5);
      done();
    });
  });
};



describe(Collidable, function() {
  it("Instance of abstract class Collidable has 'none' as collision type", function(done) {
    var obj = new Collidable();
    expect(obj.collisionType).toEqual('none');
    done();
  });

  describe(Collidable.Rectangle, function() {
    it("has 'rectangle' as collision type", function(done) {
      var obj = new Collidable.Rectangle();
      expect(obj.collisionType).toEqual('rectangle');
      done();
    });

    it("has a position of top left coordinates", function(done) {
      var obj = new Collidable.Rectangle();
      expect(obj.position.constructor).toEqual(Vector);
      done();
    });

    it("can take the top left position as constructor arguments", function(done) {
      var obj = new Collidable.Rectangle({ position: new Vector(4,3) });
      expect(obj.position.x).toEqual(4);
      expect(obj.position.y).toEqual(3);
      done();
    });

    it("has a width", function(done) {
      var obj = new Collidable.Rectangle();
      expect(obj.width).toEqual(0);
      done();
    });

    it("can take the width as constructor arguments", function(done) {
      var obj = new Collidable.Rectangle({ width: 12 });
      expect(obj.width).toEqual(12);
      done();
    });

    it("has a height", function(done) {
      var obj = new Collidable.Rectangle();
      expect(obj.height).toEqual(0);
      done();
    });

    it("can take the height as constructor arguments", function(done) {
      var obj = new Collidable.Rectangle({ height: 14 });
      expect(obj.height).toEqual(14);
      done();
    });

    it("has a set of points we can use in edge calculations", function(done) {
      var obj = new Collidable.Rectangle({ position: new Vector(1,1), width: 12, height: 14 });
      expect(obj.points.length).toEqual(4);
      expect(obj.points[0]).toEqual(new Vector(0,0));
      expect(obj.points[1]).toEqual(new Vector(12,0));
      expect(obj.points[2]).toEqual(new Vector(12,14));
      expect(obj.points[3]).toEqual(new Vector(0,14));
      done();
    });

    behavesLikeProject(new Collidable.Rectangle({ position: new Vector(0,1), width: 1, height: 2 }));
  });

  describe(Collidable.Circle, function() {
    it("has 'circle' as collision type", function(done) {
      var obj = new Collidable.Circle();
      expect(obj.collisionType).toEqual('circle');
      done();
    });

    it("has a position of the middle point", function(done) {
      var obj = new Collidable.Circle();
      expect(obj.position.constructor).toEqual(Vector);
      done();
    });

    it("can take the middle point position as constructor arguments", function(done) {
      var obj = new Collidable.Circle({ position: new Vector(4,3) });
      expect(obj.position.x).toEqual(4);
      expect(obj.position.y).toEqual(3);
      done();
    });

    it("has a radius", function(done) {
      var obj = new Collidable.Circle();
      expect(obj.radius).toEqual(0);
      done();
    });

    it("radius can be set through constructor arguments", function(done) {
      var obj = new Collidable.Circle({ radius: 10 });
      expect(obj.radius).toEqual(10);
      done();
    });

    describe('#project', function() {
      var obj = new Collidable.Circle({ position: new Vector(5,10), radius: 3 });
      it("is a method", function(done) {
        expect(typeof obj.project).toEqual('function');
        done();
      });

      it("returns a Projection", function(done) {
        var projection = obj.project(new Vector(1,0));
        expect(projection.constructor).toEqual(Projection);
        expect(typeof projection.min).toEqual('number');
        expect(typeof projection.max).toEqual('number');
        done();
      });

      it("returns min 2 and max 8 if projected onto the x axis", function(done) {
        var projection = obj.project(new Vector(1,0));
        expect(projection.min).toEqual(2);
        expect(projection.max).toEqual(8);
        done();
      });

      it("returns min 7 and max 13 if projected onto the y axis", function(done) {
        var projection = obj.project(new Vector(0,1));
        expect(projection.min).toEqual(7);
        expect(projection.max).toEqual(13);
        done();
      });
    });
  });

  describe(Collidable.Polygon, function() {
    it("has 'polygon' as collision type", function(done) {
      var obj = new Collidable.Polygon();
      expect(obj.collisionType).toEqual('polygon');
      done();
    });

    it("has a position for top left coordinates", function(done) {
      var obj = new Collidable.Polygon();
      expect(obj.position.constructor).toEqual(Vector);
      done();
    });

    it("has an array of points defining the polygon", function(done) {
      var obj = new Collidable.Polygon();
      expect(obj.points.constructor).toEqual(Array);
      done();
    });

    it("has a width defining a boundingBox", function(done) {
      var obj = new Collidable.Polygon();
      expect(obj.width).toEqual(0);
      done();
    });

    it("has a height defining a boundingBox", function(done) {
      var obj = new Collidable.Polygon();
      expect(obj.height).toEqual(0);
      done();
    });

    behavesLikeProject(new Collidable.Polygon({ points: [ new Vector(0,1), new Vector(0,3), new Vector(1,2) ] }));

    describe('#calculateBoundingBox', function() {
      var obj;
      beforeEach(function() {
        obj = new Collidable.Polygon({ points: [ new Vector(3,3), new Vector(2,3), new Vector(2,1) ] });
        obj.calculateBoundingBox();
      });

      it("can calculate width and height", function(done) {
        expect(obj.width).toEqual(1);
        expect(obj.height).toEqual(2);
        done();
      });

      it("sets x and y offset if polygon does not start start on x=0 and y=0", function(done) {
        expect(obj.offset.constructor).toEqual(Vector);
        expect(obj.offset.x).toEqual(2);
        expect(obj.offset.y).toEqual(1);
        done();
      });
    });
  });
});
