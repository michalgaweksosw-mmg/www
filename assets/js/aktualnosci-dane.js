/* ==========================================================================
   AKTUALNOŚCI — tu dodajesz nowe wpisy.

   Jak dodać wpis:
   1. Skopiuj jeden z bloków { ... } poniżej i wklej go NA POCZĄTKU listy
      (najnowsze wpisy u góry; kolejność i tak jest sortowana po dacie).
   2. Uzupełnij pola:
      id        – krótki adres wpisu, małe litery, bez polskich znaków i spacji, np. "jaselka-2026"
      tytul     – tytuł wpisu
      data      – data w formacie RRRR-MM-DD, np. "2026-12-18"
      jednostka – jedna z: "osrodek", "przedszkole", "sp", "branzowa", "spdp", "internat"
      zajawka   – 1–2 zdania widoczne na liście wpisów
      tresc     – akapity tekstu (każdy akapit w osobnym cudzysłowie, oddzielone przecinkami)
      zdjecie   – (opcjonalnie) ścieżka do zdjęcia głównego, np. "assets/img/aktualnosci/jaselka-1.jpg"
      opisZdjecia – (opcjonalnie, ale ważne dla dostępności) krótki opis tego, co widać na zdjęciu
      galeria   – (opcjonalnie) lista dalszych zdjęć: [{ src: "...", alt: "..." }, ...]
   3. Zdjęcia wgraj do folderu assets/img/aktualnosci/ (najlepiej JPG, ok. 1600 px szerokości).
   4. Uważaj na przecinki między blokami i cudzysłowy w tekście (w treści używaj „polskich” cudzysłowów).
   ========================================================================== */

window.SOSW_AKTUALNOSCI = [
  {
    id: "dzien-edukacji-narodowej-2026",
    tytul: "Dzień Edukacji Narodowej",
    data: "2026-10-30",
    jednostka: "osrodek",
    zajawka: "Akademia z okazji Dnia Edukacji Narodowej przyniosła mnóstwo radości i wzruszeń, a najwięcej śmiechu wywołała improwizowana szkolna lekcja.",
    tresc: [
      "W naszej szkole odbyła się wyjątkowa akademia z okazji Dnia Edukacji Narodowej. Spotkanie przyniosło wszystkim uczestnikom wiele radości i wzruszeń.",
      "Najważniejszym punktem programu był pełen humoru spektakl, w którym aktorzy improwizowali szkolną lekcję. Zabawne scenki z życia klasy raz po raz wywoływały salwy śmiechu na widowni."
    ]
  },
  {
    id: "bohateron-2026",
    tytul: "BohaterON – pamiętamy o bohaterach Powstania Warszawskiego!",
    data: "2026-10-28",
    jednostka: "sp",
    zajawka: "Po raz kolejny dołączyliśmy do ogólnopolskiej kampanii „BohaterON – włącz historię!”.",
    tresc: [
      "W tym roku szkolnym ponownie włączyliśmy się w ogólnopolską kampanię „BohaterON – włącz historię!”. Jej celem jest upamiętnienie uczestników Powstania Warszawskiego i przybliżenie młodemu pokoleniu historii naszego kraju.",
      "W działania zaangażowali się uczniowie starszych klas Szkoły Podstawowej."
    ]
  },
  {
    id: "w-zdrowym-ciele-zdrowy-mozg",
    tytul: "„W zdrowym ciele zdrowy mózg”",
    data: "2026-10-28",
    jednostka: "osrodek",
    zajawka: "Rozpoczęliśmy innowację pedagogiczną o tym, jak codzienne nawyki wpływają na pracę mózgu i naukę.",
    tresc: [
      "Rozpoczęliśmy działania w ramach innowacji pedagogicznej SOSW w Ostrołęce „W zdrowym ciele zdrowy mózg”.",
      "Za nami pierwsze pogadanki o tym, jak dobre, codzienne nawyki wpływają na pracę mózgu, koncentrację uwagi, myślenie i naukę."
    ]
  },
  {
    id: "klocki-mubabao",
    tytul: "Klocki MuBaBaO, wyobraźnia i dużo dobrej zabawy!",
    data: "2026-10-07",
    jednostka: "osrodek",
    zajawka: "Budowanie z klocków MuBaBaO to świetny sposób na ćwiczenie wyobraźni i wspólną zabawę.",
    tresc: [
      "Na zajęciach sięgnęliśmy po klocki MuBaBaO. Budowanie rozwija wyobraźnię, sprawność rąk i umiejętność współpracy — a przy tym daje mnóstwo radości."
    ]
  },
  {
    id: "grzybobranie-po-kurpiowsku-2026",
    tytul: "Grzybobranie po Kurpiowsku",
    data: "2026-09-29",
    jednostka: "osrodek",
    zajawka: "Nasi podopieczni wzięli udział w kolejnym, organizowanym cyklicznie „Grzybobraniu po Kurpiowsku”.",
    tresc: [
      "We wtorek, 29 września 2026 r., podopieczni naszego Ośrodka wzięli udział w kolejnym, organizowanym cyklicznie „Grzybobraniu po Kurpiowsku”."
    ]
  },
  {
    id: "gadki-z-wiki",
    tytul: "„Gadki z Wiki”",
    data: "2026-05-14",
    jednostka: "sp",
    zajawka: "Spotkanie online Fundacji Dajemy Dzieciom Siłę o bezpieczeństwie młodych ludzi we współczesnym świecie.",
    tresc: [
      "W czwartek 14 maja 2026 r. uczniowie klas starszych Szkoły Podstawowej oraz Szkoły Przysposabiającej do Pracy wzięli udział w spotkaniu online „Rozmowy z Wiki”, przygotowanym przez Fundację Dajemy Dzieciom Siłę. Tematem było bezpieczeństwo młodych ludzi we współczesnym świecie.",
      "Zainspirowani animacjami z nastoletnią Wiki uczestnicy rozmawiali o tym, jak dbać o bezpieczeństwo własne i innych, jak rozpoznawać sytuacje, które mogą być zagrożeniem, i jak reagować w trudnych chwilach. Szczególną uwagę zwróciliśmy na budowanie odpowiedzialnych postaw."
    ]
  }
];

/* Nazwy i kolory jednostek — nie trzeba zmieniać */
window.SOSW_JEDNOSTKI = {
  osrodek:     { nazwa: "Ośrodek",                          kolor: "#1d5a3b" },
  przedszkole: { nazwa: "Przedszkole",                      kolor: "#f2b705" },
  sp:          { nazwa: "Szkoła Podstawowa",                kolor: "#2e7a50" },
  branzowa:    { nazwa: "Szkoła Branżowa",                  kolor: "#c4303a" },
  spdp:        { nazwa: "Szkoła Przysposabiająca do Pracy", kolor: "#2c5fc4" },
  internat:    { nazwa: "Internat",                         kolor: "#6d48a6" }
};
