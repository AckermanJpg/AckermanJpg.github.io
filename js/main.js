(function () {
  "use strict";

  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.hidden = true; }
  }

  var THEMES = ["cyber", "pixel", "fantasy", "space", "horror", "anime"];
  var STORAGE_KEY = "kenny-theme";
  var root = document.documentElement;

  function track(name, params) {
    if (typeof window.kTrack === "function") window.kTrack(name, params || {});
  }

  function readTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveTheme(t) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) {}
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
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  function setPanel(open) {
    if (!panel || !toggle) return;
    if (open) setNav(false);
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }
  function setNav(open) {
    if (!nav || !navToggle) return;
    if (open) setPanel(false);
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }
  if (toggle) toggle.addEventListener("click", function () { setPanel(panel.hidden); });
  if (navToggle) navToggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  if (nav) nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
  document.querySelectorAll("[data-set-theme]").forEach(function (b) {
    b.addEventListener("click", function () {
      applyTheme(b.getAttribute("data-set-theme"), true);
      setPanel(false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (nav && nav.classList.contains("is-open")) { setNav(false); navToggle.focus(); }
    setPanel(false);
  });
  document.addEventListener("click", function (e) {
    if (panel && !panel.hidden && !panel.contains(e.target) && !toggle.contains(e.target)) setPanel(false);
    if (nav && nav.classList.contains("is-open") && !nav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
  });

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

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-track]");
    if (a) track("cta_click", { label: a.getAttribute("data-track") });
  });

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  var box = document.getElementById("repos");
  if (box) loadRepos(box);

  function loadRepos(container) {
    var user = container.getAttribute("data-github-user");
    if (!/^[A-Za-z0-9-]{1,39}$/.test(user || "")) return;
    var status = container.querySelector(".repos-status");
    var hidden = (container.getAttribute("data-hide") || "").toLowerCase().split(/\s+/);

    fetch("https://api.github.com/users/" + user + "/repos?sort=updated&per_page=100", {
      headers: { Accept: "application/vnd.github+json" },
      referrerPolicy: "no-referrer"
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (repos) {
        if (!Array.isArray(repos)) throw new Error("formato");
        repos = repos.filter(function (r) { return !r.fork && hidden.indexOf(String(r.name).toLowerCase()) === -1; }).slice(0, 6);
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

  var logBox = document.getElementById("bitacora-lista");
  if (logBox) loadLog(logBox);

  function loadLog(container) {
    var status = container.querySelector(".log-status");
    function fail() {
      if (status) status.textContent = "No se pudo cargar la bitácora por ahora.";
    }

    fetch("data/bitacora.json", { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (items) {
        if (!Array.isArray(items)) throw new Error("formato");
        items = items.filter(validLogItem).sort(function (a, b) {
          return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0;
        }).slice(0, 6);
        if (!items.length) {
          if (status) status.textContent = "Aún no hay entradas en la bitácora.";
          return;
        }
        var list = document.createElement("ol");
        list.className = "log";
        items.forEach(function (it) { list.appendChild(logItem(it)); });
        container.replaceChildren(list);
      })
      .catch(fail);
  }

  var LOG_PROJECTS = ["Moonlight Studio", "Eco del Vacío", "Página web", "Canal de YouTube", "Otro"];

  function validLogItem(it) {
    if (!it || typeof it !== "object") return false;
    if (typeof it.titulo !== "string" || !it.titulo.trim()) return false;
    if (typeof it.texto !== "string" || !it.texto.trim()) return false;
    if (typeof it.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(it.fecha)) return false;
    return !isNaN(logDate(it.fecha));
  }

  function logDate(iso) {
    var p = iso.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function logImagePath(path) {
    if (typeof path !== "string") return null;
    var clean = path.replace(/^\//, "");
    if (clean.indexOf("img/bitacora/") !== 0 || clean.indexOf("..") !== -1 || /[?#\\:]/.test(clean)) return null;
    return clean;
  }

  function logItem(it) {
    var li = document.createElement("li");
    li.className = "log-item";
    var card = document.createElement("article");
    card.className = "log-card panel";

    var meta = document.createElement("p");
    meta.className = "log-meta";
    var time = document.createElement("time");
    time.className = "log-date";
    time.setAttribute("datetime", it.fecha);
    time.textContent = logDate(it.fecha).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" });
    meta.appendChild(time);
    meta.appendChild(textEl("span", LOG_PROJECTS.indexOf(it.proyecto) === -1 ? "Otro" : it.proyecto, "log-project"));
    card.appendChild(meta);

    card.appendChild(textEl("h3", it.titulo.trim(), "log-title"));
    card.appendChild(textEl("p", it.texto.trim(), "log-text"));

    var src = logImagePath(it.imagen);
    if (src) {
      var img = document.createElement("img");
      img.className = "log-img";
      img.src = src;
      img.alt = "Imagen de la entrada: " + it.titulo.trim();
      img.loading = "lazy";
      img.decoding = "async";
      card.appendChild(img);
    }

    li.appendChild(card);
    return li;
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
