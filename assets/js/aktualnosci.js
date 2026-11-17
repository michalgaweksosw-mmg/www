/* SOSW Ostrołęka — wyświetlanie aktualności (dane w aktualnosci-dane.js) */
(function () {
  "use strict";
  var WPISY = (window.SOSW_AKTUALNOSCI || []).slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });
  var JEDN = window.SOSW_JEDNOSTKI || {
    osrodek:     { nazwa: "Ośrodek",                          kolor: "#1d5a3b" },
    przedszkole: { nazwa: "Przedszkole",                      kolor: "#f2b705" },
    sp:          { nazwa: "Szkoła Podstawowa",                kolor: "#2e7a50" },
    branzowa:    { nazwa: "Szkoła Branżowa",                  kolor: "#c4303a" },
    spdp:        { nazwa: "Szkoła Przysposabiająca do Pracy", kolor: "#2c5fc4" },
    internat:    { nazwa: "Internat",                         kolor: "#6d48a6" }
  };
  var MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
  var MIES_KROTKO = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function czesci(d) { var p = d.split("-"); return { r: p[0], m: parseInt(p[1], 10) - 1, d: parseInt(p[2], 10) }; }
  function dataDluga(d) { var c = czesci(d); return c.d + " " + MIESIACE[c.m] + " " + c.r; }
  function jednostka(w) { return JEDN[w.jednostka] || JEDN.osrodek || { nazwa: "Ośrodek", kolor: "#1d5a3b" }; }
  function link(w) { return "aktualnosc.html?wpis=" + encodeURIComponent(w.id); }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }

  /* Okładka w stylu wycinanki — gdy wpis nie ma zdjęcia */
  /* Paleta „papierów”: tło, kolor wycinanki, akcent, środek */
  var PAPIERY = [
    ["#1d5a3b", "#2e7a50", "#f2b705", "#c4303a"],
    ["#2c5fc4", "#4b7bd8", "#f2b705", "#ffffff"],
    ["#c4303a", "#d9545c", "#f2b705", "#1b2340"],
    ["#f2b705", "#f7cd4a", "#c4303a", "#1d5a3b"],
    ["#6d48a6", "#8565b8", "#f2b705", "#ffffff"],
    ["#1b2340", "#2b3762", "#f2b705", "#c4303a"]
  ];
  function rozeta(cx, cy, s, c1, c2, c3, c4) {
    var o = "";
    for (var i = 0; i < 8; i++) o += '<ellipse cx="' + cx + '" cy="' + (cy - 44 * s) + '" rx="' + 13 * s + '" ry="' + 28 * s + '" fill="' + c1 + '" transform="rotate(' + i * 45 + " " + cx + " " + cy + ')"/>';
    for (var k = 0; k < 8; k++) o += '<circle cx="' + cx + '" cy="' + (cy - 58 * s) + '" r="' + 3 * s + '" fill="' + c4 + '" transform="rotate(' + k * 45 + " " + cx + " " + cy + ')"/>';
    return o + '<circle cx="' + cx + '" cy="' + cy + '" r="' + 26 * s + '" fill="' + c2 + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + 15 * s + '" fill="' + c3 + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + 6 * s + '" fill="' + c2 + '"/>';
  }
  function tulipan(cx, cy, s, c1, c2) {
    return '<g transform="translate(' + cx + " " + cy + ") scale(" + s + ')"><path d="M0 0 V70" stroke="' + c1 + '" stroke-width="6"/>' +
      '<path d="M0 50 C-20 40 -34 20 -36 4 C-18 12 -4 28 0 44Z M0 60 C20 50 34 30 36 14 C18 22 4 38 0 54Z" fill="' + c1 + '"/>' +
      '<path d="M-22 -4 C-24 -30 -12 -40 0 -28 C12 -40 24 -30 22 -4 C14 10 -14 10 -22 -4Z" fill="' + c2 + '"/></g>';
  }
  function okladkaSvg(w) {
    var h = hash(w.id), p = PAPIERY[h % PAPIERY.length], wariant = (h >> 4) % 3;
    var tlo = p[0], wyc = p[1], akc = p[2], sr = p[3];
    var motyw;
    if (wariant === 0) {
      motyw = rozeta(200, 118, 1.35, wyc, akc, sr, tlo === "#f2b705" ? "#fff" : "#ffffff") +
        tulipan(70, 120, 1.1, wyc, akc) + tulipan(330, 120, 1.1, wyc, akc);
    } else if (wariant === 1) {
      motyw = rozeta(90 + (h % 60), 90, 1.0, wyc, akc, sr, "#fff") + rozeta(300, 170, .8, wyc, sr, akc, "#fff") +
        tulipan(210, 150, .9, wyc, akc);
    } else {
      motyw = "";
      for (var i = 0; i < 5; i++) motyw += tulipan(40 + i * 80, 110 + (i % 2) * 30, .95, wyc, i % 2 ? sr : akc);
      motyw += rozeta(200, 30, .55, akc, wyc, sr, "#fff");
    }
    return '<svg class="wzor" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<rect width="400" height="250" fill="' + tlo + '"/>' + motyw +
      '<path d="M0 250 V232' + " q10 -12 20 0".repeat(20) + 'V250Z" fill="' + wyc + '"/>' +
      "</svg>";
  }
  function okladka(w, duza) {
    var j = jednostka(w);
    if (w.zdjecie) {
      var src = duza ? w.zdjecie : (w.miniatura || w.zdjecie);
      return '<div class="okladka" style="--k:' + j.kolor + '"><img src="' + esc(src) + '" alt="' + esc(w.opisZdjecia || "") + '"' + (duza ? "" : ' loading="lazy"') + ' decoding="async"></div>';
    }
    return '<div class="okladka" style="--k:' + j.kolor + '">' + okladkaSvg(w) + "</div>";
  }
  function meta(w) {
    var j = jednostka(w);
    return '<p class="data"><time datetime="' + esc(w.data) + '">' + dataDluga(w.data) + '</time><span class="etykieta"><span class="kropka" style="--k:' + j.kolor + '" aria-hidden="true"></span>' + esc(j.nazwa) + "</span></p>";
  }
  function pozycjaListy(w) {
    var c = czesci(w.data), j = jednostka(w);
    return '<li><a href="' + link(w) + '"><span class="kalendarzyk" style="--k:' + j.kolor + '" aria-hidden="true"><b>' + c.d + "</b><small>" + MIES_KROTKO[c.m] + " " + c.r + '</small></span><span><span class="wizualnie-ukryte">' + dataDluga(w.data) + ", " + esc(j.nazwa) + ": </span><h3>" + esc(w.tytul) + "</h3><p>" + esc(w.zajawka) + "</p></span></a></li>";
  }

  /* Udostępnione dla panelu administratora (podgląd) */
  window.SOSW_AKT = { okladka: okladka, meta: meta, jednostki: JEDN };

  /* --- Strona główna --- */
  var glowna = document.getElementById("aktualnosci-glowna");
  if (glowna && WPISY.length) {
    var pierwszy = WPISY[0];
    glowna.innerHTML =
      '<a class="wpis-wyrozniony" href="' + link(pierwszy) + '">' + okladka(pierwszy) + meta(pierwszy) + "<h3>" + esc(pierwszy.tytul) + "</h3><p>" + esc(pierwszy.zajawka) + "</p></a>" +
      '<ul class="lista-wpisow">' + WPISY.slice(1, 5).map(pozycjaListy).join("") + "</ul>";
  }

  /* --- Lista z filtrami --- */
  var lista = document.getElementById("aktualnosci-lista");
  if (lista) {
    var filtry = document.getElementById("filtry");
    var obecne = {};
    WPISY.forEach(function (w) { obecne[w.jednostka] = true; });
    var przyciski = '<li><button type="button" data-filtr="" aria-pressed="true">Wszystkie</button></li>';
    Object.keys(JEDN).forEach(function (k) {
      if (!obecne[k]) return;
      przyciski += '<li><button type="button" data-filtr="' + k + '" aria-pressed="false"><span class="kropka" style="--k:' + JEDN[k].kolor + '" aria-hidden="true"></span>' + esc(JEDN[k].nazwa) + "</button></li>";
    });
    filtry.innerHTML = przyciski;
    var komunikat = document.getElementById("aktualnosci-komunikat");

    function pokaz(filtr) {
      var wybrane = WPISY.filter(function (w) { return !filtr || w.jednostka === filtr; });
      lista.innerHTML = wybrane.map(function (w) {
        return '<li><a href="' + link(w) + '">' + okladka(w) + meta(w) + "<h3>" + esc(w.tytul) + "</h3><p>" + esc(w.zajawka) + "</p></a></li>";
      }).join("");
      komunikat.textContent = wybrane.length ? "Wyświetlono wpisy: " + wybrane.length : "";
      if (!wybrane.length) lista.innerHTML = '<li class="brak-wynikow">Brak wpisów w tej kategorii. Wybierz „Wszystkie”, aby zobaczyć pozostałe aktualności.</li>';
    }
    filtry.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      filtry.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      pokaz(b.dataset.filtr);
    });
    pokaz("");
  }

  /* --- Pojedynczy wpis --- */
  var wpisEl = document.getElementById("wpis");
  if (wpisEl) {
    var id = new URLSearchParams(location.search).get("wpis");
    var w = WPISY.filter(function (x) { return x.id === id; })[0];
    var tytulEl = document.getElementById("wpis-tytul");
    if (!w) {
      tytulEl.textContent = "Nie znaleziono wpisu";
      wpisEl.innerHTML = '<p>Ten wpis nie istnieje albo zmienił adres. Wszystkie wpisy znajdziesz na stronie <a href="aktualnosci.html">Aktualności</a>.</p>';
      return;
    }
    document.title = w.tytul + " — Aktualności — SOSW w Ostrołęce";
    tytulEl.textContent = w.tytul;
    document.getElementById("wpis-meta").innerHTML = meta(w);
    var tresc = (w.tresc || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var galeria = (w.galeria || []).length
      ? '<h2 class="wizualnie-ukryte">Galeria zdjęć</h2><ul class="wpis__galeria">' + w.galeria.map(function (z) { return '<li><a href="' + esc(z.src) + '"><img src="' + esc(z.min || z.src) + '" alt="' + esc(z.alt || "") + '" loading="lazy" decoding="async"></a></li>'; }).join("") + "</ul>"
      : "";
    var idx = WPISY.indexOf(w);
    var nawig = '<nav aria-label="Inne wpisy" class="rekrutacja-pas__akcje">' +
      (WPISY[idx + 1] ? '<a class="btn btn--obrys" href="' + link(WPISY[idx + 1]) + '">Starszy wpis: ' + esc(WPISY[idx + 1].tytul) + "</a>" : "") +
      '<a class="btn btn--glowny" href="aktualnosci.html">Wszystkie aktualności</a></nav>';
    wpisEl.innerHTML = okladka(w, true) + tresc + galeria + nawig;
  }
})();
