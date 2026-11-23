# Visor AR · guía de instalación

Una app web para subir modelos 3D livianos (.glb), obtener un link y un QR, y verlos en realidad aumentada desde el celular.

- **Las páginas** (`index.html`, `ver.html`) se publican en GitHub Pages, como tu web.
- **Los modelos y las cuentas** se guardan en Supabase.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` + `app.js` | Entrar, subir modelos, ajustar la vista, obtener link y QR, ver y borrar modelos |
| `ver.html` | El visor público que abre el link (con botón de AR) |
| `comun.js` | Código compartido por las dos páginas |
| `config.js` | **Aquí van los datos de tu proyecto Supabase** |
| `estilos.css` | Apariencia |
| `supabase.sql` | Crea las tablas, permisos y el espacio de archivos en Supabase |

---

## Paso 1 · Crear el proyecto en Supabase

1. Entra a <https://supabase.com> → **Start your project** → inicia sesión con tu GitHub.
2. **New project**. Nombre: por ejemplo `visor-ar`. Región: **South America (São Paulo)**, la más cercana a Chile. Guarda la contraseña de la base de datos en un lugar seguro (casi nunca la vas a usar).
3. Espera un par de minutos a que se cree.

## Paso 2 · Preparar la base de datos

1. En el menú izquierdo: **SQL Editor** → **New query**.
2. Abre `supabase.sql`, copia todo, pégalo y presiona **Run**.
3. Debe decir *Success*. Esto crea la tabla de modelos, los permisos (cada persona maneja solo lo suyo y tú ves todo) y el espacio de archivos con un límite de 15 MB por modelo.

## Paso 3 · Conectar la app

1. En Supabase: **Project Settings** → **API** (o **API Keys**).
2. Copia la **Project URL** y la clave **anon** o **publishable**.
3. Abre `config.js` y reemplaza `TU-PROYECTO...` y `TU-CLAVE...` con esos datos.

> La clave anon/publishable puede quedar a la vista en la página: los permisos del paso 2 son los que protegen los datos. La clave **service_role / secret** nunca va en estos archivos.

## Paso 4 · Publicar en GitHub Pages

Tienes dos opciones:

- **Repositorio nuevo** (por ejemplo `visor-ar`): sube todos los archivos, ve a **Settings → Pages**, elige la rama `main` y la carpeta raíz. La app quedará en `https://TU-USUARIO.github.io/visor-ar/`.
- **Dentro de tu web**: copia la carpeta como `ar/` en el repositorio de sutilmetal.com. La app quedará en `https://sutilmetal.com/ar/`.

## Paso 5 · Decirle a Supabase dónde vive la app

En Supabase: **Authentication → URL Configuration**

- **Site URL**: la dirección del paso 4 (por ejemplo `https://sutilmetal.com/ar/`).
- **Redirect URLs**: agrega esa misma dirección.

Así los correos de confirmación y de "olvidé mi contraseña" llevan de vuelta a la app.

## Paso 6 · Quedar como administradora

1. Abre la app, toca **Crear cuenta** y regístrate con tu correo.
2. Vuelve a **SQL Editor** y ejecuta (con tu correo):

   ```sql
   update public.perfiles set es_admin = true where email = 'tu@correo.cl';
   ```

3. Recarga la app: junto a tu correo aparecerá "admin" y podrás marcar **Ver los modelos de todas las personas**.

---

## Antes de un taller: correos de confirmación

El servicio de correo que trae Supabase de fábrica envía **muy pocos correos por hora**. Si 20 estudiantes se registran a la vez, la mayoría no recibirá su confirmación. Dos soluciones:

- **Rápida:** **Authentication → Sign In / Providers → Email** → desactiva **Confirm email**. Las cuentas quedan activas al instante.
- **Más formal:** configurar un correo propio en **Authentication → Emails → SMTP Settings** (por ejemplo con Resend o Brevo, que tienen planes gratuitos).

**Códigos de taller:** pide a les estudiantes que escriban el mismo código al subir (por ejemplo `finis-2026`). Después filtras por ese código para ver todos los modelos del grupo.

## Límites del plan gratuito

- 1 GB de almacenamiento total (con modelos de 2 a 10 MB son entre 100 y 500 modelos).
- 5 GB de descarga al mes. Cada vez que alguien abre un modelo se descarga su archivo completo; un modelo de 5 MB visto 1.000 veces ocupa todo el mes.
- **Si el proyecto pasa una semana sin actividad, Supabase lo pausa.** Se reactiva con un clic desde el panel, pero mientras esté pausado los links no funcionan. Si vas a usar un QR en una exhibición, revísalo antes de la inauguración (o considera el plan pagado).

## Cómo hacer modelos livianos

- Apunta a **menos de 5 MB** y a lo sumo unos 100.000 polígonos.
- Texturas de 1024 × 1024 o 2048 × 2048 px como máximo.
- <https://gltf.report> permite comprimir un .glb en el navegador (Draco o Meshopt, y texturas en WebP).
- En Blender: *Decimate* para reducir polígonos y exportar como **glTF Binary (.glb)**.

## Qué se puede ver en cada dispositivo

- **Android** con Google Play Services for AR: AR con Scene Viewer o WebXR.
- **iPhone / iPad**: AR con Quick Look (model-viewer genera el formato de Apple automáticamente). Abre el link en Safari.
- **Computador**: vista 3D giratoria, sin AR.

## Ideas para siguientes versiones

- Editar los ajustes de un modelo ya publicado.
- Hotspots (anotaciones sobre el modelo) y animaciones.
- Página de galería pública por taller.
- Compresión automática al subir.
