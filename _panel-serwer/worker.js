/* ==========================================================================
   Serwer logowania panelu SOSW — Cloudflare Worker
   --------------------------------------------------------------------------
   Co robi:
   - logowanie: login + 6-cyfrowy kod z Google Authenticator (TOTP, RFC 6238)
   - dodawanie redaktorów (kod QR do zeskanowania) — tylko z kluczem administratora
   - wydaje podpisane sesje (8 godzin)
   - pośredniczy w zapisie do GitHuba: token GitHub jest TYLKO tutaj, nigdy w przeglądarce
     i dopuszcza wyłącznie operacje potrzebne panelowi, tylko w jednym repozytorium

   Wymagane ustawienia Workera (Settings → Variables and Secrets / Bindings):
     USERS            – KV namespace (powiązanie)
     GITHUB_TOKEN     – secret: token GitHub (fine-grained, Contents: Read and write, tylko repo strony)
     SESSION_SECRET   – secret: długi losowy ciąg (podpis sesji)
     SETUP_KEY        – secret: klucz administratora (do dodawania/usuwania redaktorów)
     GITHUB_OWNER     – tekst, np. michalgaweksosw-mmg
     GITHUB_REPO      – tekst, np. www
     GITHUB_BRANCH    – tekst (opcjonalnie), np. main
     ALLOWED_ORIGINS  – tekst: adresy, z których działa panel, oddzielone przecinkami,
                        np. https://michalgaweksosw-mmg.github.io
   ========================================================================== */

const WYDAWCA = "SOSW Ostrołęka";
const SESJA_SEKUNDY = 8 * 60 * 60;
const MAKS_PROB = 5;           // nieudane próby logowania…
const BLOKADA_SEKUNDY = 15 * 60; // …po których konto jest blokowane na 15 minut
const LOGIN_RE = /^[a-z0-9][a-z0-9._-]{1,31}$/;

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const dozwolone = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const corsOk = dozwolone.includes(origin);
    const cors = corsOk ? {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Setup-Key",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Expose-Headers": "X-RateLimit-Remaining",
      "Vary": "Origin"
    } : { "Vary": "Origin" };

    if (req.method === "OPTIONS") return new Response(null, { status: corsOk ? 204 : 403, headers: cors });
    // Przeglądarki zawsze wysyłają Origin przy zapytaniach z innej domeny — brak zgody = odmowa.
    if (origin && !corsOk) return json({ message: "Ten adres nie może korzystać z panelu." }, 403, cors);

    try {
      sprawdzKonfiguracje(env);
      const url = new URL(req.url);
      const p = url.pathname.replace(/\/+$/, "") || "/";

      if (p === "/config" && req.method === "GET") {
        return json({ owner: env.GITHUB_OWNER, repo: env.GITHUB_REPO, branch: env.GITHUB_BRANCH || "", issuer: WYDAWCA }, 200, cors);
      }
      if (p === "/login" && req.method === "POST") return json(await logowanie(req, env), 200, cors);
      if (p === "/me" && req.method === "GET") {
        const s = await wymagajSesji(req, env);
        return json({ login: s.login, wygasa: s.exp }, 200, cors);
      }
      if (p.startsWith("/admin/")) return json(await administracja(p, req, env), 200, cors);
      if (p.startsWith("/gh/")) {
        const s = await wymagajSesji(req, env);
        return await proxyGitHub(p.slice(3), url.search, req, env, s, cors);
      }
      return json({ message: "Nie znaleziono." }, 404, cors);
    } catch (e) {
      if (e instanceof Blad) return json({ message: e.message, kod: e.kod }, e.status, cors);
      return json({ message: "Błąd serwera: " + (e && e.message ? e.message : String(e)) }, 500, cors);
    }
  }
};

class Blad extends Error {
  constructor(status, message, kod) { super(message); this.status = status; this.kod = kod || ""; }
}
function json(obj, status, naglowki) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...naglowki } });
}
function sprawdzKonfiguracje(env) {
  const brak = ["GITHUB_TOKEN", "SESSION_SECRET", "SETUP_KEY", "GITHUB_OWNER", "GITHUB_REPO"].filter((k) => !env[k]);
  if (!env.USERS) brak.push("USERS (KV)");
  if (brak.length) throw new Blad(500, "Serwer panelu nie jest skonfigurowany. Brakuje: " + brak.join(", ") + ".", "konfiguracja");
  if (String(env.SESSION_SECRET).length < 32) throw new Blad(500, "SESSION_SECRET musi mieć co najmniej 32 znaki.", "konfiguracja");
}
async function cialo(req) {
  try { return await req.json(); } catch { throw new Blad(400, "Nieprawidłowe dane."); }
}

