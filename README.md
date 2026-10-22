# Sitio personal de Kenny

Portafolio personal con 6 temas visuales (Neón Cyber, Arcade Pixel, Reino RPG, Estación Orbital, Survival Terror y Sakura Anime), conectado a GitHub, Google Analytics 4 y Search Console, con cabeceras de seguridad estrictas.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Todo el contenido de la página. Aquí editas textos, logros, gustos. |
| `css/styles.css` | Los 6 temas. Cada tema es un bloque `[data-theme="..."]` de variables. |
| `js/main.js` | Selector de temas, animaciones y carga automática de tus repos de GitHub. |
| `js/analytics.js` | Google Analytics 4, banner de cookies (Consent Mode v2) y Core Web Vitals. |
| `_headers` | Cabeceras de seguridad (CSP, HSTS, anti-clickjacking, etc.). |
| `.github/workflows/revisar.yml` | Revisión automática del código en cada actualización. |
| `robots.txt`, `sitemap.xml` | Ayudan a Google a encontrar e indexar tu sitio. |
| `.well-known/security.txt` | Dónde reportarte vulnerabilidades (estándar RFC 9116). |
| `404.html` | Página de error con estilo "Game Over". |

---

## Paso 1 · Subir el código a GitHub

1. Entra a <https://github.com/new> con tu cuenta **AckermanJpg**.
2. Nombre del repositorio: `kenny-web` (público o privado, ambos funcionan con Cloudflare).
3. **No** marques "Add a README".
4. En tu computadora, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primera versión del sitio"
git branch -M main
git remote add origin https://github.com/AckermanJpg/kenny-web.git
git push -u origin main
```

> Si prefieres no usar la terminal, instala **GitHub Desktop** y arrastra la carpeta.

## Paso 2 · Publicarlo con Cloudflare Pages (gratis)

Se usa Cloudflare en lugar de GitHub Pages porque GitHub Pages **no permite cabeceras de seguridad** (`_headers`), y Cloudflare además te da protección DDoS, HTTPS automático y firewall.

1. Crea cuenta en <https://dash.cloudflare.com>.
2. **Workers & Pages → Create → Pages → Connect to Git** → autoriza GitHub → elige `kenny-web`.
3. Configuración de build:
   - Framework preset: **None**
   - Build command: *(vacío)*
   - Build output directory: `/`
4. **Save and Deploy**. Tendrás una URL como `kenny-web.pages.dev`.
5. (Opcional) **Custom domains** → agrega tu dominio propio.

Después reemplaza `TU-DOMINIO.com` en `index.html`, `robots.txt`, `sitemap.xml` y `security.txt` por tu dominio real.

## Paso 3 · Conectar los servicios de Google

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
2. Elige **Dominio** y verifica con el registro **TXT** en el DNS de Cloudflare (recomendado),
   o elige **Prefijo de URL → Etiqueta HTML** y pega el código en la línea `google-site-verification` de `index.html`.
3. Envía el sitemap: **Sitemaps → `sitemap.xml`**.
4. En Analytics: **Administrar → Vínculos de Search Console** para ver búsquedas dentro de GA4.

### Otras herramientas de medición (no requieren código)
- **PageSpeed Insights** <https://pagespeed.web.dev> – auditoría de velocidad.
- **Looker Studio** <https://lookerstudio.google.com> – tableros con datos de GA4 y Search Console.
- **Tag Assistant** <https://tagassistant.google.com> – comprueba que GA4 está recibiendo datos.

> **Google Tag Manager**: no viene activado porque su código es inline y obligaría a relajar la CSP. Si en el futuro lo necesitas, conviene usar Cloudflare Workers para generar un *nonce* por visita.

---

## Seguridad: qué está cubierto

Un sitio 100% invulnerable no existe, pero este diseño elimina la mayoría de las superficies de ataque:

| Riesgo | Protección |
|---|---|
| Hackeo de servidor / base de datos | Sitio estático: no hay servidor, base de datos ni login que atacar. |
| DDoS | Red de Cloudflare. |
| XSS (inyección de scripts) | CSP estricta sin `unsafe-inline`; los datos de GitHub se insertan con `textContent`, nunca con `innerHTML`. |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'`. |
| Robo de tráfico / HTTP | HSTS + `upgrade-insecure-requests`. |
| Fuga de datos de visitantes | Consent Mode v2: GA no guarda cookies si no aceptan. |
| Errores al actualizar | GitHub Actions revisa el HTML, scripts inline y claves expuestas en cada cambio. |

**Recomendaciones extra:**
- Activa **2FA** en GitHub, Cloudflare y Google. Es la protección más importante: si alguien entra a tu GitHub, puede cambiar tu sitio.
- En Cloudflare: **Security → Bots → Bot Fight Mode: On** y **SSL/TLS → Full (strict)**.
- Revisa tu calificación en <https://securityheaders.com> y <https://observatory.mozilla.org> (debería salir A o A+).
- Nunca subas contraseñas ni claves al repositorio.

---

## Cómo actualizar y corregir errores

Cada cambio que subes a GitHub se publica solo en 1–2 minutos.

```bash
# 1. Edita los archivos
# 2. Sube el cambio
git add .
git commit -m "Corrijo texto de logros"
git push
```

**Probar antes de publicar:** crea una rama, y Cloudflare te da una URL de vista previa sin tocar la versión real.

```bash
git checkout -b prueba-nuevo-tema
# ...cambios...
git push -u origin prueba-nuevo-tema   # → URL de preview en Cloudflare
```

Cuando esté bien, en GitHub haz **Pull request → Merge** a `main`.

**Si algo se rompe:** en Cloudflare Pages → **Deployments** → elige una versión anterior → **Rollback**. O desde la terminal:

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
