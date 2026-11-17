# Serwer logowania panelu (Cloudflare Worker) — instrukcja wdrożenia

Panel `admin.html` loguje redaktorów **loginem i kodem z Google Authenticator**.
Kody sprawdza mały serwer na Cloudflare (darmowy plan wystarcza z dużym zapasem).
Serwer przechowuje też token GitHub — dzięki temu token nigdy nie trafia do przeglądarki.

Konfiguracja zajmuje ok. 15 minut i robi się ją **raz**.

```
Przeglądarka (admin.html)  ──login + kod──▶  Cloudflare Worker  ──token GitHub──▶  repozytorium strony
                           ◀──sesja 8 h───                      (tylko dozwolone operacje)
```

---

## 1. Token GitHub dla serwera

1. Zaloguj się na GitHubie na konto właściciela repozytorium (`michalgaweksosw-mmg`).
2. Otwórz: https://github.com/settings/personal-access-tokens/new?name=Serwer%20panelu%20SOSW&description=Cloudflare%20Worker%20panelu%20strony&target_name=michalgaweksosw-mmg&expires_in=365&contents=write
3. **Repository access** → *Only select repositories* → wybierz **www**.
4. **Permissions → Repository permissions → Contents: Read and write** (nic więcej).
5. **Generate token** i skopiuj go (zaczyna się od `github_pat_`). Przyda się w kroku 4.

## 2. Klucze losowe

Potrzebne są dwa długie, losowe ciągi znaków:

- `SESSION_SECRET` — podpisuje sesje (min. 32 znaki),
- `SETUP_KEY` — **klucz administratora**: pozwala dodawać i usuwać redaktorów. Zapisz go w bezpiecznym miejscu (np. w menedżerze haseł).

Najprościej: otwórz `admin.html` przed konfiguracją — panel sam pokaże dwa wylosowane klucze do skopiowania.

## 3. Worker i magazyn KV w Cloudflare

1. Załóż darmowe konto na https://dash.cloudflare.com/sign-up (bez karty płatniczej).
2. **Storage & Databases → KV → Create a namespace** → nazwa: `sosw-panel-uzytkownicy` → **Add**.
3. **Workers & Pages → Create → Create Worker** (szablon „Hello World”) → nazwa: `sosw-panel` → **Deploy**.
4. **Edit code** → usuń przykładowy kod, wklej całą zawartość pliku `_panel-serwer/worker.js` z tego repozytorium → **Deploy**.

## 4. Ustawienia Workera

W Workerze `sosw-panel` → **Settings**:

**Bindings → Add → KV namespace**
- Variable name: `USERS`
- KV namespace: `sosw-panel-uzytkownicy`

**Variables and Secrets → Add** (dla każdej pozycji osobno):

| Nazwa | Typ | Wartość |
|---|---|---|
| `GITHUB_TOKEN` | **Secret** | token z kroku 1 |
| `SESSION_SECRET` | **Secret** | pierwszy losowy klucz |
| `SETUP_KEY` | **Secret** | drugi losowy klucz (klucz administratora) |
| `GITHUB_OWNER` | Text | `michalgaweksosw-mmg` |
| `GITHUB_REPO` | Text | `www` |
| `GITHUB_BRANCH` | Text | `main` |
| `ALLOWED_ORIGINS` | Text | `https://michalgaweksosw-mmg.github.io` |

Zapisz (**Deploy**). Jeśli strona dostanie własną domenę (np. `https://sosw.ostroleka.pl`), dopisz ją do `ALLOWED_ORIGINS` po przecinku.

## 5. Połączenie panelu z serwerem

1. Skopiuj adres Workera z jego strony w Cloudflare — wygląda tak: `https://sosw-panel.TWOJE-KONTO.workers.dev`.
2. Sprawdź, czy działa: otwórz w przeglądarce `https://sosw-panel.TWOJE-KONTO.workers.dev/config` — powinien pokazać nazwę repozytorium.
3. W repozytorium GitHub edytuj plik `assets/js/admin-config.js` i wpisz adres:
   ```js
   window.SOSW_PANEL_API = "https://sosw-panel.TWOJE-KONTO.workers.dev";
   ```
4. Zatwierdź zmianę (Commit) i odczekaj 1–2 minuty.

> Jeśli Worker ma własną domenę (nie `*.workers.dev`), dopisz ją też w `admin.html` w linii `Content-Security-Policy`, w części `connect-src`.

## 6. Pierwszy redaktor (kod QR)

1. Otwórz https://michalgaweksosw-mmg.github.io/www/admin.html → **Jestem administratorem — zarządzaj redaktorami**.
2. Wpisz `SETUP_KEY`.
3. Wpisz login (np. `mgawek`) → **Utwórz kod QR**.
4. Na telefonie: **Google Authenticator → + → Zeskanuj kod QR** → zeskanuj kod z ekranu.
5. Wpisz kod pokazany przez aplikację → **Potwierdź**.
6. Gotowe — wróć do logowania i zaloguj się loginem oraz aktualnym kodem z aplikacji.

Tak samo dodajesz kolejne osoby. Gdy ktoś zmieni lub zgubi telefon: dodaj go ponownie z zaznaczonym
„wygeneruj nowy kod QR” — stary kod przestanie działać. Gdy ktoś odchodzi: **Usuń** przy jego koncie.

---

## Bezpieczeństwo — w skrócie

- Token GitHub jest tylko w ustawieniach Workera (jako Secret). Przeglądarka dostaje wyłącznie 8-godzinną sesję.
- Serwer pozwala tylko na operacje potrzebne panelowi i tylko w repozytorium `www`; nie zmieni ustawień repozytorium ani plików w `.github/` i `_panel-serwer/`.
- 5 błędnych kodów dla jednego loginu = blokada na 15 minut. To samo dla błędnego klucza administratora.
- Ten sam kod nie zadziała dwa razy (ochrona przed podejrzeniem kodu).
- Każda zmiana w repozytorium ma w opisie „Redaktor: login” — widać, kto co zmienił.
- Gdy wyciekłby `SETUP_KEY` — zmień go w ustawieniach Workera. Gdy wyciekłby `SESSION_SECRET` — zmień go (wszyscy zostaną wylogowani).
- Token GitHub wygasa po roku: utwórz nowy (krok 1) i podmień `GITHUB_TOKEN` w ustawieniach Workera.

## Wdrażanie z linii poleceń (opcjonalnie)

```sh
cd _panel-serwer
npx wrangler login
npx wrangler kv namespace create USERS   # wklej id do wrangler.toml
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put SESSION_SECRET
npx wrangler secret put SETUP_KEY
npx wrangler deploy
```