/* ---------------- kryptografia ---------------- */
const enc = new TextEncoder();
function b64url(bajty) {
  let s = ""; bajty.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function zB64url(t) {
  const s = atob(t.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
async function hmac(alg, kluczBajty, dane) {
  const k = await crypto.subtle.importKey("raw", kluczBajty, { name: "HMAC", hash: alg }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, dane));
}
async function rowneBezpiecznie(a, b) {
  // porównanie w stałym czasie (przez HMAC z losowym kluczem)
  const k = crypto.getRandomValues(new Uint8Array(32));
  const [x, y] = await Promise.all([hmac("SHA-256", k, enc.encode(String(a))), hmac("SHA-256", k, enc.encode(String(b)))]);
  let r = 0; for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i];
  return r === 0;
}

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32(bajty) {
  let bity = 0, wartosc = 0, out = "";
  for (const b of bajty) { wartosc = (wartosc << 8) | b; bity += 8; while (bity >= 5) { out += B32[(wartosc >>> (bity - 5)) & 31]; bity -= 5; } }
  if (bity > 0) out += B32[(wartosc << (5 - bity)) & 31];
  return out;
}
function zBase32(t) {
  const s = t.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bity = 0, wartosc = 0; const out = [];
  for (const c of s) { const i = B32.indexOf(c); if (i < 0) throw new Error("base32"); wartosc = (wartosc << 5) | i; bity += 5; if (bity >= 8) { out.push((wartosc >>> (bity - 8)) & 255); bity -= 8; } }
  return new Uint8Array(out);
}
async function totp(sekret, krok) {
  const licznik = new Uint8Array(8);
  let k = krok;
  for (let i = 7; i >= 0; i--) { licznik[i] = k & 255; k = Math.floor(k / 256); }
  const h = await hmac("SHA-1", zBase32(sekret), licznik);
  const o = h[h.length - 1] & 15;
  const liczba = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(liczba % 1000000).padStart(6, "0");
}
/** Zwraca numer kroku czasowego, dla którego kod pasuje (okno ±1 = ±30 s), albo -1. */
async function sprawdzTotp(sekret, kod, teraz) {
  const krok = Math.floor((teraz || Date.now()) / 30000);
  for (const d of [0, -1, 1]) { if (await rowneBezpiecznie(await totp(sekret, krok + d), kod)) return krok + d; }
  return -1;
}

/* ---------------- sesje ---------------- */
async function utworzSesje(env, login) {
  const exp = Math.floor(Date.now() / 1000) + SESJA_SEKUNDY;
  const tresc = b64url(enc.encode(JSON.stringify({ login, exp })));
  const podpis = b64url(await hmac("SHA-256", enc.encode(env.SESSION_SECRET), enc.encode(tresc)));
  return { sesja: tresc + "." + podpis, exp };
}
async function wymagajSesji(req, env) {
  const a = req.headers.get("Authorization") || "";
  const t = a.startsWith("Bearer ") ? a.slice(7) : "";
  const [tresc, podpis] = t.split(".");
  if (!tresc || !podpis) throw new Blad(401, "Zaloguj się ponownie.", "sesja");
  const oczekiwany = b64url(await hmac("SHA-256", enc.encode(env.SESSION_SECRET), enc.encode(tresc)));
  if (!(await rowneBezpiecznie(oczekiwany, podpis))) throw new Blad(401, "Sesja jest nieprawidłowa. Zaloguj się ponownie.", "sesja");
  let dane;
  try { dane = JSON.parse(new TextDecoder().decode(zB64url(tresc))); } catch { throw new Blad(401, "Zaloguj się ponownie.", "sesja"); }
  if (!dane.exp || dane.exp < Date.now() / 1000) throw new Blad(401, "Sesja wygasła. Zaloguj się ponownie.", "sesja");
  const u = await env.USERS.get("user:" + dane.login, "json");
  if (!u || !u.aktywny) throw new Blad(401, "To konto zostało usunięte.", "sesja");
  return dane;
}

/* ---------------- logowanie ---------------- */
async function logowanie(req, env) {
  const b = await cialo(req);
  const login = String(b.login || "").trim().toLowerCase();
  const kod = String(b.kod || "").replace(/\s/g, "");
  const ogolny = new Blad(401, "Nieprawidłowy login lub kod. Sprawdź, czy godzina w telefonie jest ustawiona automatycznie.", "dane");
  if (!LOGIN_RE.test(login) || !/^\d{6}$/.test(kod)) throw ogolny;

  const kluczProb = "proby:" + login;
  const proby = (await env.USERS.get(kluczProb, "json")) || { n: 0 };
  if (proby.n >= MAKS_PROB) throw new Blad(429, "Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut.", "blokada");

  const u = await env.USERS.get("user:" + login, "json");
  const krok = u && u.aktywny ? await sprawdzTotp(u.sekret, kod) : -1;
  if (krok < 0) {
    await env.USERS.put(kluczProb, JSON.stringify({ n: proby.n + 1 }), { expirationTtl: BLOKADA_SEKUNDY });
    throw ogolny;
  }
  if (krok <= (u.ostatniKrok || 0)) {
    throw new Blad(401, "Ten kod został już użyty. Poczekaj, aż aplikacja pokaże nowy kod (zmienia się co 30 sekund).", "uzyty");
  }
  // ochrona przed ponownym użyciem tego samego kodu
  u.ostatniKrok = krok; u.ostatnieLogowanie = new Date().toISOString();
  await env.USERS.put("user:" + login, JSON.stringify(u));
  if (proby.n) await env.USERS.delete(kluczProb);
  const s = await utworzSesje(env, login);
  return { sesja: s.sesja, wygasa: s.exp, login };
}

/* ---------------- administracja redaktorami (klucz administratora) ---------------- */
async function wymagajKluczaAdmina(req, env) {
  const ip = req.headers.get("CF-Connecting-IP") || "brak";
  const kluczProb = "proby-admin:" + ip;
  const proby = (await env.USERS.get(kluczProb, "json")) || { n: 0 };
  if (proby.n >= MAKS_PROB) throw new Blad(429, "Zbyt wiele błędnych kluczy. Spróbuj ponownie za 15 minut.", "blokada");
  const podany = req.headers.get("X-Setup-Key") || "";
  if (!podany || !(await rowneBezpiecznie(podany, env.SETUP_KEY))) {
    await env.USERS.put(kluczProb, JSON.stringify({ n: proby.n + 1 }), { expirationTtl: BLOKADA_SEKUNDY });
    throw new Blad(403, "Nieprawidłowy klucz administratora.", "klucz");
  }
}

async function administracja(p, req, env) {
  await wymagajKluczaAdmina(req, env);

  if (p === "/admin/users" && req.method === "GET") {
    const lista = await env.USERS.list({ prefix: "user:" });
    const out = [];
    for (const k of lista.keys) {
      const u = await env.USERS.get(k.name, "json");
      if (u) out.push({ login: k.name.slice(5), aktywny: !!u.aktywny, utworzono: u.utworzono, ostatnieLogowanie: u.ostatnieLogowanie || null });
    }
    return { uzytkownicy: out };
  }

  const b = await cialo(req);
  const login = String(b.login || "").trim().toLowerCase();
  if (!LOGIN_RE.test(login)) throw new Blad(400, "Login: 2–32 znaki, małe litery, cyfry, kropka, myślnik lub podkreślnik.");

  if (p === "/admin/start" && req.method === "POST") {
    const istniejacy = await env.USERS.get("user:" + login, "json");
    if (istniejacy && istniejacy.aktywny && !b.nadpisz) throw new Blad(409, "Redaktor o tym loginie już istnieje. Zaznacz „wygeneruj nowy kod QR”, jeśli zgubił telefon.", "istnieje");
    const sekret = base32(crypto.getRandomValues(new Uint8Array(20)));
    await env.USERS.put("oczekuje:" + login, JSON.stringify({ sekret }), { expirationTtl: 15 * 60 });
    const etykieta = encodeURIComponent(WYDAWCA + ":" + login);
    const otpauth = "otpauth://totp/" + etykieta + "?secret=" + sekret + "&issuer=" + encodeURIComponent(WYDAWCA) + "&algorithm=SHA1&digits=6&period=30";
    return { login, sekret, otpauth };
  }

  if (p === "/admin/potwierdz" && req.method === "POST") {
    const o = await env.USERS.get("oczekuje:" + login, "json");
    if (!o) throw new Blad(410, "Kod QR wygasł (ważny 15 minut). Wygeneruj nowy.", "wygaslo");
    const krok = await sprawdzTotp(o.sekret, String(b.kod || "").replace(/\s/g, ""));
    if (krok < 0) throw new Blad(400, "Kod się nie zgadza. Wpisz aktualny kod z aplikacji i sprawdź godzinę w telefonie.", "kod");
    const poprzedni = await env.USERS.get("user:" + login, "json");
    await env.USERS.put("user:" + login, JSON.stringify({
      sekret: o.sekret, aktywny: true, ostatniKrok: 0,
      utworzono: poprzedni && poprzedni.utworzono ? poprzedni.utworzono : new Date().toISOString()
    }));
    await env.USERS.delete("oczekuje:" + login);
    await env.USERS.delete("proby:" + login);
    return { ok: true, login };
  }

  if (p === "/admin/usun" && req.method === "POST") {
    await env.USERS.delete("user:" + login);
    return { ok: true, login };
  }
  throw new Blad(404, "Nie znaleziono.");
}

/* ---------------- pośrednik GitHub (tylko dozwolone operacje) ---------------- */
const DOZWOLONE = [
  ["GET", /^$/],
  ["GET", /^\/contents\/[^?]+$/],
  ["GET", /^\/git\/trees\/[^/]+$/],
  ["GET", /^\/git\/ref\/heads\/[^/]+$/],
  ["GET", /^\/git\/commits\/[0-9a-f]{40}$/],
  ["POST", /^\/git\/blobs$/],
  ["POST", /^\/git\/trees$/],
  ["POST", /^\/git\/commits$/],
  ["PATCH", /^\/git\/refs\/heads\/[^/]+$/]
];

async function proxyGitHub(sciezka, query, req, env, sesja, cors) {
  // sciezka: "/repo/…" — zawsze w repozytorium z konfiguracji
  if (!sciezka.startsWith("/repo")) throw new Blad(404, "Nie znaleziono.");
  const reszta = sciezka.slice(5);
  if (reszta.includes("..")) throw new Blad(400, "Nieprawidłowa ścieżka.");
  if (!DOZWOLONE.some(([m, re]) => m === req.method && re.test(reszta))) throw new Blad(403, "Ta operacja nie jest dozwolona w panelu.");

  let body;
  if (req.method !== "GET") {
    body = await cialo(req);
    if (reszta === "/git/commits") {
      // podpis redaktora w opisie zmiany — ślad, kto co zmienił
      body = { message: String(body.message || "Zmiana z panelu").slice(0, 500) + "\n\nRedaktor: " + sesja.login + " (panel strony)", tree: body.tree, parents: body.parents };
    }
    if (reszta.startsWith("/git/refs/heads/")) body = { sha: body.sha, force: false };
    if (reszta === "/git/trees") {
      // zapis tylko w plikach strony, nie w konfiguracji repozytorium
      for (const e of body.tree || []) {
        if (typeof e.path !== "string" || e.path.startsWith(".github/") || e.path.startsWith("_panel-serwer/") || e.path.includes("..")) {
          throw new Blad(403, "Panel nie może zmieniać pliku: " + e.path);
        }
      }
    }
  }
  const cel = "https://api.github.com/repos/" + encodeURIComponent(env.GITHUB_OWNER) + "/" + encodeURIComponent(env.GITHUB_REPO) + reszta + (query || "");
  const odp = await fetch(cel, {
    method: req.method,
    headers: {
      Authorization: "Bearer " + env.GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sosw-panel-worker",
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let tekst = await odp.text();
  if (reszta === "" && odp.ok) {
    // panel potrzebuje tylko kilku pól repozytorium
    const r = JSON.parse(tekst);
    tekst = JSON.stringify({ default_branch: r.default_branch, permissions: { push: !!(r.permissions && r.permissions.push) } });
  }
  const st = odp.status === 401 ? 502 : odp.status; // 401 od GitHuba = zły token na serwerze, nie zła sesja
  const msg = odp.status === 401 ? JSON.stringify({ message: "Token GitHub na serwerze panelu jest nieprawidłowy albo wygasł. Administrator musi go wymienić w ustawieniach Workera." }) : tekst;
  return new Response(msg, {
    status: st,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-RateLimit-Remaining": odp.headers.get("x-ratelimit-remaining") || "", ...cors }
  });
}
