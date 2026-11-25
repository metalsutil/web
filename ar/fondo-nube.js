// Fondo animado: nube de símbolos ASCII (sketch "Mixed spectroscope" de @sutilmetal)
// Corre en modo instancia de p5 para no interferir con el resto de la app.
new p5((p) => {
  let cols, rows;
  const scl = 22;
  const spacing = 1.3;
  let xoff = 0;
  let zoff = 0;
  const characters = "      ....-:///+++";
  // Color de los símbolos: azul eléctrico semitransparente para que la interfaz se lea bien.
  // Para volver al blanco original: COLOR = [255, 255, 255], ALFA = 255
  const COLOR = [47, 107, 255];
  const ALFA = 130;
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function medir() {
    cols = p.floor(p.width / (scl * spacing));
    rows = p.floor(p.height / scl) + 1;
  }

  p.setup = () => {
    const c = p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
    c.id("fondo-nube");
    c.elt.setAttribute("aria-hidden", "true");
    p.pixelDensity(1);
    p.frameRate(30);
    medir();
    p.textFont("monospace");
    p.textSize(scl * 0.9);
    p.textAlign(p.CENTER, p.CENTER);
    if (quieto) p.noLoop();
  };

  p.draw = () => {
    p.clear();
    p.background(0);
    p.fill(COLOR[0], COLOR[1], COLOR[2], ALFA);
    p.noStroke();
    let windX = xoff;
    for (let x = 0; x < cols; x++) {
      let yoff = 0;
      for (let y = 0; y < rows; y++) {
        const r = p.noise(windX, yoff, zoff);
        let i = p.floor(p.map(r, 0.4, 0.9, 0, characters.length));
        i = p.constrain(i, 0, characters.length - 1);
        const ch = characters.charAt(i);
        if (ch !== " ") p.text(ch, x * scl * spacing + (scl * spacing) / 2, y * scl + scl / 2);
        yoff += 0.09;
      }
      windX += 0.09;
    }
    xoff += 0.006;
    zoff += 0.003;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    medir();
    if (quieto) p.redraw();
  };
});
