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

**Logowanie: login i hasło**

Strona działa bez serwera, dlatego hasło nie jest „sprawdzane” — **hasło odszyfrowuje token GitHub**, którym panel zapisuje
zmiany. Zaszyfrowany token (AES-GCM, klucz z hasła: PBKDF2-SHA256, 600 000 iteracji) i loginy są w pliku
`assets/js/admin-config.js`. Haseł nigdzie nie zapisujemy.

*Pierwsza konfiguracja (raz):* otwórz `admin.html` — panel sam pokaże ekran konfiguracji. Wklej token GitHub
(fine-grained, tylko repozytorium strony, **Contents: Read and write** — link do formularza jest w panelu), wpisz login
i hasło → **Zapisz konfigurację i zaloguj**. Panel zapisze konfigurację w repozytorium (i usunie pliki po wersji z Cloudflare).

*Konta (zakładka „Konta”):* zmiana własnego hasła, dodawanie i usuwanie kont innych osób.
Gdy token GitHub wygaśnie (po roku), wykonaj konfigurację ponownie z nowym tokenem (link na ekranie logowania).

**Ważne o bezpieczeństwie:** plik z zaszyfrowanym tokenem jest publiczny, więc siła zabezpieczenia = siła hasła.
Krótkie hasło (np. imię + cyfry) da się złamać programem na zwykłym komputerze. Używaj długich haseł
(min. 14 znaków, najlepiej kilka przypadkowych słów). Jeśli podejrzewasz wyciek — usuń token na GitHubie
(*Settings → Developer settings → Personal access tokens*) i wykonaj konfigurację z nowym tokenem.

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
assets/js/                 skrypty, dane aktualności (aktualnosci-dane.js), konta panelu (admin-config.js)
admin.html                 panel administratora
assets/fonts/              czcionki
assets/img/                grafiki i zdjęcia
dokumenty/                 pliki PDF do pobrania
_narzedzia/                generator stron (Python)
```
