const $ = (s) => document.querySelector(s);
let usuario = null;
let esAdmin = false;
let archivo = null;
let urlLocal = null;
let vistaGuardada = null;
let modoCrear = false;
let linkActual = "";

function msg(el, texto, tipo = "") {
  el.textContent = texto;
  el.className = "msg " + tipo;
}

function mb(bytes) {
  return (bytes / 1048576).toFixed(1) + " MB";
}

function linkDe(id) {
  return new URL("ver.html?id=" + id, location.href).href;
}

// ---------- Sesión ----------
async function cambiarSesion(session) {
  const nuevo = session?.user ?? null;
  if (nuevo && usuario && nuevo.id === usuario.id) return;
  usuario = nuevo;

  if (!usuario) {
    $("#acceso").hidden = false;
    $("#app").hidden = true;
    $("#zona-usuario").hidden = true;
    return;
  }

  const { data } = await sb.from("perfiles").select("es_admin").eq("id", usuario.id).maybeSingle();
  esAdmin = !!data?.es_admin;

  $("#acceso").hidden = true;
  $("#app").hidden = false;
  $("#zona-usuario").hidden = false;
  $("#correo").textContent = usuario.email + (esAdmin ? " · admin" : "");
  $("#zona-todos").hidden = !esAdmin;
  cargarModelos();
}

function ponerModo(crear) {
  modoCrear = crear;
  $("#tab-entrar").classList.toggle("activa", !crear);
  $("#tab-crear").classList.toggle("activa", crear);
  $("#boton-acceso").textContent = crear ? "Crear cuenta" : "Entrar";
  $("#clave").autocomplete = crear ? "new-password" : "current-password";
  msg($("#msg-acceso"), "");
}

$("#tab-entrar").onclick = () => ponerModo(false);
$("#tab-crear").onclick = () => ponerModo(true);

$("#form-acceso").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const password = $("#clave").value;
  const m = $("#msg-acceso");
  $("#boton-acceso").disabled = true;
  msg(m, modoCrear ? "Creando cuenta…" : "Entrando…");

  if (modoCrear) {
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { emailRedirectTo: location.origin + location.pathname }
    });
    if (error) msg(m, traducirError(error), "error");
    else if (!data.session) msg(m, "Cuenta creada. Revisa tu correo para confirmarla y luego entra.", "ok");
  } else {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) msg(m, traducirError(error), "error");
  }
  $("#boton-acceso").disabled = false;
});

$("#olvide").onclick = async () => {
  const email = $("#email").value.trim();
  const m = $("#msg-acceso");
  if (!email) return msg(m, "Escribe tu correo arriba y vuelve a tocar “Olvidé mi contraseña”.", "error");
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
  if (error) msg(m, traducirError(error), "error");
  else msg(m, "Te enviamos un correo para crear una contraseña nueva.", "ok");
};

$("#salir").onclick = () => sb.auth.signOut();

