/* =========================================================
   Interacción del sitio: temas, animaciones y repos de GitHub.
   Regla de seguridad: nunca se usa innerHTML con datos externos;
   todo se inserta con textContent para evitar XSS.
   ========================================================= */
(function () {
  "use strict";

  // Anti-clickjacking: si alguien mete el sitio dentro de un iframe ajeno, se sale de él.
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.hidden = true; }
  }

  var THEMES = ["cyber", "pixel", "fantasy", "space", "horror", "anime"];
  var STORAGE_KEY = "kenny-theme";
  var root = document.documentElement;

  function track(name, params) {
    if (typeof window.kTrack === "function") window.kTrack(name, params || {});
  }

  /* ---------- Temas ---------- */
  function readTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveTheme(t) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) { /* modo privado */ }
  }
  function applyTheme(t, fromUser) {
    if (THEMES.indexOf(t) === -1) t = "cyber";
    root.setAttribute("data-theme", t);
    document.querySelectorAll("[data-set-theme]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-theme") === t));
    });
    if (fromUser) { saveTheme(t); track("theme_change", { theme: t }); }
  }
  applyTheme(readTheme() || "cyber", false);

  var toggle = document.querySelector(".theme-toggle");
  var panel = document.getElementById("theme-panel");
  function setPanel(open) {
    if (!panel || !toggle) return;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }
  if (toggle) toggle.addEventListener("click", function () { setPanel(panel.hidden); });
  document.querySelectorAll("[data-set-theme]").forEach(function (b) {
    b.addEventListener("click", function () {
      applyTheme(b.getAttribute("data-set-theme"), true);
      setPanel(false);
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setPanel(false); });
  document.addEventListener("click", function (e) {
    if (panel && !panel.hidden && !panel.contains(e.target) && !toggle.contains(e.target)) setPanel(false);
  });

  /* ---------- Barras de habilidad y aparición al hacer scroll ---------- */
  function fillBar(el) {
    var v = parseInt(el.getAttribute("data-fill"), 10);
    if (!isNaN(v)) el.style.width = Math.max(0, Math.min(100, v)) + "%";
  }
  var revealTargets = document.querySelectorAll(".section, .stat-card");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        en.target.querySelectorAll(".bar-fill").forEach(fillBar);
        if (en.target.id) track("section_view", { section: en.target.id });
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  } else {
    document.querySelectorAll(".bar-fill").forEach(fillBar);
  }

  /* ---------- Clics rastreables (botones y enlaces externos) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-track]");
    if (a) track("cta_click", { label: a.getAttribute("data-track") });
  });

  /* ---------- Año del footer ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Repositorios de GitHub ---------- */
  var box = document.getElementById("repos");
  if (box) loadRepos(box);

  function loadRepos(container) {
    var user = container.getAttribute("data-github-user");
    if (!/^[A-Za-z0-9-]{1,39}$/.test(user || "")) return;
    var status = container.querySelector(".repos-status");

    fetch("https://api.github.com/users/" + user + "/repos?sort=updated&per_page=6", {
      headers: { Accept: "application/vnd.github+json" },
      referrerPolicy: "no-referrer"
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (repos) {
        if (!Array.isArray(repos)) throw new Error("formato");
        repos = repos.filter(function (r) { return !r.fork; });
        if (status) status.remove();
        if (!repos.length) {
          container.appendChild(textEl("p", "Pronto habrá repositorios aquí.", "muted"));
          return;
        }
        repos.forEach(function (r) { container.appendChild(repoCard(r)); });
      })
      .catch(function () {
        if (status) status.textContent = "No se pudieron cargar los repositorios. Míralos directo en GitHub.";
      });
  }

  function textEl(tag, text, cls) {
    var el = document.createElement(tag);
    el.textContent = text;
    if (cls) el.className = cls;
    return el;
  }

  function repoCard(r) {
    var a = document.createElement("a");
    a.className = "repo panel";
    // Solo se aceptan URLs de github.com
    var url = String(r.html_url || "");
    a.href = /^https:\/\/github\.com\//.test(url) ? url : "https://github.com/";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("data-track", "repo_" + String(r.name || "").slice(0, 40));

    a.appendChild(textEl("h4", String(r.name || "repositorio")));
    a.appendChild(textEl("p", String(r.description || "Sin descripción todavía.")));

    var meta = document.createElement("div");
    meta.className = "repo-meta";
    if (r.language) meta.appendChild(textEl("span", "◆ " + String(r.language)));
    meta.appendChild(textEl("span", "★ " + Number(r.stargazers_count || 0)));
    if (r.updated_at) {
      var d = new Date(r.updated_at);
      if (!isNaN(d)) meta.appendChild(textEl("span", d.toLocaleDateString("es-GT", { year: "numeric", month: "short" })));
    }
    a.appendChild(meta);
    return a;
  }
})();
