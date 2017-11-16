var canvas, width, height, ctx;
var bodies = [];

function init() {
  canvas = document.getElementById("canvas");

  width = window.innerWidth;
  height = window.innerHeight * 0.75;
  canvas.width = width;
  canvas.height = height;

  ctx = canvas.getContext('2d');

  createBodies();

  ctx.fillStyle = "#000000"; 
  ctx.fillRect(0, 0, width, height);

  setInterval(function() {
    updateCenter();
    updateSystem();

    updateBodies(0.0015); 
    ctx.fillStyle = "#000000"; 
    ctx.fillRect(0, 0, width, height);
    drawBodies();
  }, 1);
}

function createBodies() {
  var centerX = width/2, centerY = height/2;

  bodies.push(new Body(centerX, centerY, 0, 0, 10000000, 15, false));
  bodies.push(new Body(centerX, centerY - 100, 400, 0, 100, 5, true));
  
}

function updateCenter() {
  window.onresize = function() {
    width = window.innerWidth;
    height = window.innerHeight * 0.75;

    canvas.width = width;
    canvas.height = height;

    var centerX = width/2, centerY = height/2;
    bodies = [];

    bodies.push(new Body(centerX, centerY, 0, 0, 10000000, 15, false));
    bodies.push(new Body(centerX, centerY - 100, 400, 0, 100, 5, true));
  }; 
}

function drawBodies() {
  for(var i = 0; i < bodies.length; i++) bodies[i].draw(ctx);
}

function updateBodies(dt) {
  for(var i = 0; i < bodies.length; i++) bodies[i].update(dt);
}

function updateSystem() {
  let G = 1;

  for(var i = 0; i < bodies.length; i++)
    for (var j = 0; j < bodies.length; j++) {
      if(i == j) {
        continue;
      }

      var b1 = bodies[i];
      var b2 = bodies[j];

      var dist = Math.sqrt((b1.x - b2.x) * (b1.x - b2.x) + (b1.y - b2.y) * (b1.y - b2.y));
      var force = G * (b1.mass * b2.mass) / dist / dist;

      var nx = (b2.x - b1.x) / dist;
      var ny = (b2.y - b1.y) / dist;

      b1.ax += nx * force / b1.mass;
      b1.ay += ny * force / b1.mass;
      b2.ax -= nx * force / b2.mass;
      b2.ay -= ny * force / b2.mass;
    }
}

function Body(x, y, speed, direction, mass, radius, hasTail) {
  this.x = x; // Set body initial horizontal position
  this.y = y; // Set body initial vertical position

  this.vx = speed * Math.cos(direction);  // Set body initial horizontal velocity
  this.vy = speed * Math.sin(direction);  // Set body initial vertical velocity

  this.mass = mass;     // Set body mass
  this.radius = radius; // Set body radius

  this.ax = 0;  // Set body initial horizontal acceleration
  this.ay = 0;  // Set body initial vertical acceleration

  if(hasTail) {
    this.tail = new Tail(30); // Give body tail of length 70 if needed
  }

  this.tailCounter = 0;
  this.tailLimit = 3;

  this.update = function(timeChange) {
    this.vx += this.ax * timeChange;
    this.vy += this.ay * timeChange;

    this.x += this.vx * timeChange;
    this.y += this.vy * timeChange;

    this.ax = 0;
    this.ay = 0;

    if(this.tail) {
      if(this.tailCounter > this.tailLimit) {
        this.tailCounter -= this.tailLimit;
        this.tail.addPoint({x: this.x, y: this.y});
      } else {
        this.tailCounter++;
      }
    }
  };

  this.draw = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 6.28);

    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    ctx.closePath();

    if(this.tail) {
      this.tail.draw(ctx);
    }
  };
}

function Tail(maxLength) {
  this.points = [];
  this.maxLength = maxLength;

  this.addPoint = function(point) {
    for(var i = Math.min(maxLength, this.points.length); i > 0; i--) {
      this.points[i] = this.points[i - 1];
    }

    this.points[0] = point;
  };

  this.draw = function(ctx) {
    for(var i = 1; i < Math.min(this.maxLength, this.points.length); i++) {
      if(i < this.maxLength - 20) {
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = (this.maxLength - i) / 20;
      }

      ctx.beginPath();
      ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
      ctx.lineTo(this.points[i].x, this.points[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
}
