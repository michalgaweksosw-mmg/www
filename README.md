# Strona internetowa SOSW w Ostrołęce

Nowa strona Specjalnego Ośrodka Szkolno-Wychowawczego im. ks. Jana Twardowskiego w Ostrołęce.
Statyczna strona (HTML + CSS + odrobina JavaScriptu) — działa na GitHub Pages bez żadnej konfiguracji serwera, bazy danych ani wtyczek.

## Uruchomienie na GitHub Pages

1. Wgraj zawartość tego folderu do repozytorium (do katalogu głównego).
2. W repozytorium: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)** → **Save**
3. Po 1–2 minutach strona będzie dostępna pod adresem `https://<nazwa-konta>.github.io/<nazwa-repozytorium>/`.
4. Własna domena (np. `sosw.ostroleka.pl`): w tym samym miejscu wpisz domenę w polu **Custom domain**, a u dostawcy domeny ustaw rekord CNAME wskazujący na `<nazwa-konta>.github.io`. Zaznacz **Enforce HTTPS**.

Stronę można też otworzyć lokalnie — wystarczy dwukrotnie kliknąć `index.html`.

## Panel administratora — `admin.html`

Wpisy i zdjęcia dodaje się w panelu: **`https://<konto>.github.io/<repozytorium>/admin.html`**
(dla obecnej strony: https://michalgaweksosw-mmg.github.io/www/admin.html).

**Co potrafi panel**
- dodawanie, edycja i usuwanie aktualności (tytuł, data, jednostka, zajawka, treść, zdjęcia),
- zdjęcia: przeciągnij albo wybierz z dysku — **JPEG i PNG są automatycznie zamieniane na WebP** w przeglądarce
  (zmniejszenie do 1920 px + miniatura 800 px, jakość 82%; ustawienia w zakładce „Zdjęcia”),
- obrót zdjęć z telefonu jest poprawiany automatycznie, a dane EXIF (w tym lokalizacja GPS) są usuwane,
- biblioteka zdjęć: podgląd wszystkich zdjęć, informacja, w którym wpisie są użyte, usuwanie nieużywanych,
- podgląd karty wpisu na żywo, przypomnienie o opisach zdjęć (dostępność),
- każdy zapis to jeden commit w repozytorium — każdą zmianę można cofnąć w historii na GitHubie.

**Logowanie: login + kod z Google Authenticator**

Redaktor loguje się swoim loginem i 6-cyfrowym kodem z aplikacji Google Authenticator. Konto zakłada administrator
w panelu (**Jestem administratorem — zarządzaj redaktorami**): wpisuje klucz administratora i login, a redaktor skanuje
wyświetlony kod QR telefonem. Sesja trwa 8 godzin.

Kody sprawdza mały serwer na Cloudflare (Worker, darmowy), który przechowuje też token GitHub — token nigdy nie trafia
do przeglądarki. **Jednorazowa konfiguracja serwera: [`_panel-serwer/INSTRUKCJA.md`](_panel-serwer/INSTRUKCJA.md).**
Dopóki serwer nie jest skonfigurowany, panel pokazuje komunikat z instrukcją.

Po zapisaniu zmiany pojawiają się na stronie po ok. 1–2 minutach (tyle trwa publikacja GitHub Pages) — panel sam informuje, gdy wpis jest już widoczny.

**Ręczna edycja** pliku `assets/js/aktualnosci-dane.js` nadal jest możliwa, ale trzeba zachować format JSON
i znaczniki `/*DANE-START*/` / `/*DANE-KONIEC*/` (opis na górze pliku).

## Jak zmienić treść podstron, menu albo dane kontaktowe

Nagłówek, menu i stopka są wspólne dla wszystkich stron, dlatego generuje je skrypt:

- dane kontaktowe, adres dziennika, BIP → góra pliku `_narzedzia/build.py` (sekcja „DANE OŚRODKA”),
- treści podstron → funkcje `strona_...` w tym samym pliku,
- po zmianach uruchom: `python3 _narzedzia/build.py` (Python 3, bez dodatkowych bibliotek).

Drobną poprawkę tekstu na jednej podstronie można też zrobić bezpośrednio w pliku `.html` — ale przy następnym uruchomieniu skryptu zostanie nadpisana, więc lepiej poprawić ją także w `build.py`.

## Do uzupełnienia przed publikacją

Tych rzeczy nie dało się pobrać automatycznie ze starej strony — sprawdź i uzupełnij:

- [ ] **Adres dziennika elektronicznego** — w `build.py` jest `https://uonetplus.vulcan.net.pl/ostroleka`; potwierdź właściwy symbol jednostki.
- [ ] **Logo** — w nagłówku jest tymczasowy znak (rozeta). Oficjalne logo można podmienić w `_narzedzia/grafiki.py` (funkcja `znak`) albo wstawić plik graficzny.
- [ ] **Pliki PDF** w folderze `dokumenty/`: `jadlospis.pdf`, `erasmus-regulamin-uczniowie.pdf`, `erasmus-regulamin-nauczyciele.pdf` (przenieś ze starej strony).
- [ ] **Deklaracja dostępności** (`deklaracja-dostepnosci.html`): daty, osoba kontaktowa, opis dostępności architektonicznej — miejsca oznaczone `[uzupełnij…]`.
- [ ] **Kadra** (strona „O nas”): liczby pracowników pochodzą ze starej strony — zaktualizuj.
- [ ] **Szkoła branżowa**: potwierdź listę zawodów na bieżący rok.
- [ ] **Internat i Stowarzyszenie**: stara strona miała o nich niewiele informacji — warto dopisać szczegóły (godziny, zasady, nazwa stowarzyszenia, KRS).
- [ ] **Aktualności**: przeniesione są skróty 6 ostatnich wpisów. Pełne treści i zdjęcia (za zgodą rodziców) — do uzupełnienia. Starsze wpisy do ewentualnego przeniesienia: „Mamy laureatów!”, „Czytanie na polanie”, „Nikt nie zaprzeczy, że podróże kształcą!”, „Biblioteka. Otwierasz. Odkrywasz”, „Spotkanie z pszczelarzem!”, „Warsztaty historyczne!”, „Słucham, czytam, rozumiem”, „Sensoryczne Walentynki”.
- [ ] **Film o SOSW** ze strony rekrutacji — można osadzić na stronie `rekrutacja.html`.

## Dostępność (WCAG 2.1)

- panel „Ułatwienia dostępu”: większy tekst, wysoki kontrast, podkreślenie linków, większe odstępy, zatrzymanie animacji,
- czcionka Atkinson Hyperlegible Next (dla osób słabowidzących) i Bricolage Grotesque w nagłówkach — obie hostowane lokalnie (bez Google Fonts, zgodnie z RODO),
- pełna obsługa klawiaturą, link „Przejdź do treści”, semantyczne nagłówki i etykiety,
- mapa Google ładuje się dopiero po kliknięciu, strona nie używa cookies.

## Struktura

```
index.html                 strona główna
o-nas.html                 dyrekcja, struktura, kadra, patron
przedszkole.html, szkola-*.html, internat.html
aktualnosci.html           lista wpisów z filtrem
aktualnosc.html?wpis=…     pojedynczy wpis
dla-rodzicow.html, rekrutacja.html, projekty.html, dokumenty.html, kontakt.html
deklaracja-dostepnosci.html, polityka-prywatnosci.html, 404.html
assets/css/style.css       wygląd
assets/js/                 skrypty i dane aktualności (aktualnosci-dane.js)
admin.html                 panel administratora
assets/fonts/              czcionki
assets/img/                grafiki i zdjęcia
dokumenty/                 pliki PDF do pobrania
_narzedzia/                generator stron (Python)
_panel-serwer/             serwer logowania panelu (Cloudflare Worker) + instrukcja
```
