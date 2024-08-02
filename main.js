const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = { x: 0, y: 0 };
    this.alive = true;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    if (this.alive) {
      this.draw();
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      // Prevent player from moving out of bounds
      if (this.x - this.radius < 0) this.x = this.radius;
      if (this.x + this.radius > canvas.width)
        this.x = canvas.width - this.radius;
      if (this.y - this.radius < 0) this.y = this.radius;
      if (this.y + this.radius > canvas.height)
        this.y = canvas.height - this.radius;
    }
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class GreenBall {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = { x: 0, y: 0 };
    this.alive = true;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    if (this.alive) {
      this.draw();
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.velocity.x = Math.cos(angle) * 1.5;
      this.velocity.y = Math.sin(angle) * 1.5;
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      // Collision detection with player
      const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
      if (distToPlayer - this.radius - player.radius < 0) {
        player.alive = false;
      }
    }
  }
}

const player = new Player(canvas.width / 2, canvas.height / 2, 30, "blue");
const projectiles = [];
const greenBalls = [];
let score = 0;

function spawnGreenBalls() {
  setInterval(() => {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    greenBalls.push(new GreenBall(x, y, 30, "green"));
  }, 1000);
}

function animate() {
  if (player.alive) {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    projectiles.forEach((projectile, pIndex) => {
      projectile.update();
      if (
        projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height
      ) {
        setTimeout(() => {
          projectiles.splice(pIndex, 1);
        }, 0);
      }
      // Collision detection with green balls
      greenBalls.forEach((greenBall, gIndex) => {
        const dist = Math.hypot(
          projectile.x - greenBall.x,
          projectile.y - greenBall.y
        );
        if (dist - projectile.radius - greenBall.radius < 0) {
          setTimeout(() => {
            greenBalls.splice(gIndex, 1);
            projectiles.splice(pIndex, 1);
            score += 1;
          }, 0);
        }
      });
    });
    greenBalls.forEach((greenBall) => greenBall.update());
    displayScore();
  } else {
    displayGameOver();
  }
}

function displayScore() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 10, 30);
}

function displayGameOver() {
  ctx.font = "50px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
  ctx.fillText(
    "Final Score: " + score,
    canvas.width / 2 - 120,
    canvas.height / 2 + 50
  );
}

window.addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(new Projectile(player.x, player.y, 5, "red", velocity));
});

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

window.addEventListener("keydown", (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true;
    updatePlayerVelocity();
  }
});

window.addEventListener("keyup", (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = false;
    updatePlayerVelocity();
  }
});

function updatePlayerVelocity() {
  player.velocity.x = 0;
  player.velocity.y = 0;

  if (keys.w) player.velocity.y = -5;
  if (keys.s) player.velocity.y = 5;
  if (keys.a) player.velocity.x = -5;
  if (keys.d) player.velocity.x = 5;
}

animate();
spawnGreenBalls();
