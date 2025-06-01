fetch("projects.json")
  .then((res) => res.json())
  .then((projects) => {
    // inicia animación con el array `projects`
  });

// Mezcla aleatoria
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffleArray(projects);

class SnakeSegment {
  constructor(url, imgSrc, x, y) {
    this.x = x;
    this.y = y;
    this.el = document.createElement("a");
    this.el.href = url;
    this.el.target = "_blank";
    this.el.className = "snake-img";
    const img = document.createElement("img");
    img.src = imgSrc;
    this.el.appendChild(img);
    document.body.appendChild(this.el);
  }

  update(targetX, targetY, lerpFactor = 0.01) {
    this.x += (targetX - this.x) * lerpFactor;
    this.y += (targetY - this.y) * lerpFactor;
    this.el.style.left = `${this.x}px`;
    this.el.style.top = `${this.y}px`;
  }
}

const startX = window.innerWidth / 2;
const startY = window.innerHeight / 2;

const segments = projects.map((p, i) => {
  const radius = 500 + Math.random() * 500;
  const angle = Math.random() * Math.PI * 2;
  return new SnakeSegment(
    p.url,
    p.img,
    startX + radius * Math.cos(angle),
    startY + radius * Math.sin(angle)
  );
});


let head = segments[0];
let pos = { x: startX, y: startY };
let dir = { x: 1, y: 0 };
const speed = 2;
let targetAngle = Math.random() * Math.PI * 2;
let currentAngle = targetAngle;

function randomAngleExcluding(excludeAngle) {
  let angle;
  do {
    angle = Math.random() * Math.PI * 2;
  } while (Math.abs(angle - excludeAngle) < 0.3); // evita ángulos similares
  return angle;
}

setInterval(() => {
  targetAngle = randomAngleExcluding(currentAngle);
}, 4000); // cambia cada 4s (ajustable)

function animate() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const margin = 80;

  // interpolación suave entre ángulos
  currentAngle += (targetAngle - currentAngle) * 0.02;
  dir.x = Math.cos(currentAngle);
  dir.y = Math.sin(currentAngle);

  const dx = dir.x * speed;
  const dy = dir.y * speed;

  pos.x += dx;
  pos.y += dy;
  
    // Corrige la posición si se pasó
    pos.x = Math.min(Math.max(pos.x, margin), width - margin);
    pos.y = Math.min(Math.max(pos.y, margin), height - margin);

  // Actualiza posición de la cabeza
  head.x = pos.x;
  head.y = pos.y;
  head.el.style.left = `${head.x}px`;
  head.el.style.top = `${head.y}px`;

  // Cada segmento sigue al anterior
  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    segments[i].update(prev.x, prev.y, 0.008); // suavizado ajustable
  }

  requestAnimationFrame(animate);
}
animate();
