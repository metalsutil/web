const canvas = document.createElement("canvas");
document.getElementById("animation-container").appendChild(canvas);
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let sprites = [];
let lastClickedSprite = null;
let lastClickTime = 0;

fetch("projects.json")
  .then(res => res.json())
  .then(data => {
    const filtered = [];
    const seen = new Set();

    data.forEach(item => {
      const base = item.img.split("/").slice(-2).join("/");
      if (!seen.has(base)) {
        seen.add(base);
        filtered.push(item);
      }
    });

    let loaded = 0;
    filtered.forEach(item => {
      const img = new Image();
      img.src = item.img;
      img.onload = () => {
        const minW = 80;
        const maxW = 180;
        const scale = (Math.random() * (maxW - minW) + minW) / img.width;
        const w = img.width * scale;
        const h = img.height * scale;

        const now = Date.now();
        const useCurve = Math.random() < 0.5;

        sprites.push({
          img,
          url: item.url || "#",
          x: Math.random() * (canvas.width - w),
          y: Math.random() * (canvas.height - h),
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          w, h,
          angle: Math.random() * Math.PI * 2,
          radius: 1 + Math.random() * 2,
          speed: 0.01 + Math.random() * 0.01,
          useCurve,
          lastSwitch: now,
          nextSwitch: now + 3000 + Math.random() * 4000,
          trail: []
        });

        loaded++;
        if (loaded === filtered.length) animate();
      };
    });
  });

function animate() {
  const now = Date.now();

  sprites.forEach(sprite => {
    // Cambiar tipo de movimiento cada cierto tiempo
    if (now > sprite.nextSwitch) {
      sprite.useCurve = !sprite.useCurve;
      sprite.lastSwitch = now;
      sprite.nextSwitch = now + 3000 + Math.random() * 5000;
    }

    // Movimiento
    if (sprite.useCurve) {
      sprite.angle += sprite.speed;
      sprite.x += Math.cos(sprite.angle) * sprite.radius;
      sprite.y += Math.sin(sprite.angle) * sprite.radius;
    } else {
      sprite.x += sprite.vx;
      sprite.y += sprite.vy;
    }

    // Rebote con margen
    const margin = 10;
    if (sprite.x < margin) {
      sprite.x = margin;
      sprite.vx *= -1;
    } else if (sprite.x + sprite.w > canvas.width - margin) {
      sprite.x = canvas.width - sprite.w - margin;
      sprite.vx *= -1;
    }
    if (sprite.y < margin) {
      sprite.y = margin;
      sprite.vy *= -1;
    } else if (sprite.y + sprite.h > canvas.height - margin) {
      sprite.y = canvas.height - sprite.h - margin;
      sprite.vy *= -1;
    }

    // Estela
    sprite.trail.push({ x: sprite.x, y: sprite.y });
    if (sprite.trail.length > 30) sprite.trail.shift();

    sprite.trail.forEach((t) => {
      ctx.drawImage(sprite.img, t.x, t.y, sprite.w, sprite.h);
    });
  });

  // Enfoque visual
  sprites.forEach(sprite => {
    if (lastClickedSprite && sprite !== lastClickedSprite) {
      ctx.globalAlpha = 0.2;
    } else {
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.w, sprite.h);
    ctx.globalAlpha = 1;
  });

  requestAnimationFrame(animate);
}

// Interacción: mover en el primer clic, abrir en el segundo
canvas.addEventListener("click", e => {
  const x = e.offsetX;
  const y = e.offsetY;
  const now = Date.now();

  for (let i = sprites.length - 1; i >= 0; i--) {
    const s = sprites[i];
    if (
      x > s.x && x < s.x + s.w &&
      y > s.y && y < s.y + s.h
    ) {
      if (lastClickedSprite === s && now - lastClickTime < 800) {
        window.location.href = s.url;
      } else {
        // Teletransportar a nueva posición aleatoria
        s.x = Math.random() * (canvas.width - s.w);
        s.y = Math.random() * (canvas.height - s.h);

        // Empujar también
        s.vx += (Math.random() - 0.5) * 2;
        s.vy += (Math.random() - 0.5) * 2;

        lastClickedSprite = s;
        lastClickTime = now;
      }
      break;
    }
  }
});
