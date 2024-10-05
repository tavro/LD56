const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 30,
  color: 'blue',
  speed: 5
};

let mouse = {
  x: 0,
  y: 0
};

let isMouseDown = false;

canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

canvas.addEventListener('mousedown', () => {
  isMouseDown = true;
});

canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

function drawPlayer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}

function updatePlayerPosition() {
  if (isMouseDown) {
    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > player.speed) {
      const angle = Math.atan2(dy, dx);
      player.x += player.speed * Math.cos(angle);
      player.y += player.speed * Math.sin(angle);
    }
  }
}

function animate() {
  drawPlayer();
  updatePlayerPosition();
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
