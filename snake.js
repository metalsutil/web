fetch("projects.json")
  .then((res) => res.json())
  .then((projects) => {
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
        this.width = 0;
        this.height = 0;

        this.el = document.createElement("a");
        this.el.href = url;
        this.el.target = "_blank";
        this.el.className = "snake-img";
        this.el.style.position = "absolute";

        const img = document.createElement("img");
        img.src = imgSrc;
img.onload = () => {
  const minSize = 150;   // Tamaño mínimo
  const maxSize = 350;  // Tamaño máximo
  const base = Math.random() * (maxSize - minSize) + minSize;

  const ratio = img.naturalWidth / img.naturalHeight;

  if (ratio > 1) {
    img.width = base;
    img.height = base / ratio;
  } else {
    img.height = base;
    img.width = base * ratio;
  }

  this.width = img.width;
  this.height = img.height;

  // Centrado visual
  this.el.style.marginLeft = `-${this.width / 2}px`;
  this.el.style.marginTop = `-${this.height / 2}px`;
};


        this.el.appendChild(img);
        document.body.appendChild(this.el);
      }

      update(targetX, targetY, lerpFactor = 0.01) {
        this.x += (targetX - this.x) * lerpFactor;
        this.y += (targetY - this.y) * lerpFactor;
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
        
      }

      getBoundsMargin() {
        return {
          left: this.width / 2,
          right: this.width / 2,
          top: this.height / 2,
          bottom: this.height / 2,
        };
      }
    }

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    const segments = projects.map((p, i) => {
      const radius = 800 + Math.random() * 800;
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
      } while (Math.abs(angle - excludeAngle) < 0.3);
      return angle;
    }

    setInterval(() => {
      targetAngle = randomAngleExcluding(currentAngle);
    }, 4000);

    const margin = 40; // margen extra de separación con los bordes

    function animate() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      currentAngle += (targetAngle - currentAngle) * 0.02;
      dir.x = Math.cos(currentAngle);
      dir.y = Math.sin(currentAngle);

      const dx = dir.x * speed;
      const dy = dir.y * speed;

      pos.x += dx;
      pos.y += dy;

      // Ajustar margen dinámicamente según tamaño del head
      const headMargins = head.getBoundsMargin();

      if (
        pos.x < margin + headMargins.left ||
        pos.x > width - margin - headMargins.right
      ) {
        currentAngle = Math.PI - currentAngle;
        pos.x = Math.min(
          Math.max(pos.x, margin + headMargins.left),
          width - margin - headMargins.right
        );
      }

      if (
        pos.y < margin + headMargins.top ||
        pos.y > height - margin - headMargins.bottom
      ) {
        currentAngle = -currentAngle;
        pos.y = Math.min(
          Math.max(pos.y, margin + headMargins.top),
          height - margin - headMargins.bottom
        );
      }

      // Actualiza posición de la cabeza
      head.x = pos.x;
      head.y = pos.y;
      head.el.style.left = `${head.x}px`;
      head.el.style.top = `${head.y}px`;

      // Segmentos siguientes
      for (let i = 1; i < segments.length; i++) {
        const prev = segments[i - 1];
        segments[i].update(prev.x, prev.y, 0.02);
      }

      requestAnimationFrame(animate);
    }

    animate();
  });
