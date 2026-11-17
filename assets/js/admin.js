/* ==========================================================================
   Panel administratora strony SOSW
   - logowanie loginem i hasłem: hasło odszyfrowuje w przeglądarce token GitHub
     zapisany w assets/js/admin-config.js (AES-GCM, klucz z hasła: PBKDF2-SHA256)
   - dodawanie / edycja / usuwanie aktualności
   - biblioteka zdjęć
   - automatyczna konwersja JPEG/PNG → WebP (w przeglądarce, bez wysyłania gdziekolwiek)
   Każdy zapis = jeden commit w repozytorium (Git Data API).
   ========================================================================== */
(function () {
  "use strict";

  var API = "https://api.github.com";
  var PLIK_DANYCH = "assets/js/aktualnosci-dane.js";
  var KATALOG_ZDJEC = "assets/img/aktualnosci";
  var ZNACZNIK_START = "/*DANE-START*/";
  var ZNACZNIK_KONIEC = "/*DANE-KONIEC*/";
  var DOMYSLNE_UST = { bok: 1920, jakosc: 82, min: 800 };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- pamięć przeglądarki ---------------- */
  function czytaj(magazyn, klucz) { try { return window[magazyn].getItem(klucz); } catch (e) { return null; } }
  function pisz(magazyn, klucz, wartosc) { try { if (wartosc == null) window[magazyn].removeItem(klucz); else window[magazyn].setItem(klucz, wartosc); } catch (e) { /* tryb prywatny */ } }
  function czytajJSON(klucz, dom) { try { return JSON.parse(czytaj("localStorage", klucz)) || dom; } catch (e) { return dom; } }

  /* ---------------- stan ---------------- */
  var wykryte = wykryjRepo();
  var KONFIG = window.SOSW_PANEL || { konta: [] };
  if (!Array.isArray(KONFIG.konta)) KONFIG.konta = [];
  var PLIK_KONFIGURACJI = "assets/js/admin-config.js";
  var ITERACJE = 600000;
  // pliki po poprzedniej wersji panelu (Cloudflare) — usuwane przy pierwszej konfiguracji
  var DO_SPRZATNIECIA = ["_panel-serwer/worker.js", "_panel-serwer/wrangler.toml", "_panel-serwer/INSTRUKCJA.md", "assets/js/vendor/qrcode.js"];
  var stan = {
    token: null,
    owner: KONFIG.owner || wykryte.owner,
    repo: KONFIG.repo || wykryte.repo,
    branch: KONFIG.branch || "",
    login: "",
    dane: null,          // { wpisy, przed, po }
    drzewo: [],          // ścieżki plików w repozytorium
    edytowany: null,     // id edytowanego wpisu albo null (nowy)
    zdjecia: [],         // zdjęcia w edytorze
    brudny: false,
    lokalneUrl: {},      // ścieżka → blob URL (świeżo wgrane, zanim GitHub je udostępni)
    zajety: false
  };
  var ust = Object.assign({}, DOMYSLNE_UST, czytajJSON("sosw-admin-ust", {}));

  function wykryjRepo() {
    var host = location.hostname, owner = "michalgaweksosw-mmg", repo = "www";
    if (/\.github\.io$/i.test(host)) {
      owner = host.replace(/\.github\.io$/i, "");
      var seg = location.pathname.split("/").filter(Boolean);
      repo = seg.length > 1 ? seg[0] : host;
    }
    return { owner: owner, repo: repo };
  }

  /* ---------------- narzędzia ---------------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function czekaj(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function rozmiar(b) { return b > 1048576 ? (b / 1048576).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }
  function dzis() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function losowe() { return Math.random().toString(36).slice(2, 6); }
  function slug(t) {
    var m = { "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ó": "o", "ś": "s", "ź": "z", "ż": "z" };
    return String(t).toLowerCase().replace(/[ąćęłńóśźż]/g, function (c) { return m[c]; })
      .normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "wpis";
  }
  function rawUrl(sciezka) {
    if (stan.lokalneUrl[sciezka]) return stan.lokalneUrl[sciezka];
    return "https://raw.githubusercontent.com/" + stan.owner + "/" + stan.repo + "/" + encodeURIComponent(stan.branch) + "/" + sciezka.split("/").map(encodeURIComponent).join("/");
  }
  function dekodujB64(b64) {
    var bin = atob(b64.replace(/\s/g, ""));
    var u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(u);
  }
  function doBase64(blob) {
    return new Promise(function (ok, blad) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(",")[1]); };
      r.onerror = function () { blad(r.error); };
      r.readAsDataURL(blob);
    });
  }

  var toastTimer;
  function toast(html, ms) {
    var t = $("#toast");
    t.innerHTML = html; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, ms || 6000);
  }

  function potwierdz(tytul, tresc, przycisk, opcja) {
    var d = $("#dialog-potwierdz");
    $("#pot-tytul").textContent = tytul;
    $("#pot-tresc").textContent = tresc;
    $("#pot-ok").textContent = przycisk || "Usuń";
    $("#pot-opcja-wrap").hidden = !opcja;
    if (opcja) { $("#pot-opcja-tekst").textContent = opcja.tekst; $("#pot-opcja").checked = !!opcja.domyslnie; }
    d.returnValue = "";
    d.showModal();
    return new Promise(function (ok) {
      d.addEventListener("close", function zamk() {
        d.removeEventListener("close", zamk);
        ok(d.returnValue === "ok" ? { opcja: $("#pot-opcja").checked } : null);
      });
    });
  }

  /* ---------------- GitHub API ---------------- */
  function repoSciezka(p) { return "/repos/" + encodeURIComponent(stan.owner) + "/" + encodeURIComponent(stan.repo) + p; }

  function gh(sciezka, opcje) {
    opcje = opcje || {};
    var naglowki = {
      Authorization: "Bearer " + stan.token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    if (opcje.body) naglowki["Content-Type"] = "application/json";
    return fetch(API + sciezka, {
      method: opcje.method || "GET",
      headers: naglowki,
      body: opcje.body ? JSON.stringify(opcje.body) : undefined,
      cache: "no-store"
    }).then(function (r) {
      if (r.ok) return r.status === 204 ? null : r.json();
      return r.json().catch(function () { return {}; }).then(function (j) {
        var e = new Error(j.message || r.statusText);
        e.status = r.status;
        e.limit = r.headers.get("x-ratelimit-remaining") === "0";
        throw e;
      });
    }, function () {
      var e = new Error("Brak połączenia z GitHubem. Sprawdź internet i spróbuj ponownie.");
      e.status = 0; throw e;
    });
  }

  function komunikatBledu(e) {
    if (!e) return "Nieznany błąd.";
    if (e.status === 401) return "Token jest nieprawidłowy albo wygasł. Wyloguj się i zaloguj nowym tokenem.";
    if (e.status === 403 && e.limit) return "Przekroczono limit zapytań do GitHuba. Spróbuj za kilkanaście minut.";
    if (e.status === 403) return "Token nie ma uprawnień do zapisu. Sprawdź, czy ma dostęp do repozytorium " + stan.repo + " i uprawnienie Contents: Read and write.";
    if (e.status === 404) return "Nie znaleziono repozytorium " + stan.owner + "/" + stan.repo + " albo token nie ma do niego dostępu.";
    if (e.status === 409) return "Repozytorium jest puste albo zablokowane.";
    if (e.status === 422) return "Ktoś zapisał zmiany w tym samym momencie. Odśwież panel i spróbuj ponownie.";
    return e.message || "Nieznany błąd.";
  }

  /* ---------------- dane aktualności ---------------- */
  function parsujDane(tekst) {
    var a = tekst.indexOf(ZNACZNIK_START), b = tekst.indexOf(ZNACZNIK_KONIEC);
    if (a < 0 || b < 0 || b < a) throw new Error("W pliku " + PLIK_DANYCH + " brakuje znaczników DANE-START / DANE-KONIEC. Przywróć je na GitHubie.");
    var wpisy;
    try { wpisy = JSON.parse(tekst.slice(a + ZNACZNIK_START.length, b)); }
    catch (e) { throw new Error("Plik " + PLIK_DANYCH + " ma błąd składni (" + e.message + "). Popraw go na GitHubie albo przywróć poprzednią wersję."); }
    if (!Array.isArray(wpisy)) throw new Error("Dane aktualności nie są listą.");
    return { wpisy: wpisy, przed: tekst.slice(0, a + ZNACZNIK_START.length), po: tekst.slice(b) };
  }
  function serializuj(d) {
    var wpisy = d.wpisy.slice().sort(function (x, y) { return x.data < y.data ? 1 : x.data > y.data ? -1 : 0; });
    return d.przed + JSON.stringify(wpisy, null, 2) + d.po;
  }
  function wczytajDane(ref) {
    return gh(repoSciezka("/contents/" + PLIK_DANYCH + "?ref=" + encodeURIComponent(ref))).then(function (f) {
      return parsujDane(dekodujB64(f.content));
    });
  }
  function wczytajDrzewo() {
    return gh(repoSciezka("/git/trees/" + encodeURIComponent(stan.branch) + "?recursive=1")).then(function (t) {
      stan.drzewo = t.tree.filter(function (x) { return x.type === "blob"; }).map(function (x) { return { path: x.path, size: x.size }; });
    });
  }

  /**
   * Zapis jako jeden commit.
   * pliki: [{ path, blob }]   — nowe pliki binarne
   * usun:  [ścieżki]         — pliki do usunięcia (pomijane, jeśli nie istnieją)
   * zmienDane: fn(wpisy) → wpisy — operacja na najnowszej wersji danych (odporna na równoległe zmiany)
   */
  async function zatwierdz(o) {
    var bloby = [];
    for (var i = 0; i < (o.pliki || []).length; i++) {
      var p = o.pliki[i];
      if (o.postep) o.postep("Wysyłam zdjęcia: " + (i + 1) + " z " + o.pliki.length + "…");
      var b = await gh(repoSciezka("/git/blobs"), { method: "POST", body: { content: await doBase64(p.blob), encoding: "base64" } });
      bloby.push({ path: p.path, mode: "100644", type: "blob", sha: b.sha });
    }
    for (var proba = 1; proba <= 4; proba++) {
      if (o.postep) o.postep("Zapisuję zmiany w repozytorium…");
      var ref = await gh(repoSciezka("/git/ref/heads/" + encodeURIComponent(stan.branch)));
      var glowa = ref.object.sha;
      var commit = await gh(repoSciezka("/git/commits/" + glowa));
      var drzewo = bloby.slice();
      if (o.generuj) {
        (await o.generuj(glowa)).forEach(function (f) { drzewo.push({ path: f.path, mode: "100644", type: "blob", content: f.content }); });
      }
      var dane = null;
      if (o.zmienDane) {
        dane = await wczytajDane(glowa);
        dane.wpisy = o.zmienDane(dane.wpisy);
        drzewo.push({ path: PLIK_DANYCH, mode: "100644", type: "blob", content: serializuj(dane) });
      }
      if (o.usun && o.usun.length) {
        var t = await gh(repoSciezka("/git/trees/" + commit.tree.sha + "?recursive=1"));
        var istnieje = {};
        t.tree.forEach(function (x) { istnieje[x.path] = true; });
        o.usun.forEach(function (sc) { if (istnieje[sc]) drzewo.push({ path: sc, mode: "100644", type: "blob", sha: null }); });
      }
      if (!drzewo.length) return { dane: dane };
      var noweDrzewo = await gh(repoSciezka("/git/trees"), { method: "POST", body: { base_tree: commit.tree.sha, tree: drzewo } });
      var nowy = await gh(repoSciezka("/git/commits"), { method: "POST", body: { message: o.opis, tree: noweDrzewo.sha, parents: [glowa] } });
      try {
        await gh(repoSciezka("/git/refs/heads/" + encodeURIComponent(stan.branch)), { method: "PATCH", body: { sha: nowy.sha, force: false } });
        return { dane: dane, sha: nowy.sha };
      } catch (e) {
        if (e.status === 422 && proba < 4) { await czekaj(700 * proba); continue; }
        throw e;
      }
    }
  }

  /* Czekanie, aż GitHub Pages opublikuje zmianę (sprawdzamy plik na żywej stronie) */
  function obserwujPublikacje(warunek, gotowe) {
    if (!/^https?:$/.test(location.protocol)) return;
    var start = Date.now();
    (function sprawdz() {
      fetch(PLIK_DANYCH + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (t) {
        if (t && warunek(t)) { gotowe(); return; }
        if (Date.now() - start < 6 * 60 * 1000) setTimeout(sprawdz, 10000);
      }, function () { if (Date.now() - start < 6 * 60 * 1000) setTimeout(sprawdz, 15000); });
    })();
  }

  /* ---------------- konwersja zdjęć do WebP ---------------- */
  function czyObslugiwany(plik) {
    if (/heic|heif/i.test(plik.type) || /\.hei[cf]$/i.test(plik.name)) {
      throw new Error("Format HEIC (iPhone) nie jest obsługiwany. Wyślij zdjęcie jako JPEG — w iPhonie: Ustawienia → Aparat → Formaty → „Najbardziej zgodne”.");
    }
    if (!/^image\/(jpeg|png|webp)$/i.test(plik.type) && !/\.(jpe?g|png|webp)$/i.test(plik.name)) {
      throw new Error("To nie jest zdjęcie JPEG ani PNG.");
    }
  }
  async function wczytajObraz(plik) {
    try { return await createImageBitmap(plik, { imageOrientation: "from-image" }); }
    catch (e) {
      // starsze przeglądarki — przez <img>
      var url = URL.createObjectURL(plik);
      try {
        var img = new Image();
        img.src = url;
        await img.decode();
        return img;
      } catch (e2) { throw new Error("Nie udało się odczytać zdjęcia. Plik może być uszkodzony."); }
      finally { URL.revokeObjectURL(url); }
    }
  }
  async function doWebp(zrodlo, maksBok, jakosc) {
    var sw = zrodlo.naturalWidth || zrodlo.width, sh = zrodlo.naturalHeight || zrodlo.height;
    var skala = Math.min(1, maksBok / Math.max(sw, sh));
    var w = Math.max(1, Math.round(sw * skala)), h = Math.max(1, Math.round(sh * skala));
    // zmniejszanie w krokach — ostrzejszy wynik przy dużych zdjęciach
    var obraz = zrodlo, cw = sw, ch = sh;
    while (cw / 2 >= w * 1.1) {
      cw = Math.round(cw / 2); ch = Math.round(ch / 2);
      var krok = document.createElement("canvas");
      krok.width = cw; krok.height = ch;
      var kc = krok.getContext("2d");
      kc.imageSmoothingQuality = "high";
      kc.drawImage(obraz, 0, 0, cw, ch);
      obraz = krok;
    }
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(obraz, 0, 0, w, h);
    var blob = await new Promise(function (ok) { c.toBlob(ok, "image/webp", jakosc); });
    if (!blob || blob.type !== "image/webp") throw new Error("Ta przeglądarka nie potrafi zapisywać WebP. Użyj aktualnego Chrome, Edge albo Firefoksa.");
    return { blob: blob, w: w, h: h };
  }
  async function konwertuj(plik) {
    czyObslugiwany(plik);
    var obraz = await wczytajObraz(plik);
    var duze = await doWebp(obraz, ust.bok, ust.jakosc / 100);
    var male = await doWebp(obraz, ust.min, Math.min(ust.jakosc, 80) / 100);
    if (obraz.close) obraz.close();
    return { duze: duze, male: male };
  }

  /* ---------------- logowanie ---------------- */
  function pokazEkran(id) {
    ["ekran-logowania", "ekran-konfiguracji", "ekran-konta", "ekran-aktualnosci", "ekran-edytora", "ekran-zdjec"].forEach(function (e) { $("#" + e).hidden = e !== id; });
    var zalogowany = !!stan.token && id !== "ekran-logowania" && id !== "ekran-konfiguracji";
    $(".a-gora__zakladki").hidden = !zalogowany;
    $(".a-gora__konto").hidden = !zalogowany;
    $$(".a-gora__zakladki a").forEach(function (a) {
      var akt = (a.dataset.zakladka === "aktualnosci" && (id === "ekran-aktualnosci" || id === "ekran-edytora")) || (a.dataset.zakladka === "zdjecia" && id === "ekran-zdjec") || (a.dataset.zakladka === "konto" && id === "ekran-konta");
      if (akt) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  /* ---------------- szyfrowanie tokenu hasłem ---------------- */
  var tekstEnc = new TextEncoder();
  function b64(bajty) { var t = ""; for (var i = 0; i < bajty.length; i++) t += String.fromCharCode(bajty[i]); return btoa(t); }
  function zB64(t) { var s = atob(t), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  async function kluczZHasla(login, haslo, sol, iteracje) {
    var baza = await crypto.subtle.importKey("raw", tekstEnc.encode(haslo), "PBKDF2", false, ["deriveKey"]);
    var l = tekstEnc.encode(login.toLowerCase());
    var solPelna = new Uint8Array(sol.length + l.length); // sól losowa + login
    solPelna.set(sol); solPelna.set(l, sol.length);
    return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: solPelna, iterations: iteracje }, baza, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function zaszyfrujToken(login, haslo, token) {
    var sol = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    var k = await kluczZHasla(login, haslo, sol, ITERACJE);
    var szyfr = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k, tekstEnc.encode(token)));
    return { login: login.toLowerCase(), iteracje: ITERACJE, sol: b64(sol), iv: b64(iv), dane: b64(szyfr), utworzono: new Date().toISOString().slice(0, 10) };
  }
  async function odszyfrujToken(konto, haslo) {
    var k = await kluczZHasla(konto.login, haslo, zB64(konto.sol), konto.iteracje || ITERACJE);
    var jawny = await crypto.subtle.decrypt({ name: "AES-GCM", iv: zB64(konto.iv) }, k, zB64(konto.dane));
    return new TextDecoder().decode(jawny);
  }
  function znajdzKonto(konfig, login) {
    login = login.trim().toLowerCase();
    return (konfig.konta || []).filter(function (k) { return k.login === login; })[0];
  }
  function ocenHaslo(h) {
    if (!h) return "";
    var rodzaje = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(function (r) { return r.test(h); }).length;
    if (h.length >= 14 && rodzaje >= 3) return "Hasło jest silne.";
    if (h.length >= 12 && rodzaje >= 2) return "Hasło jest w porządku. Dłuższe (np. 3–4 przypadkowe słowa) będzie bezpieczniejsze.";
    return "Uwaga: to hasło jest słabe. Zaszyfrowany token jest publiczny, więc krótkie hasło (zwłaszcza imię + cyfry) da się odgadnąć programem. Zalecamy min. 14 znaków, np. kilka przypadkowych słów.";
  }
  var LOGIN_RE = /^[a-z0-9][a-z0-9._-]{1,31}$/;

  /* ---------------- plik konfiguracji ---------------- */
  function tekstKonfiguracji(k) {
    return "/* Konfiguracja panelu administratora — plik zapisywany przez panel (admin.html → Konta).\n" +
      "   Zawiera loginy i zaszyfrowany token GitHub (AES-GCM, klucz wyprowadzony z hasła: PBKDF2-SHA256).\n" +
      "   Haseł tu nie ma. Nie edytuj ręcznie. */\n" +
      "window.SOSW_PANEL = /*KONFIG-START*/" + JSON.stringify(k, null, 2) + "/*KONFIG-KONIEC*/;\n";
  }
  async function konfiguracjaZRepo(ref) {
    try {
      var f = await gh(repoSciezka("/contents/" + PLIK_KONFIGURACJI + "?ref=" + encodeURIComponent(ref)));
      var t = dekodujB64(f.content), a = t.indexOf("/*KONFIG-START*/"), b = t.indexOf("/*KONFIG-KONIEC*/");
      if (a < 0 || b < 0) return { konta: [] };
      var k = JSON.parse(t.slice(a + 16, b));
      if (!Array.isArray(k.konta)) k.konta = [];
      return k;
    } catch (e) { if (e.status === 404) return { konta: [] }; throw e; }
  }
  /** Zmiana konfiguracji kont — zawsze na najnowszej wersji pliku z repozytorium */
  async function zmienKonfiguracje(opis, fn, usun) {
    var wynik = null;
    await zatwierdz({
      opis: opis, usun: usun || [],
      generuj: async function (glowa) {
        var k = await konfiguracjaZRepo(glowa);
        k = fn(k) || k;
        k.owner = stan.owner; k.repo = stan.repo; k.branch = stan.branch;
        wynik = k;
        return [{ path: PLIK_KONFIGURACJI, content: tekstKonfiguracji(k) }];
      }
    });
    KONFIG = wynik;
    return wynik;
  }

  /* ---------------- logowanie ---------------- */
  function ustawFormularzLogowania() {
    $("#cfg-owner").value = stan.owner;
    $("#cfg-repo").value = stan.repo;
    $("#cfg-branch").value = stan.branch;
    $("#nazwa-repo-pomoc").textContent = stan.owner + "/" + stan.repo;
    $("#link-token").href = "https://github.com/settings/personal-access-tokens/new?name=" +
      encodeURIComponent("Panel strony SOSW") + "&description=" + encodeURIComponent("Panel administratora strony " + stan.owner + "/" + stan.repo) +
      "&target_name=" + encodeURIComponent(stan.owner) + "&expires_in=365&contents=write";
    $("#info-brak-kont").hidden = KONFIG.konta.length > 0;
    $("#kfg-ostrzezenie").hidden = KONFIG.konta.length === 0;
  }

  /** Sprawdza token w GitHubie i wczytuje dane. */
  async function uruchomZTokenem(token, login) {
    stan.token = token;
    var repo = await gh(repoSciezka(""));
    if (!repo.permissions || !repo.permissions.push) { var e = new Error(); e.status = 403; throw e; }
    if (!stan.branch) stan.branch = repo.default_branch;
    stan.login = login;
    $("#uzytkownik").textContent = "Zalogowano: " + login;
    pisz("sessionStorage", "sosw-admin-sesja", JSON.stringify({ token: token, login: login, branch: stan.branch }));
    await odswiez();
    if (!location.hash || /^#(konfiguracja)?$/.test(location.hash)) history.replaceState(null, "", "#aktualnosci");
    ostatniHash = location.hash;
    router();
  }

  async function zalogujHaslem(login, haslo) {
    var blad = $("#blad-logowania"), przycisk = $("#przycisk-logowania");
    blad.hidden = true;
    przycisk.disabled = true; przycisk.textContent = "Sprawdzam…";
    try {
      var konto = znajdzKonto(KONFIG, login);
      var token = null;
      if (konto) { try { token = await odszyfrujToken(konto, haslo); } catch (e) { token = null; } }
      else { await kluczZHasla(login, haslo, new Uint8Array(16), ITERACJE); } // ten sam czas odpowiedzi
      if (!token) throw Object.assign(new Error("Nieprawidłowy login lub hasło."), { status: -1 });
      $("#haslo").value = "";
      pisz("localStorage", "sosw-admin-login", konto.login);
      await uruchomZTokenem(token, konto.login);
    } catch (e) {
      stan.token = null;
      blad.textContent = e.status === -1 ? e.message
        : e.status === 401 ? "Hasło jest poprawne, ale token GitHub wygasł albo został usunięty. Wykonaj ponownie „Pierwszą konfigurację” z nowym tokenem."
        : komunikatBledu(e);
      blad.hidden = false;
      $("#haslo").focus();
    } finally {
      przycisk.disabled = false; przycisk.textContent = "Zaloguj się";
    }
  }

  async function konfiguruj() {
    var b = $("#blad-konfiguracji"), przycisk = $("#przycisk-konfiguracji");
    b.hidden = true;
    var token = $("#kfg-token").value.trim(), login = $("#kfg-login").value.trim().toLowerCase();
    var h1 = $("#kfg-haslo").value, h2 = $("#kfg-haslo2").value;
    var zle = !token ? "Wklej token GitHub." : !LOGIN_RE.test(login) ? "Login: 2–32 znaki — małe litery bez polskich znaków, cyfry, kropka, myślnik." :
      h1.length < 8 ? "Hasło musi mieć co najmniej 8 znaków." : h1 !== h2 ? "Hasła nie są takie same." : "";
    if (zle) { b.textContent = zle; b.hidden = false; return; }
    if (KONFIG.konta.length && !(await potwierdz("Zastąpić obecne konta?", "W panelu są już konta (" + KONFIG.konta.map(function (k) { return k.login; }).join(", ") + "). Nowa konfiguracja je usunie.", "Zastąp konta"))) return;
    stan.owner = $("#cfg-owner").value.trim() || stan.owner;
    stan.repo = $("#cfg-repo").value.trim() || stan.repo;
    stan.branch = $("#cfg-branch").value.trim();
    przycisk.disabled = true; przycisk.textContent = "Sprawdzam token…";
    try {
      stan.token = token;
      var repo = await gh(repoSciezka(""));
      if (!repo.permissions || !repo.permissions.push) { var e = new Error(); e.status = 403; throw e; }
      if (!stan.branch) stan.branch = repo.default_branch;
      przycisk.textContent = "Szyfruję i zapisuję…";
      var konto = await zaszyfrujToken(login, h1, token);
      await zmienKonfiguracje("Panel: konfiguracja kont (" + login + ")", function () { return { konta: [konto] }; }, DO_SPRZATNIECIA);
      ["#kfg-token", "#kfg-haslo", "#kfg-haslo2"].forEach(function (s) { $(s).value = ""; });
      $("#login").value = login;
      toast("Konfiguracja zapisana. Na innych urządzeniach logowanie zadziała za 1–2 minuty (po publikacji).", 9000);
      await uruchomZTokenem(token, login);
    } catch (err) {
      stan.token = null;
      b.textContent = komunikatBledu(err); b.hidden = false;
    } finally {
      przycisk.disabled = false; przycisk.textContent = "Zapisz konfigurację i zaloguj";
    }
  }

  function wyloguj() {
    if (stan.brudny && !confirm("Masz niezapisane zmiany. Na pewno wylogować?")) return;
    stan.token = null; stan.brudny = false; stan.login = "";
    pisz("sessionStorage", "sosw-admin-sesja", null);
    history.replaceState(null, "", location.pathname);
    ostatniHash = "";
    $("#blad-logowania").hidden = true;
    pokazEkran("ekran-logowania");
    $("#haslo").focus();
  }

  /* ---------------- konta ---------------- */
  function renderKonta() {
    var el = $("#lista-kont");
    el.innerHTML = KONFIG.konta.map(function (k) {
      var ja = k.login === stan.login;
      return "<li><b>" + esc(k.login) + (ja ? " (Ty)" : "") + "</b>" +
        (ja ? "" : '<button type="button" class="btn a-obrys-czerwony a-maly" data-usun-konto="' + esc(k.login) + '">Usuń<span class="wizualnie-ukryte"> konto ' + esc(k.login) + "</span></button>") +
        "<small>Utworzono: " + esc(k.utworzono || "—") + "</small></li>";
    }).join("") || '<li class="a-pusto">Brak kont.</li>';
  }
  async function pokazKonta() {
    pokazEkran("ekran-konta");
    renderKonta();
    try { KONFIG = await konfiguracjaZRepo(stan.branch); renderKonta(); } catch (e) { /* lista z pliku strony */ }
  }

  async function odswiez() {
    var wyniki = await Promise.all([wczytajDane(stan.branch), wczytajDrzewo()]);
    stan.dane = wyniki[0];
  }

  /* ---------------- router ---------------- */
  function router() {
    $("#toast").hidden = true;
    var h = location.hash.replace(/^#/, "");
    if (h === "konfiguracja") { ustawFormularzLogowania(); pokazEkran("ekran-konfiguracji"); $("#kfg-token").focus(); return; }
    if (!stan.token) { ustawFormularzLogowania(); pokazEkran("ekran-logowania"); return; }
    if (h === "konto") { pokazKonta(); return; }
    if (h === "zdjecia") { pokazEkran("ekran-zdjec"); renderBiblioteka(); }
    else if (h === "nowy") { otworzEdytor(null); }
    else if (h.indexOf("edytuj/") === 0) { otworzEdytor(decodeURIComponent(h.slice(7))); }
    else { pokazEkran("ekran-aktualnosci"); renderLista(); }
    $("#widok").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  var ostatniHash = location.hash;
  window.addEventListener("hashchange", function () {
    var bylEdytor = /^#(nowy|edytuj\/)/.test(ostatniHash);
    if (bylEdytor && stan.brudny && !confirm("Masz niezapisane zmiany we wpisie. Wyjść bez zapisywania?")) {
      history.replaceState(null, "", ostatniHash);
      return;
    }
    if (bylEdytor) stan.brudny = false;
    ostatniHash = location.hash;
    router();
  });
  window.addEventListener("beforeunload", function (e) {
    if (stan.brudny || stan.zajety) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------------- lista wpisów ---------------- */
  function posortowane() {
    return stan.dane.wpisy.slice().sort(function (a, b) { return a.data < b.data ? 1 : a.data > b.data ? -1 : 0; });
  }
  function miniaturaWpisu(w) {
    var sc = w.miniatura || w.zdjecie;
    if (sc) return '<img src="' + esc(/^(blob:|https?:)/.test(sc) ? sc : rawUrl(sc)) + '" alt="" loading="lazy">';
    return window.SOSW_AKT ? window.SOSW_AKT.okladka(w) : "";
  }
  function renderLista() {
    var fraza = $("#szukaj").value.trim().toLowerCase();
    var wpisy = posortowane().filter(function (w) { return !fraza || (w.tytul + " " + (w.zajawka || "")).toLowerCase().indexOf(fraza) >= 0; });
    $("#licznik-wpisow").textContent = "(" + stan.dane.wpisy.length + ")";
    var lista = $("#lista-wpisow");
    if (!wpisy.length) {
      lista.innerHTML = '<li class="a-pusto">' + (fraza ? "Brak wpisów pasujących do wyszukiwania." : "Nie ma jeszcze żadnych wpisów. Kliknij „+ Nowy wpis”, żeby dodać pierwszy.") + "</li>";
      return;
    }
    lista.innerHTML = wpisy.map(function (w) {
      var ile = (w.zdjecie ? 1 : 0) + (w.galeria || []).length;
      return '<li class="a-wpis">' +
        '<div class="a-wpis__miniatura">' + miniaturaWpisu(w) + "</div>" +
        "<div><h2>" + esc(w.tytul) + "</h2>" + (window.SOSW_AKT ? window.SOSW_AKT.meta(w) : "") +
        '<p class="a-foto__info">' + (ile ? "Zdjęcia: " + ile : "Bez zdjęć") + "</p></div>" +
        '<div class="a-wpis__akcje">' +
        '<a class="btn btn--obrys a-maly" href="aktualnosc.html?wpis=' + encodeURIComponent(w.id) + '" target="_blank" rel="noopener">Zobacz<span class="wizualnie-ukryte"> wpis „' + esc(w.tytul) + '”</span></a>' +
        '<a class="btn btn--glowny a-maly" href="#edytuj/' + encodeURIComponent(w.id) + '">Edytuj<span class="wizualnie-ukryte"> „' + esc(w.tytul) + '”</span></a>' +
        '<button type="button" class="btn a-obrys-czerwony a-maly" data-usun="' + esc(w.id) + '">Usuń<span class="wizualnie-ukryte"> „' + esc(w.tytul) + '”</span></button>' +
        "</div></li>";
    }).join("");
  }

  function sciezkiZdjecWpisu(w) {
    var s = [];
    if (w.zdjecie) s.push(w.zdjecie);
    if (w.miniatura) s.push(w.miniatura);
    (w.galeria || []).forEach(function (z) { if (z.src) s.push(z.src); if (z.min) s.push(z.min); });
    return s;
  }
  function uzyteGdzieIndziej(sciezka, pominId) {
    return stan.dane.wpisy.some(function (w) { return w.id !== pominId && sciezkiZdjecWpisu(w).indexOf(sciezka) >= 0; });
  }

  async function usunWpis(id) {
    var w = stan.dane.wpisy.filter(function (x) { return x.id === id; })[0];
    if (!w) return;
    var maZdjecia = sciezkiZdjecWpisu(w).length > 0;
    var odp = await potwierdz("Usunąć wpis?", "Wpis „" + w.tytul + "” zniknie ze strony. Tej operacji nie da się cofnąć w panelu (można ją cofnąć w historii repozytorium na GitHubie).", "Usuń wpis",
      maZdjecia ? { tekst: "Usuń też zdjęcia tego wpisu (te, które nie są używane w innych wpisach)", domyslnie: true } : null);
    if (!odp) return;
    var usun = odp.opcja ? sciezkiZdjecWpisu(w).filter(function (s) { return s.indexOf(KATALOG_ZDJEC + "/") === 0 && !uzyteGdzieIndziej(s, id); }) : [];
    stan.zajety = true;
    toast("Usuwam wpis…", 60000);
    try {
      var wynik = await zatwierdz({
        opis: "Aktualności: usunięto „" + w.tytul + "”",
        usun: usun,
        zmienDane: function (wpisy) { return wpisy.filter(function (x) { return x.id !== id; }); }
      });
      stan.dane = wynik.dane;
      stan.drzewo = stan.drzewo.filter(function (f) { return usun.indexOf(f.path) < 0; });
      renderLista();
      toast("Usunięto wpis „" + esc(w.tytul) + "”. Zniknie ze strony w ciągu 1–2 minut.");
    } catch (e) {
      toast("Nie udało się usunąć: " + esc(komunikatBledu(e)), 10000);
    } finally { stan.zajety = false; }
  }

  /* ---------------- edytor ---------------- */
  function wypelnijJednostki() {
    var j = (window.SOSW_AKT && window.SOSW_AKT.jednostki) || { osrodek: { nazwa: "Ośrodek" } };
    $("#f-jednostka").innerHTML = Object.keys(j).map(function (k) { return '<option value="' + k + '">' + esc(j[k].nazwa) + "</option>"; }).join("");
  }

  function otworzEdytor(id) {
    var w = id ? stan.dane.wpisy.filter(function (x) { return x.id === id; })[0] : null;
    if (id && !w) { toast("Nie znaleziono wpisu — mógł zostać usunięty."); location.hash = "aktualnosci"; return; }
    stan.edytowany = w ? w.id : null;
    stan.zdjecia.forEach(function (z) { if (z.url && z.url.indexOf("blob:") === 0 && !z.zostaw) URL.revokeObjectURL(z.url); });
    stan.zdjecia = [];
    $("#ed-tytul").textContent = w ? "Edycja wpisu" : "Nowy wpis";
    $("#f-tytul").value = w ? w.tytul : "";
    $("#f-data").value = w ? w.data : dzis();
    $("#f-jednostka").value = w ? (w.jednostka || "osrodek") : "osrodek";
    $("#f-zajawka").value = w ? (w.zajawka || "") : "";
    $("#f-tresc").value = w ? (w.tresc || []).join("\n\n") : "";
    if (w) {
      if (w.zdjecie) stan.zdjecia.push({ klucz: losowe(), stan: "istniejace", src: w.zdjecie, min: w.miniatura || "", alt: w.opisZdjecia || "", url: rawUrl(w.miniatura || w.zdjecie) });
      (w.galeria || []).forEach(function (z) { stan.zdjecia.push({ klucz: losowe(), stan: "istniejace", src: z.src, min: z.min || "", alt: z.alt || "", url: rawUrl(z.min || z.src) }); });
    }
    $("#status-wpisu").textContent = ""; $("#status-wpisu").className = "a-status";
    $$("#form-wpisu [aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    stan.brudny = false;
    pokazEkran("ekran-edytora");
    renderZdjecia(); podglad();
    $("#f-tytul").focus();
  }

  function zajawkaZTresci() {
    var p = $("#f-tresc").value.trim().split(/\n\s*\n/)[0] || "";
    p = p.replace(/\s+/g, " ");
    if (p.length <= 170) return p;
    var c = p.slice(0, 170);
    return c.slice(0, c.lastIndexOf(" ")) + "…";
  }

  function renderZdjecia() {
    var lista = $("#zdjecia-wpisu");
    lista.innerHTML = stan.zdjecia.map(function (z, i) {
      var info;
      if (z.stan === "konwersja") info = "Zamieniam na WebP…";
      else if (z.stan === "blad") info = '<span style="color:#8f1d24">' + esc(z.blad) + "</span>";
      else if (z.stan === "nowe") info = esc(z.nazwa) + "<br>" + rozmiar(z.przed) + " → <b>WebP " + rozmiar(z.duze.blob.size) + "</b>, " + z.duze.w + "×" + z.duze.h + " px";
      else info = "Z biblioteki: " + esc(z.src.split("/").pop());
      return '<li class="a-foto' + (i === 0 && z.stan !== "blad" ? " glowne" : "") + (z.stan === "blad" ? " blad" : "") + '" data-klucz="' + z.klucz + '">' +
        '<div class="a-foto__obraz">' + (z.url ? '<img src="' + esc(z.url) + '" alt="">' : "") +
        (i === 0 && z.stan !== "blad" ? '<span class="a-foto__znacznik">Zdjęcie główne</span>' : "") +
        (z.stan === "konwersja" ? '<span class="a-foto__postep">Konwertuję…</span>' : "") + "</div>" +
        '<div class="a-foto__tresc"><p class="a-foto__info">' + info + "</p>" +
        (z.stan !== "blad" ? '<label><span class="wizualnie-ukryte">Opis zdjęcia ' + (i + 1) + '</span><input class="a-alt" data-alt value="' + esc(z.alt) + '" placeholder="Opis: co widać na zdjęciu?"></label>' : "") +
        '<div class="a-foto__akcje">' +
        '<button type="button" data-akcja="lewo" ' + (i === 0 ? "disabled" : "") + ' aria-label="Przesuń wcześniej">←</button>' +
        '<button type="button" data-akcja="prawo" ' + (i === stan.zdjecia.length - 1 ? "disabled" : "") + ' aria-label="Przesuń dalej">→</button>' +
        (i > 0 && z.stan !== "blad" ? '<button type="button" data-akcja="glowne">Ustaw jako główne</button>' : "") +
        '<button type="button" class="usun" data-akcja="usun">Usuń</button></div></div></li>';
    }).join("");
  }

  function podglad() {
    var z0 = stan.zdjecia.filter(function (z) { return z.stan !== "blad"; })[0];
    var w = {
      id: stan.edytowany || "podglad-" + slug($("#f-tytul").value),
      tytul: $("#f-tytul").value.trim() || "Tytuł wpisu",
      data: $("#f-data").value || dzis(),
      jednostka: $("#f-jednostka").value,
      zajawka: $("#f-zajawka").value.trim() || zajawkaZTresci() || "Zajawka pojawi się tutaj.",
      zdjecie: z0 ? z0.url : "", miniatura: z0 ? z0.url : "", opisZdjecia: z0 ? z0.alt : ""
    };
    var A = window.SOSW_AKT;
    $("#podglad").innerHTML = A ? '<li><a href="#" tabindex="-1">' + A.okladka(w) + A.meta(w) + "<h3>" + esc(w.tytul) + "</h3><p>" + esc(w.zajawka) + "</p></a></li>" : "";
    var n = $("#f-zajawka").value.length;
    $("#licznik-zajawki").textContent = n ? n + " / 300 znaków" : "Puste — użyjemy początku treści.";
    var uwagi = [];
    if (!$("#f-tytul").value.trim()) uwagi.push("Wpisz tytuł.");
    if (!$("#f-tresc").value.trim()) uwagi.push("Treść jest pusta — wpis będzie miał tylko zajawkę.");
    var bezOpisu = stan.zdjecia.filter(function (z) { return z.stan !== "blad" && !z.alt.trim(); }).length;
    if (bezOpisu) uwagi.push("Zdjęcia bez opisu: " + bezOpisu + ". Opis pomaga osobom niewidomym (wymóg dostępności).");
    if (stan.zdjecia.some(function (z) { return z.stan === "konwersja"; })) uwagi.push("Trwa konwersja zdjęć…");
    if (stan.zdjecia.some(function (z) { return z.stan === "blad"; })) uwagi.push("Usuń zdjęcia oznaczone błędem, żeby zapisać wpis.");
    $("#uwagi").innerHTML = uwagi.length ? "<ul>" + uwagi.map(function (u) { return "<li>" + esc(u) + "</li>"; }).join("") + "</ul>" : "";
  }

  async function dodajPliki(pliki) {
    pliki = Array.prototype.slice.call(pliki);
    if (!pliki.length) return;
    stan.brudny = true;
    var nowe = pliki.map(function (f) { return { klucz: losowe() + losowe(), stan: "konwersja", nazwa: f.name, przed: f.size, alt: "", plik: f }; });
    stan.zdjecia = stan.zdjecia.concat(nowe);
    renderZdjecia(); podglad();
    for (var i = 0; i < nowe.length; i++) {
      var z = nowe[i];
      try {
        var k = await konwertuj(z.plik);
        z.duze = k.duze; z.male = k.male; z.stan = "nowe";
        z.url = URL.createObjectURL(k.male.blob);
      } catch (e) { z.stan = "blad"; z.blad = e.message; }
      delete z.plik;
      renderZdjecia(); podglad();
    }
  }

  function obslugaUpuszczania(strefa, naPliki) {
    ["dragenter", "dragover"].forEach(function (t) { strefa.addEventListener(t, function (e) { e.preventDefault(); strefa.classList.add("nad"); }); });
    ["dragleave", "drop"].forEach(function (t) { strefa.addEventListener(t, function (e) { e.preventDefault(); strefa.classList.remove("nad"); }); });
    strefa.addEventListener("drop", function (e) { if (e.dataTransfer && e.dataTransfer.files.length) naPliki(e.dataTransfer.files); });
  }

  async function zapiszWpis(e) {
    e.preventDefault();
    if (stan.zajety) return;
    var tytul = $("#f-tytul").value.trim(), data = $("#f-data").value;
    $("#f-tytul").setAttribute("aria-invalid", String(!tytul));
    $("#f-data").setAttribute("aria-invalid", String(!data));
    if (!tytul) { $("#f-tytul").focus(); return statusWpisu("Wpisz tytuł wpisu.", "blad"); }
    if (!data) { $("#f-data").focus(); return statusWpisu("Wybierz datę.", "blad"); }
    if (stan.zdjecia.some(function (z) { return z.stan === "konwersja"; })) return statusWpisu("Poczekaj, aż zdjęcia zostaną skonwertowane.", "blad");
    if (stan.zdjecia.some(function (z) { return z.stan === "blad"; })) return statusWpisu("Usuń zdjęcia oznaczone błędem.", "blad");

    var nowy = !stan.edytowany;
    var id = stan.edytowany;
    if (nowy) {
      var baza = slug(tytul), istniejace = {};
      stan.dane.wpisy.forEach(function (w) { istniejace[w.id] = true; });
      id = baza; var n = 2;
      if (istniejace[id]) id = baza + "-" + data.slice(0, 4);
      while (istniejace[id]) id = baza + "-" + data.slice(0, 4) + "-" + (n++);
    }
    var rok = data.slice(0, 4);
    var pliki = [];
    var zdj = stan.zdjecia.map(function (z, i) {
      if (z.stan === "nowe") {
        var rdzen = KATALOG_ZDJEC + "/" + rok + "/" + id.slice(0, 40) + "-" + (i + 1) + "-" + losowe();
        z.src = rdzen + ".webp"; z.min = rdzen + "-min.webp";
        pliki.push({ path: z.src, blob: z.duze.blob }, { path: z.min, blob: z.male.blob });
      }
      return { src: z.src, min: z.min, alt: z.alt.trim() };
    });
    var tresc = $("#f-tresc").value.split(/\n\s*\n/).map(function (p) { return p.replace(/\s*\n\s*/g, " ").trim(); }).filter(Boolean);
    var wpis = {
      id: id, tytul: tytul, data: data, jednostka: $("#f-jednostka").value,
      zajawka: $("#f-zajawka").value.trim() || zajawkaZTresci(),
      tresc: tresc
    };
    if (zdj.length) {
      wpis.zdjecie = zdj[0].src;
      if (zdj[0].min) wpis.miniatura = zdj[0].min;
      wpis.opisZdjecia = zdj[0].alt;
      if (zdj.length > 1) wpis.galeria = zdj.slice(1).map(function (z) { var o = { src: z.src, alt: z.alt }; if (z.min) o.min = z.min; return o; });
    }

    stan.zajety = true;
    $("#zapisz").disabled = true;
    try {
      var wynik = await zatwierdz({
        opis: (nowy ? "Aktualności: nowy wpis „" : "Aktualności: edycja „") + tytul + "”" + (pliki.length ? " (+" + pliki.length / 2 + " zdj.)" : ""),
        pliki: pliki,
        postep: function (t) { statusWpisu(t); },
        zmienDane: function (wpisy) {
          var bez = wpisy.filter(function (x) { return x.id !== id; });
          bez.push(wpis);
          return bez;
        }
      });
      stan.dane = wynik.dane;
      stan.zdjecia.forEach(function (z) {
        if (z.stan === "nowe") {
          stan.lokalneUrl[z.min] = z.url; z.zostaw = true;
          stan.drzewo.push({ path: z.src, size: z.duze.blob.size }, { path: z.min, size: z.male.blob.size });
          z.stan = "istniejace";
        }
      });
      stan.brudny = false;
      stan.edytowany = id;
      $("#ed-tytul").textContent = "Edycja wpisu";
      history.replaceState(null, "", "#edytuj/" + encodeURIComponent(id));
      ostatniHash = location.hash;
      renderZdjecia();
      statusWpisu("Zapisano. Wpis pojawi się na stronie w ciągu 1–2 minut.", "ok");
      toast("Zapisano wpis „" + esc(tytul) + "”. <a href=\"#aktualnosci\">Wróć do listy</a>", 8000);
      obserwujPublikacje(function (t) { return t.indexOf(JSON.stringify(id)) >= 0 && t.indexOf(JSON.stringify(tytul)) >= 0; }, function () {
        statusWpisu("Opublikowano na stronie.", "ok");
        toast('Wpis jest już na stronie. <a href="aktualnosc.html?wpis=' + encodeURIComponent(id) + '" target="_blank" rel="noopener">Zobacz wpis</a>', 10000);
      });
    } catch (err) {
      stan.zdjecia.forEach(function (z) { if (z.stan === "nowe") { z.src = ""; z.min = ""; } });
      statusWpisu("Nie udało się zapisać: " + komunikatBledu(err), "blad");
    } finally {
      stan.zajety = false;
      $("#zapisz").disabled = false;
    }
  }
  function statusWpisu(t, klasa) { var s = $("#status-wpisu"); s.textContent = t; s.className = "a-status" + (klasa ? " " + klasa : ""); }

  /* ---------------- biblioteka zdjęć ---------------- */
  function zdjeciaBiblioteki() {
    var sciezki = {};
    stan.drzewo.forEach(function (f) { sciezki[f.path] = f.size; });
    return stan.drzewo.filter(function (f) {
      return f.path.indexOf(KATALOG_ZDJEC + "/") === 0 && /\.(webp|jpe?g|png)$/i.test(f.path) && !/-min\.webp$/i.test(f.path);
    }).map(function (f) {
      var min = f.path.replace(/\.webp$/i, "-min.webp");
      return { path: f.path, size: f.size, min: (min !== f.path && sciezki[min] != null) ? min : "" };
    }).sort(function (a, b) { return a.path < b.path ? 1 : -1; });
  }
  function gdzieUzyte(sciezka) {
    return stan.dane.wpisy.filter(function (w) { return sciezkiZdjecWpisu(w).indexOf(sciezka) >= 0; });
  }
  function renderBiblioteka() {
    var zd = zdjeciaBiblioteki();
    $("#licznik-zdjec").textContent = "(" + zd.length + ")";
    $("#ust-bok").value = ust.bok; $("#ust-jakosc").value = ust.jakosc; $("#ust-min").value = ust.min;
    var el = $("#biblioteka");
    if (!zd.length) { el.innerHTML = '<li class="a-pusto">Biblioteka jest pusta. Dodaj pierwsze zdjęcia powyżej albo bezpośrednio we wpisie.</li>'; return; }
    el.innerHTML = zd.map(function (z) {
      var wpisy = gdzieUzyte(z.path);
      return '<li class="a-foto"><div class="a-foto__obraz"><img src="' + esc(rawUrl(z.min || z.path)) + '" alt="" loading="lazy"></div>' +
        '<div class="a-foto__tresc"><p class="a-foto__info">' + esc(z.path.split("/").pop()) + "<br>" + rozmiar(z.size || 0) + "</p>" +
        (wpisy.length
          ? '<p class="a-uzycie">We wpisie: ' + wpisy.map(function (w) { return '<a href="#edytuj/' + encodeURIComponent(w.id) + '">' + esc(w.tytul) + "</a>"; }).join(", ") + "</p>"
          : '<p class="a-uzycie wolne">Nieużywane</p>') +
        '<div class="a-foto__akcje"><button type="button" data-kopiuj="' + esc(z.path) + '">Kopiuj adres</button>' +
        '<button type="button" class="usun" data-usun-zdjecie="' + esc(z.path) + '" data-min="' + esc(z.min) + '">Usuń</button></div></div></li>';
    }).join("");
  }

  async function dodajDoBiblioteki(pliki) {
    pliki = Array.prototype.slice.call(pliki);
    if (!pliki.length || stan.zajety) return;
    var status = $("#status-biblioteki");
    var doWyslania = [], bledy = [];
    stan.zajety = true;
    try {
      for (var i = 0; i < pliki.length; i++) {
        status.className = "a-status";
        status.textContent = "Zamieniam na WebP: " + (i + 1) + " z " + pliki.length + "…";
        try {
          var k = await konwertuj(pliki[i]);
          var rdzen = KATALOG_ZDJEC + "/" + dzis().slice(0, 4) + "/" + slug(pliki[i].name.replace(/\.[^.]+$/, "")).slice(0, 40) + "-" + losowe();
          doWyslania.push({ path: rdzen + ".webp", blob: k.duze.blob }, { path: rdzen + "-min.webp", blob: k.male.blob });
        } catch (e) { bledy.push(pliki[i].name + ": " + e.message); }
      }
      if (doWyslania.length) {
        await zatwierdz({ opis: "Zdjęcia: dodano " + doWyslania.length / 2 + " do biblioteki", pliki: doWyslania, postep: function (t) { status.textContent = t; } });
        doWyslania.forEach(function (p) {
          stan.drzewo.push({ path: p.path, size: p.blob.size });
          stan.lokalneUrl[p.path] = URL.createObjectURL(p.blob);
        });
      }
      status.className = "a-status " + (bledy.length ? "blad" : "ok");
      status.textContent = (doWyslania.length ? "Dodano zdjęcia: " + doWyslania.length / 2 + ". " : "") + (bledy.length ? "Pominięto: " + bledy.join(" ") : "");
      renderBiblioteka();
    } catch (e) {
      status.className = "a-status blad";
      status.textContent = "Nie udało się wysłać zdjęć: " + komunikatBledu(e);
    } finally { stan.zajety = false; }
  }

  async function usunZdjecie(sciezka, min) {
    var wpisy = gdzieUzyte(sciezka);
    var tresc = wpisy.length
      ? "To zdjęcie jest używane we wpisie: " + wpisy.map(function (w) { return "„" + w.tytul + "”"; }).join(", ") + ". Zostanie z niego usunięte."
      : "Zdjęcie zostanie usunięte z biblioteki.";
    if (!(await potwierdz("Usunąć zdjęcie?", tresc, "Usuń zdjęcie"))) return;
    stan.zajety = true;
    toast("Usuwam zdjęcie…", 60000);
    var usun = [sciezka].concat(min ? [min] : []);
    try {
      var wynik = await zatwierdz({
        opis: "Zdjęcia: usunięto " + sciezka.split("/").pop(),
        usun: usun,
        zmienDane: wpisy.length ? function (lista) {
          return lista.map(function (w) {
            if (sciezkiZdjecWpisu(w).indexOf(sciezka) < 0) return w;
            var z = Object.assign({}, w);
            z.galeria = (z.galeria || []).filter(function (g) { return g.src !== sciezka; });
            if (z.zdjecie === sciezka) {
              var nast = z.galeria.shift();
              delete z.zdjecie; delete z.miniatura; delete z.opisZdjecia;
              if (nast) { z.zdjecie = nast.src; if (nast.min) z.miniatura = nast.min; z.opisZdjecia = nast.alt || ""; }
            }
            if (!z.galeria.length) delete z.galeria;
            return z;
          });
        } : null
      });
      if (wynik.dane) stan.dane = wynik.dane;
      stan.drzewo = stan.drzewo.filter(function (f) { return usun.indexOf(f.path) < 0; });
      renderBiblioteka();
      toast("Usunięto zdjęcie.");
    } catch (e) {
      toast("Nie udało się usunąć: " + esc(komunikatBledu(e)), 10000);
    } finally { stan.zajety = false; }
  }

  function otworzWyborZBiblioteki() {
    var zd = zdjeciaBiblioteki();
    var juz = {};
    stan.zdjecia.forEach(function (z) { if (z.src) juz[z.src] = true; });
    var dost = zd.filter(function (z) { return !juz[z.path]; });
    $("#dlg-lista").innerHTML = dost.length ? dost.map(function (z, i) {
      return '<li><label><input type="checkbox" value="' + esc(z.path) + '" data-min="' + esc(z.min) + '"><span class="a-foto"><span class="a-foto__obraz"><img src="' + esc(rawUrl(z.min || z.path)) + '" alt="" loading="lazy"></span>' +
        '<span class="a-foto__tresc"><span class="a-foto__info">' + esc(z.path.split("/").pop()) + "</span></span></span>" +
        '<span class="wizualnie-ukryte">Zdjęcie ' + (i + 1) + "</span></label></li>";
    }).join("") : '<li class="a-pusto">W bibliotece nie ma innych zdjęć. Dodaj je w zakładce „Zdjęcia” albo wybierz pliki z dysku.</li>';
    var d = $("#dialog-biblioteka");
    d.returnValue = "";
    d.showModal();
    d.addEventListener("close", function zamk() {
      d.removeEventListener("close", zamk);
      if (d.returnValue !== "ok") return;
      var wybrane = $$("#dlg-lista input:checked");
      if (!wybrane.length) return;
      wybrane.forEach(function (inp) {
        var alt = "";
        stan.dane.wpisy.some(function (w) {
          if (w.zdjecie === inp.value && w.opisZdjecia) { alt = w.opisZdjecia; return true; }
          return (w.galeria || []).some(function (g) { if (g.src === inp.value && g.alt) { alt = g.alt; return true; } return false; });
        });
        stan.zdjecia.push({ klucz: losowe() + losowe(), stan: "istniejace", src: inp.value, min: inp.dataset.min || "", alt: alt, url: rawUrl(inp.dataset.min || inp.value) });
      });
      stan.brudny = true;
      renderZdjecia(); podglad();
    });
  }

  /* ---------------- zdarzenia ---------------- */
  function init() {
    wypelnijJednostki();
    ustawFormularzLogowania();

    $("#form-logowania").addEventListener("submit", function (e) {
      e.preventDefault();
      var l = $("#login").value.trim(), h = $("#haslo").value, b = $("#blad-logowania");
      if (!l || !h) { b.textContent = "Wpisz login i hasło."; b.hidden = false; (l ? $("#haslo") : $("#login")).focus(); return; }
      zalogujHaslem(l, h);
    });
    $$("[data-pokaz]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pole = document.getElementById(btn.dataset.pokaz), pokaz = pole.type === "password";
        pole.type = pokaz ? "text" : "password";
        btn.textContent = pokaz ? "Ukryj" : "Pokaż";
        btn.setAttribute("aria-pressed", String(pokaz));
      });
    });
    $$("[data-wroc-logowanie]").forEach(function (btn) { btn.addEventListener("click", function () { location.hash = ""; router(); }); });
    $("#form-konfiguracji").addEventListener("submit", function (e) { e.preventDefault(); konfiguruj(); });
    [["#kfg-haslo", "#kfg-sila"], ["#zh-nowe", "#zh-sila"], ["#nk-haslo", "#nk-sila"]].forEach(function (p) {
      $(p[0]).addEventListener("input", function () { $(p[1]).textContent = ocenHaslo(this.value); });
    });
    $("#form-zmiana-hasla").addEventListener("submit", async function (e) {
      e.preventDefault();
      var b = $("#blad-zmiany"); b.hidden = true;
      var stare = $("#zh-stare").value, n1 = $("#zh-nowe").value, n2 = $("#zh-nowe2").value;
      var zle = n1.length < 8 ? "Nowe hasło musi mieć co najmniej 8 znaków." : n1 !== n2 ? "Nowe hasła nie są takie same." : "";
      if (zle) { b.textContent = zle; b.hidden = false; return; }
      try {
        var konto = znajdzKonto(await konfiguracjaZRepo(stan.branch), stan.login);
        var ok = false;
        if (konto) { try { await odszyfrujToken(konto, stare); ok = true; } catch (er) { ok = false; } }
        if (!ok) { b.textContent = "Obecne hasło jest nieprawidłowe."; b.hidden = false; return; }
        var nowe = await zaszyfrujToken(stan.login, n1, stan.token);
        nowe.utworzono = konto.utworzono || nowe.utworzono;
        await zmienKonfiguracje("Panel: zmiana hasła (" + stan.login + ")", function (k) {
          k.konta = k.konta.map(function (x) { return x.login === stan.login ? nowe : x; }); return k;
        });
        ["#zh-stare", "#zh-nowe", "#zh-nowe2"].forEach(function (s) { $(s).value = ""; }); $("#zh-sila").textContent = "";
        toast("Hasło zmienione. Na innych urządzeniach nowe hasło zadziała za 1–2 minuty.", 8000);
      } catch (err) { b.textContent = komunikatBledu(err); b.hidden = false; }
    });
    $("#form-nowe-konto").addEventListener("submit", async function (e) {
      e.preventDefault();
      var b = $("#blad-nowego"); b.hidden = true;
      var login = $("#nk-login").value.trim().toLowerCase(), h1 = $("#nk-haslo").value, h2 = $("#nk-haslo2").value;
      var zle = !LOGIN_RE.test(login) ? "Login: 2–32 znaki — małe litery bez polskich znaków, cyfry, kropka, myślnik." :
        znajdzKonto(KONFIG, login) ? "Takie konto już istnieje." : h1.length < 8 ? "Hasło musi mieć co najmniej 8 znaków." : h1 !== h2 ? "Hasła nie są takie same." : "";
      if (zle) { b.textContent = zle; b.hidden = false; return; }
      try {
        var konto = await zaszyfrujToken(login, h1, stan.token);
        await zmienKonfiguracje("Panel: nowe konto (" + login + ")", function (k) {
          k.konta = k.konta.filter(function (x) { return x.login !== login; }).concat([konto]); return k;
        });
        ["#nk-login", "#nk-haslo", "#nk-haslo2"].forEach(function (s) { $(s).value = ""; }); $("#nk-sila").textContent = "";
        renderKonta();
        toast("Dodano konto „" + esc(login) + "”. Zadziała za 1–2 minuty (po publikacji strony).", 8000);
      } catch (err) { b.textContent = komunikatBledu(err); b.hidden = false; }
    });
    $("#lista-kont").addEventListener("click", async function (e) {
      var u = e.target.closest("[data-usun-konto]"); if (!u) return;
      var login = u.dataset.usunKonto;
      if (!(await potwierdz("Usunąć konto?", "Osoba „" + login + "” nie będzie mogła się zalogować. Uwaga: zna ona token tylko w postaci zaszyfrowanej — jeśli chcesz mieć pewność, wymień też token GitHub.", "Usuń konto"))) return;
      try {
        await zmienKonfiguracje("Panel: usunięto konto (" + login + ")", function (k) { k.konta = k.konta.filter(function (x) { return x.login !== login; }); return k; });
        renderKonta(); toast("Usunięto konto „" + esc(login) + "”.");
      } catch (err) { toast(esc(komunikatBledu(err)), 9000); }
    });
    $("#wyloguj").addEventListener("click", wyloguj);

    $("#szukaj").addEventListener("input", renderLista);
    $("#nowy-wpis").addEventListener("click", function () { location.hash = "nowy"; });
    $("#lista-wpisow").addEventListener("click", function (e) {
      var b = e.target.closest("[data-usun]");
      if (b) usunWpis(b.dataset.usun);
    });

    $("#wroc").addEventListener("click", function () { location.hash = "aktualnosci"; });
    $("#form-wpisu").addEventListener("submit", zapiszWpis);
    $("#form-wpisu").addEventListener("input", function (e) {
      if (e.target.matches("[data-alt]")) {
        var li = e.target.closest("[data-klucz]");
        var z = stan.zdjecia.filter(function (x) { return x.klucz === li.dataset.klucz; })[0];
        if (z) z.alt = e.target.value;
      }
      stan.brudny = true;
      if ($("#status-wpisu").classList.contains("blad")) statusWpisu("");
      podglad();
    });
    $("#f-jednostka").addEventListener("change", podglad);
    $("#pliki-wpis").addEventListener("change", function () { dodajPliki(this.files); this.value = ""; });
    obslugaUpuszczania($("#upuszczanie-wpis"), dodajPliki);
    $("#z-biblioteki").addEventListener("click", otworzWyborZBiblioteki);
    $("#zdjecia-wpisu").addEventListener("click", function (e) {
      var b = e.target.closest("[data-akcja]"); if (!b) return;
      var li = b.closest("[data-klucz]");
      var i = stan.zdjecia.findIndex(function (x) { return x.klucz === li.dataset.klucz; });
      if (i < 0) return;
      var a = b.dataset.akcja, z = stan.zdjecia[i];
      if (a === "usun") { stan.zdjecia.splice(i, 1); if (z.url && z.url.indexOf("blob:") === 0 && !z.zostaw) URL.revokeObjectURL(z.url); }
      else if (a === "lewo" && i > 0) { stan.zdjecia.splice(i, 1); stan.zdjecia.splice(i - 1, 0, z); }
      else if (a === "prawo" && i < stan.zdjecia.length - 1) { stan.zdjecia.splice(i, 1); stan.zdjecia.splice(i + 1, 0, z); }
      else if (a === "glowne") { stan.zdjecia.splice(i, 1); stan.zdjecia.unshift(z); }
      stan.brudny = true;
      if ($("#status-wpisu").classList.contains("blad")) statusWpisu("");
      renderZdjecia(); podglad();
      var cel = $('#zdjecia-wpisu [data-klucz="' + z.klucz + '"] [data-akcja="' + a + '"]') || $('#zdjecia-wpisu [data-klucz="' + z.klucz + '"] input') || $("#pliki-wpis");
      if (cel && !cel.disabled) cel.focus();
    });

    $("#pliki-biblioteka").addEventListener("change", function () { dodajDoBiblioteki(this.files); this.value = ""; });
    obslugaUpuszczania($("#upuszczanie-biblioteka"), dodajDoBiblioteki);
    $("#biblioteka").addEventListener("click", function (e) {
      var k = e.target.closest("[data-kopiuj]");
      if (k) {
        var tekst = k.dataset.kopiuj;
        (navigator.clipboard ? navigator.clipboard.writeText(tekst) : Promise.reject()).then(function () { toast("Skopiowano adres zdjęcia."); }, function () { prompt("Adres zdjęcia:", tekst); });
      }
      var u = e.target.closest("[data-usun-zdjecie]");
      if (u) usunZdjecie(u.dataset.usunZdjecie, u.dataset.min);
    });
    ["bok", "jakosc", "min"].forEach(function (k) {
      $("#ust-" + k).addEventListener("change", function () {
        var v = parseInt(this.value, 10);
        if (isNaN(v)) v = DOMYSLNE_UST[k];
        v = Math.max(parseInt(this.min, 10), Math.min(parseInt(this.max, 10), v));
        this.value = v; ust[k] = v;
        pisz("localStorage", "sosw-admin-ust", JSON.stringify(ust));
      });
    });

    // przywrócenie sesji w tej karcie przeglądarki
    $("#login").value = czytaj("localStorage", "sosw-admin-login") || "";
    var sesja = null;
    try { sesja = JSON.parse(czytaj("sessionStorage", "sosw-admin-sesja")); } catch (e) { sesja = null; }
    if (sesja && sesja.token) {
      if (sesja.branch) stan.branch = sesja.branch;
      uruchomZTokenem(sesja.token, sesja.login).catch(function () { stan.token = null; pisz("sessionStorage", "sosw-admin-sesja", null); router(); });
    } else {
      if (!KONFIG.konta.length && !location.hash) location.hash = "konfiguracja";
      router();
      if (!location.hash || location.hash === "#") ($("#login").value ? $("#haslo") : $("#login")).focus();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