function traducirError(error) {
  const t = (error.message || "").toLowerCase();
  if (t.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (t.includes("email not confirmed")) return "Falta confirmar la cuenta desde tu correo.";
  if (t.includes("already registered")) return "Ese correo ya tiene cuenta. Usa “Entrar”.";
  if (t.includes("rate limit")) return "Se enviaron demasiados correos. Espera un rato e intenta de nuevo.";
  if (t.includes("password")) return "La contraseña debe tener al menos 6 caracteres.";
  if (t.includes("exceeded the maximum") || t.includes("too large")) return "El archivo supera el tamaño permitido.";
  return error.message;
}

// ---------- Archivo y vista previa ----------
const preview = $("#preview");

$("#archivo").addEventListener("change", (e) => {
  const f = e.target.files[0];
  const m = $("#msg-archivo");
  if (!f) return;
  if (!f.name.toLowerCase().endsWith(".glb")) {
    e.target.value = "";
    return msg(m, "El archivo tiene que ser .glb", "error");
  }
  if (f.size > cfg.MAX_MB * 1048576) {
    e.target.value = "";
    return msg(m, `Pesa ${mb(f.size)}. El máximo es ${cfg.MAX_MB} MB: intenta reducir polígonos o texturas.`, "error");
  }
  archivo = f;
  if (urlLocal) URL.revokeObjectURL(urlLocal);
  urlLocal = URL.createObjectURL(f);
  preview.removeAttribute("camera-orbit");
  preview.src = urlLocal;
  vistaGuardada = null;
  $("#borrar-vista").hidden = true;
  msg($("#msg-vista"), "");
  $("#editor").hidden = false;
  $("#texto-archivo").textContent = `${f.name} · ${mb(f.size)} (clic para cambiar)`;
  if (!$("#titulo").value) $("#titulo").value = f.name.replace(/\.glb$/i, "");
  msg(m, f.size > 8 * 1048576 ? "Ojo: sobre 8 MB puede tardar en cargar con datos móviles." : "");
  aplicarAjustes(preview, leerAjustes(), { conOrbita: false });
});

preview.addEventListener("error", () => {
  msg($("#msg-archivo"), "No se pudo leer el modelo. Revisa que el .glb no esté dañado.", "error");
});

function leerAjustes() {
  return {
    autoRotate: $("#a-rotar").checked,
    exposicion: parseFloat($("#a-exposicion").value),
    sombra: parseFloat($("#a-sombra").value),
    fondo: $("#a-fondo").value,
    colocacion: $("#a-colocacion").value,
    orbita: vistaGuardada
  };
}

["#a-rotar", "#a-exposicion", "#a-sombra", "#a-fondo", "#a-colocacion"].forEach((s) =>
  $(s).addEventListener("input", () => aplicarAjustes(preview, leerAjustes(), { conOrbita: false }))
);

$("#guardar-vista").onclick = () => {
  const o = preview.getCameraOrbit();
  vistaGuardada = `${o.theta}rad ${o.phi}rad ${o.radius}m`;
  $("#borrar-vista").hidden = false;
  msg($("#msg-vista"), "Vista inicial guardada.", "ok");
};
$("#borrar-vista").onclick = () => {
  vistaGuardada = null;
  $("#borrar-vista").hidden = true;
  msg($("#msg-vista"), "");
};

// ---------- Publicar ----------
$("#publicar").onclick = async () => {
  const m = $("#msg-publicar");
  const titulo = $("#titulo").value.trim();
  if (!archivo) return msg(m, "Primero elige un archivo.", "error");
  if (!titulo) return msg(m, "Ponle un título al modelo.", "error");

  $("#publicar").disabled = true;
  msg(m, "Subiendo el modelo…");

  const ruta = `${usuario.id}/${crypto.randomUUID()}.glb`;
  const subida = await sb.storage.from("modelos").upload(ruta, archivo, {
    contentType: "model/gltf-binary",
    upsert: false
  });
  if (subida.error) {
    $("#publicar").disabled = false;
    return msg(m, "No se pudo subir: " + traducirError(subida.error), "error");
  }

  const { data, error } = await sb.from("modelos").insert({
    titulo,
    autor: $("#autor").value.trim() || null,
    taller: $("#taller").value.trim().toLowerCase() || null,
    ruta,
    ajustes: leerAjustes(),
    peso_bytes: archivo.size
  }).select("id").single();

  $("#publicar").disabled = false;
  if (error) {
    await sb.storage.from("modelos").remove([ruta]);
    return msg(m, "No se pudo guardar: " + error.message, "error");
  }

  msg(m, "");
  mostrarResultado(data.id, titulo);
  limpiarFormulario();
  cargarModelos();
};

function limpiarFormulario() {
  archivo = null;
  $("#archivo").value = "";
  $("#titulo").value = "";
  $("#editor").hidden = true;
  $("#texto-archivo").innerHTML = `Haz clic para elegir otro archivo <b>.glb</b> (máximo ${cfg.MAX_MB} MB)`;
  vistaGuardada = null;
  // autor y taller se mantienen para subir varios seguidos
}

// ---------- Resultado: link + QR ----------
function mostrarResultado(id, titulo) {
  linkActual = linkDe(id);
  $("#resultado").hidden = false;
  $("#resultado-titulo").textContent = titulo;
  $("#link").textContent = linkActual;
  $("#abrir").href = linkActual;
  const qr = $("#qr");
  qr.innerHTML = "";
  new QRCode(qr, { text: linkActual, width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M });
  $("#resultado").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("#copiar").onclick = async () => {
  try {
    await navigator.clipboard.writeText(linkActual);
    msg($("#msg-resultado"), "Link copiado.", "ok");
  } catch {
    msg($("#msg-resultado"), "No se pudo copiar automáticamente; selecciona el link y cópialo.", "error");
  }
};

$("#bajar-qr").onclick = () => {
  const canvas = $("#qr canvas");
  if (!canvas) return;
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = ($("#resultado-titulo").textContent || "modelo").replace(/[^\w\-]+/g, "_") + "_QR.png";
  a.click();
};

// ---------- Lista de modelos ----------
let temporizadorFiltro;
$("#filtro-taller").addEventListener("input", () => {
  clearTimeout(temporizadorFiltro);
  temporizadorFiltro = setTimeout(cargarModelos, 300);
});
$("#ver-todos").addEventListener("change", cargarModelos);

async function cargarModelos() {
  if (!usuario) return;
  const todos = esAdmin && $("#ver-todos").checked;
  $("#titulo-lista").textContent = todos ? "Todos los modelos" : "Mis modelos";

  let q = sb.from("modelos")
    .select("id, titulo, autor, taller, ruta, peso_bytes, creado, usuario")
    .order("creado", { ascending: false })
    .limit(500);
  if (!todos) q = q.eq("usuario", usuario.id);
  const filtro = $("#filtro-taller").value.trim().toLowerCase();
  if (filtro) q = q.eq("taller", filtro);

  const { data, error } = await q;
  const lista = $("#lista");
  lista.innerHTML = "";
  if (error) return msg($("#msg-lista"), error.message, "error");
  msg($("#msg-lista"), data.length ? `${data.length} modelo(s)` : "Todavía no hay modelos aquí.");

  for (const mod of data) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const t = document.createElement("strong");
    t.textContent = mod.titulo;
    const meta = document.createElement("div");
    meta.className = "meta";
    const partes = [];
    if (mod.autor) partes.push(mod.autor);
    if (mod.taller) partes.push("taller: " + mod.taller);
    if (mod.peso_bytes) partes.push(mb(mod.peso_bytes));
    partes.push(new Date(mod.creado).toLocaleDateString("es-CL"));
    meta.textContent = partes.join(" · ");
    info.append(t, meta);

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const abrir = document.createElement("a");
    abrir.className = "boton secundario";
    abrir.textContent = "Abrir";
    abrir.href = linkDe(mod.id);
    abrir.target = "_blank";
    abrir.rel = "noopener";

    const qr = document.createElement("button");
    qr.className = "secundario";
    qr.textContent = "Link y QR";
    qr.onclick = () => mostrarResultado(mod.id, mod.titulo);

    const glb = document.createElement("a");
    glb.className = "boton secundario";
    glb.textContent = ".glb";
    glb.href = urlPublica(mod.ruta);
    glb.target = "_blank";
    glb.rel = "noopener";

    const borrar = document.createElement("button");
    borrar.className = "peligro";
    borrar.textContent = "Borrar";
    borrar.onclick = () => borrarModelo(mod);

    acciones.append(abrir, qr, glb, borrar);
    li.append(info, acciones);
    lista.append(li);
  }
}

async function borrarModelo(mod) {
  if (!confirm(`¿Borrar “${mod.titulo}”? El link dejará de funcionar y no se puede deshacer.`)) return;
  const r1 = await sb.storage.from("modelos").remove([mod.ruta]);
  if (r1.error) return msg($("#msg-lista"), "No se pudo borrar el archivo: " + r1.error.message, "error");
  const r2 = await sb.from("modelos").delete().eq("id", mod.id);
  if (r2.error) return msg($("#msg-lista"), "No se pudo borrar: " + r2.error.message, "error");
  cargarModelos();
}

// ---------- Inicio ----------
document.title = cfg.NOMBRE_APP;
$("#nombre-app").textContent = cfg.NOMBRE_APP;
$("#max-mb").textContent = cfg.MAX_MB;

if (!configurado) {
  $("#aviso-config").hidden = false;
} else {
  sb.auth.onAuthStateChange((evento, session) => {
    // Supabase recomienda no esperar otras llamadas dentro de este callback
    setTimeout(async () => {
      if (evento === "PASSWORD_RECOVERY") {
        const nueva = prompt("Escribe tu nueva contraseña (mínimo 6 caracteres):");
        if (nueva) {
          const { error } = await sb.auth.updateUser({ password: nueva });
          alert(error ? "No se pudo cambiar: " + error.message : "Contraseña actualizada.");
        }
      }
      cambiarSesion(session);
    }, 0);
  });
}
