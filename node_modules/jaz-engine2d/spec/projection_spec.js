
var Vector = require(__dirname + '/../libs/vector');
var Projection = require(__dirname + '/../libs/projection');

describe(Projection, function() {
  it("can be created and contains min and max", function(done) {
    var obj = new Projection(1, 4);
    expect(obj.min).toEqual(1);
    expect(obj.max).toEqual(4);
    done();
  });

  it("#distanceTo calculates distance to another projection", function(done) {
    var obj = new Projection(1, 4);
    expect(obj.distanceTo(new Projection(1, 4))).toEqual(-3);
    expect(obj.distanceTo(new Projection(-4, 1))).toEqual(0);
    expect(obj.distanceTo(new Projection(4, 7))).toEqual(0);

    expect(obj.distanceTo(new Projection(-1, 0))).toEqual(1);
    expect(obj.distanceTo(new Projection(7, 14))).toEqual(3);
    done();
  });
});
