// Código compartido entre la página de subida y el visor
const cfg = window.APP_CONFIG;
const configurado = !cfg.SUPABASE_URL.includes("TU-PROYECTO") && !cfg.SUPABASE_ANON_KEY.includes("TU-CLAVE");
const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

const AJUSTES_BASE = {
  autoRotate: true,
  exposicion: 1,
  sombra: 1,
  fondo: "#efece6",
  colocacion: "floor",
  orbita: null
};

// Aplica los ajustes guardados a un <model-viewer>
function aplicarAjustes(mv, ajustes, { conOrbita = true } = {}) {
  const a = { ...AJUSTES_BASE, ...(ajustes || {}) };
  if (a.autoRotate) mv.setAttribute("auto-rotate", "");
  else mv.removeAttribute("auto-rotate");
  mv.setAttribute("exposure", String(a.exposicion));
  mv.setAttribute("shadow-intensity", String(a.sombra));
  mv.setAttribute("ar-placement", a.colocacion === "wall" ? "wall" : "floor");
  mv.style.backgroundColor = a.fondo;
  if (conOrbita && a.orbita) mv.setAttribute("camera-orbit", a.orbita);
}

function urlPublica(ruta) {
  return sb.storage.from("modelos").getPublicUrl(ruta).data.publicUrl;
}
