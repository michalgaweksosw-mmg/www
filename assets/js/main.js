/* SOSW Ostrołęka — skrypty ogólne: menu, ułatwienia dostępu, mapa, przycisk „do góry” */
(function () {
  "use strict";

  /* ---------- Pamięć ustawień (localStorage może być niedostępny) ---------- */
  var KLUCZ = "sosw-ulatwienia";
  function wczytaj() { try { return JSON.parse(localStorage.getItem(KLUCZ)) || {}; } catch (e) { return {}; } }
  function zapisz(u) { try { localStorage.setItem(KLUCZ, JSON.stringify(u)); } catch (e) { /* trudno */ } }

  var ustawienia = wczytaj();
  var body = document.body;
  var SKALE = { "1": 1, "2": 1.15, "3": 1.3 };
  var TRYBY = ["kontrast", "podkresl-linki", "odstepy", "bez-animacji"];

  function zastosuj() {
    document.documentElement.style.setProperty("--skala", SKALE[ustawienia.skala || "1"]);
    TRYBY.forEach(function (t) { body.classList.toggle(t, !!ustawienia[t]); });
    document.querySelectorAll("[data-skala]").forEach(function (b) {
      b.setAttribute("aria-pressed", String((ustawienia.skala || "1") === b.dataset.skala));
    });
    document.querySelectorAll("[data-tryb]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(!!ustawienia[b.dataset.tryb]));
    });
  }
  zastosuj();

  var panel = document.getElementById("ulatwienia");
  var przycisk = document.querySelector(".przycisk-ulatwien");
  function pokazPanel(pokaz) {
    if (!panel) return;
    panel.hidden = !pokaz;
    przycisk.setAttribute("aria-expanded", String(pokaz));
    if (pokaz) panel.querySelector("button").focus(); else przycisk.focus();
  }
  if (panel && przycisk) {
    przycisk.addEventListener("click", function () { pokazPanel(panel.hidden); });
    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.skala) { ustawienia.skala = b.dataset.skala; }
      else if (b.dataset.tryb) { ustawienia[b.dataset.tryb] = !ustawienia[b.dataset.tryb]; }
      else if (b.hasAttribute("data-reset")) { ustawienia = {}; }
      else if (b.hasAttribute("data-zamknij")) { pokazPanel(false); return; }
      zapisz(ustawienia); zastosuj();
    });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") pokazPanel(false); });
  }

  /* ---------- Podmenu ---------- */
  var rozwijane = document.querySelectorAll(".menu__rozwin");
  function zamknijPodmenu(wyjatek) {
    rozwijane.forEach(function (b) {
      if (b === wyjatek) return;
      b.setAttribute("aria-expanded", "false");
      var p = document.getElementById(b.getAttribute("aria-controls"));
      if (p) p.hidden = true;
    });
  }
  rozwijane.forEach(function (b) {
    b.addEventListener("click", function () {
      var otwarte = b.getAttribute("aria-expanded") === "true";
      zamknijPodmenu(b);
      b.setAttribute("aria-expanded", String(!otwarte));
      document.getElementById(b.getAttribute("aria-controls")).hidden = otwarte;
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".menu > li")) zamknijPodmenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var otwarty = document.querySelector('.menu__rozwin[aria-expanded="true"]');
    if (otwarty) { zamknijPodmenu(); otwarty.focus(); }
  });

  /* ---------- Menu mobilne ---------- */
  var nav = document.getElementById("nawigacja");
  var toggle = document.querySelector(".menu-toggle");
  var zamknij = document.querySelector(".nawigacja__zamknij");
  var tlo = document.querySelector(".tlo-menu");
  function menuMobilne(otworz) {
    nav.classList.toggle("jest-otwarta", otworz);
    toggle.setAttribute("aria-expanded", String(otworz));
    tlo.hidden = !otworz;
    document.documentElement.style.overflow = otworz ? "hidden" : "";
    if (otworz) zamknij.focus(); else toggle.focus();
  }
  if (nav && toggle) {
    toggle.addEventListener("click", function () { menuMobilne(true); });
    zamknij.addEventListener("click", function () { menuMobilne(false); });
    tlo.addEventListener("click", function () { menuMobilne(false); });
    nav.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("jest-otwarta")) menuMobilne(false);
    });
  }

  /* ---------- Mapa — ładowana dopiero po kliknięciu (prywatność) ---------- */
  document.querySelectorAll("[data-mapa]").forEach(function (b) {
    b.addEventListener("click", function () {
      var kontener = b.closest(".mapa");
      var iframe = document.createElement("iframe");
      iframe.src = b.dataset.mapa;
      iframe.title = "Mapa dojazdu do Ośrodka, ul. gen. Romualda Traugutta 9 w Ostrołęce";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      kontener.innerHTML = "";
      kontener.appendChild(iframe);
      iframe.focus();
    });
  });

  /* ---------- Do góry ---------- */
  var gora = document.querySelector(".do-gory");
  if (gora) {
    window.addEventListener("scroll", function () { gora.classList.toggle("widoczny", window.scrollY > 900); }, { passive: true });
    gora.addEventListener("click", function () { window.scrollTo({ top: 0 }); document.getElementById("tresc").focus({ preventScroll: true }); });
  }
})();
