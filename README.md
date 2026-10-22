# Sitio personal de Kenny

Portafolio personal con 6 temas visuales (Neón Cyber, Arcade Pixel, Reino RPG, Estación Orbital, Survival Terror y Sakura Anime), publicado en GitHub Pages (https://ackermanjpg.github.io), conectado a Google Analytics 4 y Search Console, con cabeceras de seguridad estrictas.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Todo el contenido de la página. Aquí editas textos, logros, gustos. |
| `css/styles.css` | Los 6 temas. Cada tema es un bloque `[data-theme="..."]` de variables. |
| `js/main.js` | Selector de temas, animaciones y carga automática de tus repos de GitHub. |
| `js/analytics.js` | Google Analytics 4, banner de cookies (Consent Mode v2) y Core Web Vitals. |
| `.github/workflows/revisar.yml` | Revisa el código y publica en GitHub Pages en cada actualización. |
| `robots.txt`, `sitemap.xml` | Ayudan a Google a encontrar e indexar tu sitio. |
| `.well-known/security.txt` | Dónde reportarte vulnerabilidades (estándar RFC 9116). |
| `404.html` | Página de error con estilo "Game Over". |

---

## Paso 1 · Crear el repositorio en GitHub

1. Entra a <https://github.com/new> con tu cuenta **AckermanJpg**.
2. Nombre del repositorio, exactamente: **`AckermanJpg.github.io`**
   (con ese nombre tu sitio queda en `https://ackermanjpg.github.io`, sin nada extra en la URL).
3. Visibilidad: **Public** (GitHub Pages gratis requiere repositorio público).
4. **No** marques "Add a README". Clic en **Create repository**.

## Paso 2 · Subir el código

Descomprime `kenny-web.zip` y, dentro de la carpeta `kenny-web`, abre una terminal:

```bash
git init
git add .
git commit -m "Primera versión del sitio"
git branch -M main
git remote add origin https://github.com/AckermanJpg/AckermanJpg.github.io.git
git push -u origin main
```

> Sin terminal: instala **GitHub Desktop**, elige *File → Add local repository*, selecciona la carpeta y presiona **Publish**.
> No subas los archivos arrastrándolos a la web de GitHub: las carpetas ocultas `.github` y `.well-known` suelen quedarse fuera.

## Paso 3 · Activar GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En **Build and deployment → Source**, elige **GitHub Actions**.
3. Ve a la pestaña **Actions**: verás el flujo *Revisar y publicar*. Cuando tenga ✅ verde, tu sitio ya está en línea en <https://ackermanjpg.github.io>.
4. En **Settings → Pages**, marca **Enforce HTTPS** (normalmente ya viene activado).

## Paso 4 · Conectar los servicios de Google

### Google Analytics 4
1. <https://analytics.google.com> → **Administrar → Crear propiedad**.
2. Crea un **flujo de datos web** con la URL de tu sitio.
3. Copia el **ID de medición** (`G-XXXXXXXXXX`).
4. Pégalo en `js/analytics.js` en la línea `var GA_MEASUREMENT_ID = "..."`.

Eventos que ya se envían automáticamente:
- `theme_change` – qué tema eligen tus visitantes
- `section_view` – qué secciones leen
- `cta_click` – clics en botones, GitHub, LinkedIn, correo y repos
- `LCP`, `CLS`, `INP` – velocidad real de carga (Core Web Vitals)

Para verlos como columnas en los informes: **Administrar → Definiciones personalizadas** → crea las dimensiones `theme`, `section` y `label`.

### Google Search Console
1. <https://search.google.com/search-console> → **Agregar propiedad**.
2. Elige **Prefijo de URL** y escribe `https://ackermanjpg.github.io/`.
3. Método **Etiqueta HTML**: copia solo el valor de `content="..."` y pégalo en la línea `google-site-verification` de `index.html`. Sube el cambio, espera el ✅ en Actions y presiona **Verificar**.
4. Envía el sitemap: **Sitemaps → `sitemap.xml`**.
5. En Analytics: **Administrar → Vínculos de Search Console** para ver búsquedas dentro de GA4.

### Otras herramientas de medición (no requieren código)
- **PageSpeed Insights** <https://pagespeed.web.dev> – auditoría de velocidad.
- **Looker Studio** <https://lookerstudio.google.com> – tableros con datos de GA4 y Search Console.
- **Tag Assistant** <https://tagassistant.google.com> – comprueba que GA4 está recibiendo datos.

> **Google Tag Manager**: no viene activado porque su código es inline y obligaría a relajar la CSP. GA4 directo cubre lo mismo para un sitio personal.

---

## Seguridad: qué está cubierto

Un sitio 100% invulnerable no existe, pero este diseño elimina la mayoría de las superficies de ataque:

| Riesgo | Protección |
|---|---|
| Hackeo de servidor / base de datos | Sitio estático: no hay servidor, base de datos ni login que atacar. |
| DDoS | Infraestructura y CDN de GitHub Pages. |
| XSS (inyección de scripts) | CSP estricta en `<meta>` sin `unsafe-inline`; los datos de GitHub se insertan con `textContent`, nunca con `innerHTML`. |
| Clickjacking | Script que saca al sitio de cualquier iframe ajeno (`js/main.js`). |
| Robo de tráfico / HTTP | HTTPS forzado por GitHub Pages (con HSTS) + `upgrade-insecure-requests`. |
| Fuga de datos de visitantes | Consent Mode v2: GA no guarda cookies si no aceptan. |
| Errores al actualizar | GitHub Actions revisa el código y **solo publica si todo pasa**. |

**Recomendaciones extra:**
- Activa **2FA** en GitHub y Google. Es la protección más importante: con tu cuenta de GitHub, cualquiera podría cambiar tu sitio.
- En el repo: **Settings → Branches → Add rule** para `main` con *Require status checks to pass* (así nada se publica sin pasar la revisión).
- En **Settings → Code security** activa *Dependabot alerts* y *Secret scanning*.
- Revisa tu sitio en <https://observatory.mozilla.org>.
- Limitación conocida de GitHub Pages: no permite cabeceras HTTP propias, por eso la CSP va en `<meta>`. Si algún día compras un dominio, puedes ponerle Cloudflare delante (gratis) y sumar cabeceras completas sin mover el código.
- Nunca subas contraseñas ni claves al repositorio.

---

## Cómo actualizar y corregir errores

Cada cambio que subes a `main` se revisa y, si pasa, se publica solo en 1–2 minutos.

```bash
# 1. Edita los archivos
# 2. Sube el cambio
git add .
git commit -m "Corrijo texto de logros"
git push
```

**Probar antes de publicar:** trabaja en una rama. GitHub revisa el código pero **no publica** hasta que la unas a `main`. Para verla en tu PC abre `index.html` directamente o ejecuta `python -m http.server` en la carpeta y entra a `http://localhost:8000`.

```bash
git checkout -b prueba-nuevo-tema
# ...cambios...
git push -u origin prueba-nuevo-tema
```

Cuando esté bien, en GitHub haz **Pull request → Merge** a `main`.

**Si algo se rompe:** deshaz el último cambio y se vuelve a publicar la versión anterior:

```bash
git revert HEAD
git push
```

### Ediciones comunes
- **Cambiar porcentaje de una habilidad:** busca `data-fill="70"` y cambia el número.
- **Agregar un logro:** copia un bloque `<li class="achv panel unlocked">` en la sección Logros.
- **Desbloquear un logro:** cambia `locked` por `unlocked` y el 🔒 por un emoji.
- **Agregar juegos o series:** edita las listas de la sección Inventario.
- **Nuevo repositorio:** no hace falta tocar nada; aparece solo en la sección Misiones.
- **Tema por defecto:** cambia `data-theme="cyber"` en la etiqueta `<html>`.
