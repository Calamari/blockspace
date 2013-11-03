
var requestAnimFrame = (function() {
  return window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(callback, fps) {
       return window.setTimeout(callback, 1000/60);
     };
})();

window.addEventListener('DOMContentLoaded', function() {
  var canvasElement = document.getElementById('canvas'),
      context  = canvasElement.getContext('2d');

  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  window.rect = new Collidable.Rectangle({
    position: new Vector(50, 50),
    width: 100,
    height: 100,
  });
  window.rect2 = new Collidable.Rectangle({
    position: new Vector(170, 50),
    width: 100,
    height: 100,
  });
  window.poly1 = new Collidable.Polygon({
    position: new Vector(50, 300),
    points: [new Vector(0, 0), new Vector(40, 20), new Vector(0, 40)]
  });
  window.poly2 = new Collidable.Polygon({
    position: new Vector(80, 300),
    points: [new Vector(0, 20), new Vector(40, 0), new Vector(0, 40)]
  });
  window.circle1 = new Collidable.Circle({
    position: new Vector(300, 100),
    radius: 32
  });

  var drawPolygon = function(poly) {
    context.strokeStyle = poly.isHit ? '#ff0000' : '#000000';
    context.beginPath();
    for (var i=0,l=poly.points.length; i<l; ++i) {
      context.moveTo(poly.position.x + poly.points[i].x, poly.position.y + poly.points[i].y);
      var nextPoint = poly.points[i===l-1 ? 0 : i+1];
      context.lineTo(poly.position.x + nextPoint.x, poly.position.y + nextPoint.y);
    }
    context.stroke();
  };

  var collisionDetection = new CollisionDetection(rect, rect2, poly1, poly2, circle1);

  var render = function() {
    collisionDetection.test();
    context.clearRect(0,0, canvasElement.width, canvasElement.height);

    context.strokeStyle = rect.isHit ? '#ff0000' : '#000000';
    context.strokeRect(rect.position.x, rect.position.y, rect.width, rect.height);

    context.strokeStyle = rect2.isHit ? '#ff0000' : '#000000';
    context.strokeRect(rect2.position.x, rect2.position.y, rect2.width, rect2.height);

    context.strokeStyle = circle1.isHit ? '#ff0000' : '#000000';
    context.beginPath();
    context.arc(circle1.position.x, circle1.position.y, circle1.radius, 0, Math.PI*2, true);
    context.stroke()

    drawPolygon(poly1);
    drawPolygon(poly2);

    requestAnimFrame(render);
  };

  render();
}());
