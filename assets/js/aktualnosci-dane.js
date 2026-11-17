/* ==========================================================================
   AKTUALNOŚCI — dane wpisów.

   Najwygodniej dodawać i edytować wpisy w panelu administratora: /admin.html
   (zdjęcia są tam automatycznie zmniejszane i zapisywane jako WebP).

   Ręczna edycja też jest możliwa — ale zachowaj format JSON:
   klucze i teksty w "podwójnych cudzysłowach", przecinki między wpisami,
   bez przecinka po ostatnim elemencie. Nie usuwaj znaczników DANE-START / DANE-KONIEC.

   Pola wpisu:
     id          – adres wpisu (małe litery, bez polskich znaków, np. "jaselka-2026")
     tytul       – tytuł
     data        – RRRR-MM-DD
     jednostka   – "osrodek" | "przedszkole" | "sp" | "branzowa" | "spdp" | "internat"
     zajawka     – 1–2 zdania na listę wpisów
     tresc       – lista akapitów
     zdjecie     – (opcjonalnie) zdjęcie główne, np. "assets/img/aktualnosci/2026/jaselka-1.webp"
     miniatura   – (opcjonalnie) mniejsza wersja zdjęcia głównego
     opisZdjecia – opis zdjęcia dla osób niewidomych
     galeria     – (opcjonalnie) [{ "src": "...", "min": "...", "alt": "..." }]
   ========================================================================== */

window.SOSW_AKTUALNOSCI = /*DANE-START*/[
  {
    "id": "dzien-edukacji-narodowej-2026",
    "tytul": "Dzień Edukacji Narodowej",
    "data": "2026-10-30",
    "jednostka": "osrodek",
    "zajawka": "Akademia z okazji Dnia Edukacji Narodowej przyniosła mnóstwo radości i wzruszeń, a najwięcej śmiechu wywołała improwizowana szkolna lekcja.",
    "tresc": [
      "W naszej szkole odbyła się wyjątkowa akademia z okazji Dnia Edukacji Narodowej. Spotkanie przyniosło wszystkim uczestnikom wiele radości i wzruszeń.",
      "Najważniejszym punktem programu był pełen humoru spektakl, w którym aktorzy improwizowali szkolną lekcję. Zabawne scenki z życia klasy raz po raz wywoływały salwy śmiechu na widowni."
    ]
  },
  {
    "id": "bohateron-2026",
    "tytul": "BohaterON – pamiętamy o bohaterach Powstania Warszawskiego!",
    "data": "2026-10-28",
    "jednostka": "sp",
    "zajawka": "Po raz kolejny dołączyliśmy do ogólnopolskiej kampanii „BohaterON – włącz historię!”.",
    "tresc": [
      "W tym roku szkolnym ponownie włączyliśmy się w ogólnopolską kampanię „BohaterON – włącz historię!”. Jej celem jest upamiętnienie uczestników Powstania Warszawskiego i przybliżenie młodemu pokoleniu historii naszego kraju.",
      "W działania zaangażowali się uczniowie starszych klas Szkoły Podstawowej."
    ]
  },
  {
    "id": "w-zdrowym-ciele-zdrowy-mozg",
    "tytul": "„W zdrowym ciele zdrowy mózg”",
    "data": "2026-10-28",
    "jednostka": "osrodek",
    "zajawka": "Rozpoczęliśmy innowację pedagogiczną o tym, jak codzienne nawyki wpływają na pracę mózgu i naukę.",
    "tresc": [
      "Rozpoczęliśmy działania w ramach innowacji pedagogicznej SOSW w Ostrołęce „W zdrowym ciele zdrowy mózg”.",
      "Za nami pierwsze pogadanki o tym, jak dobre, codzienne nawyki wpływają na pracę mózgu, koncentrację uwagi, myślenie i naukę."
    ]
  },
  {
    "id": "klocki-mubabao",
    "tytul": "Klocki MuBaBaO, wyobraźnia i dużo dobrej zabawy!",
    "data": "2026-10-07",
    "jednostka": "osrodek",
    "zajawka": "Budowanie z klocków MuBaBaO to świetny sposób na ćwiczenie wyobraźni i wspólną zabawę.",
    "tresc": [
      "Na zajęciach sięgnęliśmy po klocki MuBaBaO. Budowanie rozwija wyobraźnię, sprawność rąk i umiejętność współpracy — a przy tym daje mnóstwo radości."
    ]
  },
  {
    "id": "grzybobranie-po-kurpiowsku-2026",
    "tytul": "Grzybobranie po Kurpiowsku",
    "data": "2026-09-29",
    "jednostka": "osrodek",
    "zajawka": "Nasi podopieczni wzięli udział w kolejnym, organizowanym cyklicznie „Grzybobraniu po Kurpiowsku”.",
    "tresc": [
      "We wtorek, 29 września 2026 r., podopieczni naszego Ośrodka wzięli udział w kolejnym, organizowanym cyklicznie „Grzybobraniu po Kurpiowsku”."
    ]
  },
  {
    "id": "gadki-z-wiki",
    "tytul": "„Gadki z Wiki”",
    "data": "2026-05-14",
    "jednostka": "sp",
    "zajawka": "Spotkanie online Fundacji Dajemy Dzieciom Siłę o bezpieczeństwie młodych ludzi we współczesnym świecie.",
    "tresc": [
      "W czwartek 14 maja 2026 r. uczniowie klas starszych Szkoły Podstawowej oraz Szkoły Przysposabiającej do Pracy wzięli udział w spotkaniu online „Rozmowy z Wiki”, przygotowanym przez Fundację Dajemy Dzieciom Siłę. Tematem było bezpieczeństwo młodych ludzi we współczesnym świecie.",
      "Zainspirowani animacjami z nastoletnią Wiki uczestnicy rozmawiali o tym, jak dbać o bezpieczeństwo własne i innych, jak rozpoznawać sytuacje, które mogą być zagrożeniem, i jak reagować w trudnych chwilach. Szczególną uwagę zwróciliśmy na budowanie odpowiedzialnych postaw."
    ]
  }
]/*DANE-KONIEC*/;
