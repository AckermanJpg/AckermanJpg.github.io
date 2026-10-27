(function () {
  try {
    var t = localStorage.getItem("kenny-theme");
    if (/^(cyber|pixel|fantasy|space|horror|anime)$/.test(t || "")) document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
