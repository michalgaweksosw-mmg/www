# -*- coding: utf-8 -*-
"""
Generator strony SOSW w Ostrołęce.

Wspólne elementy (nagłówek, menu, stopka) są zdefiniowane tutaj raz,
a skrypt zapisuje gotowe pliki .html w katalogu głównym repozytorium.

Uruchomienie (z katalogu głównego repozytorium):
    python3 _narzedzia/build.py

Treść podstron jest w tym pliku (funkcje strona_*). Aktualności NIE wymagają
uruchamiania skryptu — dodaje się je w pliku assets/js/aktualnosci-dane.js.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from grafiki import leluja, znak, favicon, biedronka, galazka, mapa_tlo  # noqa: E402
from ikony import ikona  # noqa: E402

KATALOG = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ---------------------------------------------------------------------------
# DANE OŚRODKA — zmieniaj tutaj
# ---------------------------------------------------------------------------
NAZWA = "Specjalny Ośrodek Szkolno-Wychowawczy im. ks. Jana Twardowskiego w Ostrołęce"
NAZWA_KROTKA = "SOSW w Ostrołęce"
ULICA = "ul. gen. Romualda Traugutta 9"
KOD_MIASTO = "07-410 Ostrołęka"
TEL = "29 760 22 37"
TEL_HREF = "tel:+48297602237"
FAX = "29 760 22 37"
EMAIL = "sekretariat@sosw.ostroleka.pl"
IOD_OSOBA = "Tomasz Grondwald"
IOD_EMAIL = "iod@sosw.ostroleka.pl"
BIP = "https://www.e-bip.org.pl/soswostroleka"
# UWAGA: sprawdź właściwy adres dziennika (symbol jednostki w UONET+)
DZIENNIK = "https://uonetplus.vulcan.net.pl/ostroleka"
MAPA_EMBED = "https://maps.google.com/maps?q=ul.%20gen.%20Romualda%20Traugutta%209%2C%2007-410%20Ostro%C5%82%C4%99ka&z=16&output=embed"
MAPA_LINK = "https://www.openstreetmap.org/search?query=Traugutta%209%2C%20Ostro%C5%82%C4%99ka"
ADRES_STRONY = "https://sosw.ostroleka.pl/"
ROK = "2026"

JEDNOSTKI = [
    # klucz, plik, nazwa, krótko, ikona, klasa
    ("przedszkole", "przedszkole.html", "Przedszkole Specjalne",
     "Dla dzieci z orzeczeniem o potrzebie kształcenia specjalnego. Od poniedziałku do piątku, 7.30–15.30, w małych grupach.",
     "slonce", "przedszkole", "var(--c-przedszkole)"),
    ("sp", "szkola-podstawowa.html", "Szkoła Podstawowa Specjalna",
     "Klasy I–VIII dla uczniów z niepełnosprawnością intelektualną w stopniu lekkim, umiarkowanym lub znacznym oraz z niepełnosprawnościami sprzężonymi.",
     "ksiazka", "sp", "var(--c-sp)"),
    ("branzowa", "szkola-branzowa.html", "Branżowa Szkoła Specjalna I stopnia",
     "Nauka zawodu dla młodzieży z niepełnosprawnością intelektualną w stopniu lekkim.",
     "czapka", "branzowa", "var(--c-branzowa)"),
    ("spdp", "szkola-przysposabiajaca-do-pracy.html", "Szkoła Specjalna Przysposabiająca do Pracy",
     "Trzyletnia szkoła dla młodzieży z niepełnosprawnością intelektualną w stopniu umiarkowanym lub znacznym — samodzielność i przygotowanie do pracy.",
     "narzedzia", "spdp", "var(--c-spdp)"),
    ("internat", "internat.html", "Internat",
     "Część mieszkalna Ośrodka — opieka wychowawców, nauka własna i zajęcia popołudniowe.",
     "ksiezyc", "internat", "var(--c-internat)"),
]

MENU = [
    ("Ośrodek", "osrodek", [
        ("O nas", "o-nas.html", None),
        ("Patron", "o-nas.html#patron", None),
        ("Projekty i innowacje", "projekty.html", None),
        ("Dokumenty", "dokumenty.html", None),
    ]),
    ("Nasze szkoły", "szkoly", [(j[2], j[1], j[6]) for j in JEDNOSTKI]),
    ("Aktualności", "aktualnosci.html", None),
    ("Dla rodziców", "rodzice", [
        ("Informacje dla rodziców", "dla-rodzicow.html", None),
        ("Rekrutacja", "rekrutacja.html", None),
        ("Jadłospis", "dla-rodzicow.html#jadlospis", None),
        ("Doradztwo zawodowe", "dla-rodzicow.html#doradztwo", None),
    ]),
    ("Kontakt", "kontakt.html", None),
]


# ---------------------------------------------------------------------------
# SZABLON
# ---------------------------------------------------------------------------
def pasek_gorny():
    return f'''
<div class="pasek-gorny">
  <div class="kontener">
    <ul class="pasek-gorny__kontakt">
      <li>{ikona("telefon")}<a href="{TEL_HREF}">{TEL}</a></li>
      <li>{ikona("mail")}<a href="mailto:{EMAIL}">{EMAIL}</a></li>
    </ul>
    <ul class="pasek-gorny__linki">
      <li><a href="{BIP}" rel="noopener">BIP</a></li>
      <li><a href="deklaracja-dostepnosci.html">Deklaracja dostępności</a></li>
      <li><button type="button" class="przycisk-ulatwien" aria-expanded="false" aria-controls="ulatwienia">{ikona("dostepnosc")}Ułatwienia dostępu</button></li>
    </ul>
  </div>
</div>
<div class="ulatwienia" id="ulatwienia" role="dialog" aria-modal="false" aria-labelledby="ulatwienia-tytul" hidden>
  <h2 id="ulatwienia-tytul">Ułatwienia dostępu</h2>
  <button type="button" class="ulatwienia__zamknij" data-zamknij aria-label="Zamknij panel ułatwień">{ikona("zamknij")}</button>
  <p class="wizualnie-ukryte">Ustawienia są zapamiętywane w tej przeglądarce.</p>
  <div class="ulatwienia__grupa" role="group" aria-label="Wielkość tekstu">
    <button type="button" data-skala="1" aria-pressed="true" aria-label="Tekst domyślny">A</button>
    <button type="button" data-skala="2" aria-pressed="false" aria-label="Tekst większy" style="font-size:1.2rem">A+</button>
    <button type="button" data-skala="3" aria-pressed="false" aria-label="Tekst największy" style="font-size:1.4rem">A++</button>
  </div>
  <div class="ulatwienia__grupa ulatwienia__grupa--2">
    <button type="button" data-tryb="kontrast" aria-pressed="false">Wysoki kontrast</button>
    <button type="button" data-tryb="podkresl-linki" aria-pressed="false">Podkreśl linki</button>
    <button type="button" data-tryb="odstepy" aria-pressed="false">Większe odstępy w tekście</button>
    <button type="button" data-tryb="bez-animacji" aria-pressed="false">Zatrzymaj animacje</button>
    <button type="button" class="ulatwienia__reset" data-reset>Przywróć ustawienia domyślne</button>
  </div>
</div>'''


def menu_html(aktywne, plik):
    out = ['<ul class="menu">']
    for i, (etykieta, klucz, pod) in enumerate(MENU):
        if pod is None:
            cur = ' aria-current="page"' if klucz == plik else ""
            out.append(f'<li><a class="menu__link" href="{klucz}"{cur}>{etykieta}</a></li>')
        else:
            pid = f"podmenu-{klucz}"
            akt = " jest-aktywne" if aktywne == klucz else ""
            out.append(
                f'<li><button type="button" class="menu__rozwin{akt}" aria-expanded="false" aria-controls="{pid}">'
                f'{etykieta}{ikona("dol")}</button><ul class="podmenu" id="{pid}" hidden>'
            )
            for (e, href, kolor) in pod:
                cur = ' aria-current="page"' if href == plik else ""
                kropka = f'<span class="kropka" style="--k:{kolor}" aria-hidden="true"></span>' if kolor else ""
                out.append(f'<li><a href="{href}"{cur}>{kropka}{e}</a></li>')
            out.append("</ul></li>")
    out.append("</ul>")
    return "".join(out)


def marka(pelna=True):
    return f'''<a class="marka" href="index.html" aria-label="{NAZWA} — strona główna">
      {znak()}
      <span class="marka__tekst"><span class="marka__skrot">SOSW</span>{'<span class="marka__pelna">im. ks. Jana Twardowskiego w Ostrołęce</span>' if pelna else ''}</span>
    </a>'''


def naglowek(aktywne, plik):
    return f'''
<header class="naglowek">
  <div class="kontener">
    {marka()}
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="nawigacja">{ikona("menu")}Menu</button>
    <nav class="nawigacja" id="nawigacja" aria-label="Menu główne">
      <button type="button" class="menu-toggle nawigacja__zamknij" aria-label="Zamknij menu">{ikona("zamknij")}Zamknij</button>
      {menu_html(aktywne, plik)}
      <a class="btn btn--glowny dziennik-btn dziennik-btn--menu" href="{DZIENNIK}" rel="noopener">{ikona("dziennik")}Dziennik elektroniczny</a>
    </nav>
    <a class="btn btn--glowny dziennik-btn dziennik-btn--naglowek" href="{DZIENNIK}" rel="noopener">{ikona("dziennik")}Dziennik</a>
  </div>
</header>
<div class="tlo-menu" hidden></div>'''


def stopka(tlo):
    brzeg = ('<svg class="stopka__brzeg" viewBox="0 0 1200 28" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
             '<path fill="currentColor" d="M0 28V14' + "".join(f" q15 -14 30 0" for _ in range(40)) + 'V28Z"/></svg>')
    szkoly = "".join(f'<li><a href="{j[1]}">{j[2]}</a></li>' for j in JEDNOSTKI)
    return f'''
<footer class="stopka" style="--tlo-nad-stopka:{tlo}">
  {brzeg}
  <div class="kontener">
    <div>
      {marka()}
      <address>
        {NAZWA.replace(" im. ", "<br>im. ")}<br>
        {ULICA}, {KOD_MIASTO}<br>
        tel./fax <a href="{TEL_HREF}">{TEL}</a><br>
        <a href="mailto:{EMAIL}">{EMAIL}</a>
      </address>
    </div>
    <nav aria-label="Nasze szkoły — stopka">
      <h2>Nasze szkoły</h2>
      <ul>{szkoly}</ul>
    </nav>
    <nav aria-label="Na skróty — stopka">
      <h2>Na skróty</h2>
      <ul>
        <li><a href="aktualnosci.html">Aktualności</a></li>
        <li><a href="rekrutacja.html">Rekrutacja</a></li>
        <li><a href="dla-rodzicow.html#jadlospis">Jadłospis</a></li>
        <li><a href="{DZIENNIK}" rel="noopener">Dziennik elektroniczny</a></li>
        <li><a href="dokumenty.html">Dokumenty</a></li>
      </ul>
    </nav>
    <nav aria-label="Informacje prawne — stopka">
      <h2>Informacje</h2>
      <ul>
        <li><a href="{BIP}" rel="noopener">Biuletyn Informacji Publicznej</a></li>
        <li><a href="deklaracja-dostepnosci.html">Deklaracja dostępności</a></li>
        <li><a href="polityka-prywatnosci.html">RODO i prywatność</a></li>
        <li><a href="kontakt.html">Kontakt</a></li>
      </ul>
    </nav>
  </div>
  <div class="stopka__dol">
    <div class="kontener">
      <p>© {ROK} {NAZWA_KROTKA}</p>
      <p>Ilustracje: motywy inspirowane kurpiowską wycinanką</p>
    </div>
  </div>
</footer>
<button type="button" class="do-gory" aria-label="Wróć na górę strony">{ikona("gora")}</button>'''


def strona(plik, tytul, opis, tresc, aktywne=None, skrypty=(), tlo_stopki="#fff", glowna=False):
    pelny_tytul = f"{NAZWA_KROTKA} — {NAZWA}" if glowna else f"{tytul} — {NAZWA_KROTKA}"
    js = "".join(f'\n<script src="assets/js/{s}" defer></script>' for s in skrypty)
    html = f'''<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{pelny_tytul}</title>
<meta name="description" content="{opis}">
<meta name="theme-color" content="#1d5a3b">
<meta property="og:type" content="website">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="{pelny_tytul}">
<meta property="og:description" content="{opis}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/bricolage-grotesque-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/atkinson-hyperlegible-next-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
<script src="assets/js/main.js" defer></script>{js}
</head>
<body>
<a class="przeskocz" href="#tresc">Przejdź do treści</a>
{pasek_gorny()}
{naglowek(aktywne, plik)}
<main id="tresc" tabindex="-1">
{tresc}
</main>
{stopka(tlo_stopki)}
</body>
</html>
'''
    with open(os.path.join(KATALOG, plik), "w", encoding="utf-8") as f:
        f.write(html)
    print("zapisano", plik)


def naglowek_strony(tytul, lead="", okruszki=(), kolor="var(--bor)", ornament=True):
    ok = '<li><a href="index.html">Strona główna</a></li>' + "".join(
        f'<li><a href="{h}">{e}</a></li>' if h else f'<li aria-current="page">{e}</li>' for e, h in okruszki
    )
    return f'''
<div class="naglowek-strony naglowek-strony--kolor" style="--k:{kolor}">
  <div class="kontener">
    <div>
      <nav class="okruszki" aria-label="Jesteś tutaj"><ol>{ok}</ol></nav>
      <h1>{tytul}</h1>
      {f'<p class="lead">{lead}</p>' if lead else ''}
    </div>
    {galazka() if ornament else ''}
  </div>
</div>'''


def ramka_kontakt(kolor="var(--bor)"):
    return f'''
<section class="ramka" style="--k:{kolor}" aria-labelledby="ramka-kontakt">
  <h2 id="ramka-kontakt">Masz pytania?</h2>
  <p>Sekretariat chętnie odpowie i umówi Cię na rozmowę.</p>
  <dl>
    <div><dt>Telefon</dt><dd><a href="{TEL_HREF}">{TEL}</a></dd></div>
    <div><dt>E-mail</dt><dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd></div>
    <div><dt>Adres</dt><dd>{ULICA}<br>{KOD_MIASTO}</dd></div>
  </dl>
</section>'''


def ramka_szkoly(obecna):
    li = "".join(
        f'<li><a href="{j[1]}"{" aria-current=" + chr(34) + "page" + chr(34) if j[1] == obecna else ""}>'
        f'<span class="kropka" style="--k:{j[6]}" aria-hidden="true"></span>{j[2]}</a></li>'
        for j in JEDNOSTKI)
    return f'''
<nav class="ramka" aria-labelledby="ramka-szkoly">
  <h2 id="ramka-szkoly">Nasze szkoły</h2>
  <ul class="podmenu" style="position:static;box-shadow:none;padding:0;min-width:0">{li}</ul>
</nav>'''


def lista_ptaszki(pozycje):
    return '<ul class="lista-ptaszki">' + "".join(f"<li>{p}</li>" for p in pozycje) + "</ul>"


# ---------------------------------------------------------------------------
# STRONA GŁÓWNA
# ---------------------------------------------------------------------------
def strona_glowna():
    jednostki = "".join(f'''
      <li class="jednostka jednostka--{j[5]}">
        <a href="{j[1]}">
          {ikona(j[4], "jednostka__ikona")}
          <h3>{j[2]}</h3>
          <p>{j[3]}</p>
          <span class="jednostka__strzalka" aria-hidden="true">{ikona("strzalka")}</span>
        </a>
      </li>''' for j in JEDNOSTKI)

    tresc = f'''
<section class="hero" aria-labelledby="hero-tytul">
  <div class="kontener">
    <div class="hero__tekst">
      <p class="hero__nazwa"><strong>Specjalny Ośrodek Szkolno-Wychowawczy</strong> im. ks. Jana Twardowskiego w Ostrołęce</p>
      <h1 id="hero-tytul">Każde dziecko rośnie we własnym tempie</h1>
      <p class="hero__lead">Przedszkole, szkoły i internat dla dzieci i młodzieży z niepełnosprawnością intelektualną. Uczymy w małych grupach, według indywidualnych programów, w atmosferze życzliwości i bezpieczeństwa.</p>
      <div class="hero__akcje">
        <a class="btn btn--glowny" href="#szkoly">Poznaj nasze szkoły</a>
        <a class="btn btn--obrys" href="rekrutacja.html">Jak zapisać dziecko</a>
      </div>
    </div>
    <div class="hero__ilustracja">{leluja()}</div>
  </div>
</section>

<nav class="skroty" aria-label="Najczęściej odwiedzane">
  <div class="kontener">
    <ul>
      <li><a href="{DZIENNIK}" rel="noopener">{ikona("dziennik")}<strong>Dziennik elektroniczny</strong><span>Oceny, frekwencja, wiadomości</span></a></li>
      <li><a href="dla-rodzicow.html#jadlospis">{ikona("talerz")}<strong>Jadłospis</strong><span>Posiłki w tym tygodniu</span></a></li>
      <li><a href="rekrutacja.html">{ikona("zapisy")}<strong>Rekrutacja</strong><span>Zapisy przez cały rok</span></a></li>
      <li><a href="kontakt.html">{ikona("telefon")}<strong>Kontakt</strong><span>tel. {TEL}</span></a></li>
    </ul>
  </div>
</nav>

<section class="sekcja" id="szkoly" aria-labelledby="szkoly-tytul">
  <div class="kontener">
    <div class="sekcja__naglowek">
      <div>
        <h2 id="szkoly-tytul">Nasze szkoły</h2>
        <p>W jednym miejscu dziecko może przejść całą drogę — od przedszkola, przez szkołę podstawową, po naukę zawodu i przygotowanie do pracy.</p>
      </div>
    </div>
    <ul class="jednostki">{jednostki}
    </ul>
  </div>
</section>

<section class="sekcja sekcja--tlo" aria-labelledby="praca-tytul">
  <div class="kontener">
    <div class="sekcja__naglowek"><div><h2 id="praca-tytul">Jak pracujemy</h2>
      <p>Każdy uczeń ma swój plan nauki i terapii, przygotowany przez zespół nauczycieli i specjalistów razem z rodzicami.</p></div></div>
    <ul class="kafle">
      <li><h3>{ikona("puzzle")}Indywidualny program</h3><p>Indywidualny Program Edukacyjno-Terapeutyczny (IPET) dopasowany do możliwości i potrzeb każdego ucznia.</p></li>
      <li><h3>{ikona("serce")}Rewalidacja i terapia</h3><p>Terapia mowy i komunikacji, integracja sensoryczna, usprawnianie funkcji percepcyjno-motorycznych.</p></li>
      <li><h3>{ikona("zmysly")}Sale terapeutyczne</h3><p>Sala Doświadczania Świata, sala integracji sensorycznej, tablice interaktywne i programy multimedialne.</p></li>
      <li><h3>{ikona("grupa")}Pomoc psychologiczno-pedagogiczna</h3><p>Wsparcie psychologa i pedagogów — dla uczniów i dla rodziców.</p></li>
    </ul>
  </div>
</section>

<section class="sekcja" aria-labelledby="akt-tytul">
  <div class="kontener">
    <div class="sekcja__naglowek">
      <div><h2 id="akt-tytul">Co u nas słychać</h2></div>
      <a class="link-wiecej" href="aktualnosci.html">Wszystkie aktualności</a>
    </div>
    <div class="aktualnosci-uklad" id="aktualnosci-glowna">
      <p>Wczytywanie aktualności… Jeśli lista się nie pojawi, przejdź do strony <a href="aktualnosci.html">Aktualności</a>.</p>
    </div>
  </div>
</section>

<section class="patron" aria-labelledby="patron-tytul">
  <div class="kontener">
    {biedronka()}
    <div>
      <h2 id="patron-tytul">Nasz patron — ks. Jan Twardowski</h2>
      <p>Kapłan i jeden z najbardziej lubianych polskich poetów (1915–2006). Pisał prostymi słowami o miłości, przyrodzie i o tym, co małe i łatwe do przeoczenia. Nazywano go „księdzem od biedronki”.</p>
      <p>Jego uważność na drugiego człowieka jest dla nas wskazówką w codziennej pracy z dziećmi.</p>
      <p><a href="o-nas.html#patron">Więcej o patronie</a></p>
    </div>
  </div>
</section>

<section class="sekcja" aria-labelledby="rek-tytul">
  <div class="kontener">
    <div class="rekrutacja-pas">
      <div class="sekcja__naglowek"><div>
        <h2 id="rek-tytul">Rekrutacja trwa przez cały rok</h2>
        <p>Dziecko można zapisać w dowolnym momencie roku szkolnego. Tak wygląda droga do naszego Ośrodka:</p>
      </div></div>
      {kroki_rekrutacji()}
      <div class="rekrutacja-pas__akcje">
        <a class="btn btn--slonce" href="rekrutacja.html">Szczegóły rekrutacji</a>
        <a class="btn btn--obrys" href="{TEL_HREF}">{ikona("telefon")}Zadzwoń: {TEL}</a>
      </div>
    </div>
  </div>
</section>

{sekcja_kontakt("sekcja--jasna")}
'''
    strona("index.html", "Strona główna",
           "Przedszkole, szkoła podstawowa, szkoła branżowa, szkoła przysposabiająca do pracy i internat dla dzieci i młodzieży z niepełnosprawnością intelektualną w Ostrołęce.",
           tresc, skrypty=("aktualnosci-dane.js", "aktualnosci.js"), tlo_stopki="var(--papier-3)", glowna=True)


def kroki_rekrutacji():
    return '''<ol class="kroki">
        <li><h3>Rozmowa</h3><p>Zadzwoń lub przyjdź do sekretariatu. Opowiedz o dziecku i umów się na wizytę.</p></li>
        <li><h3>Orzeczenie</h3><p>Potrzebne jest orzeczenie o potrzebie kształcenia specjalnego z poradni psychologiczno-pedagogicznej.</p></li>
        <li><h3>Skierowanie</h3><p>Na Twój wniosek organ prowadzący (dla Ostrołęki — Prezydent Miasta) wskazuje placówkę.</p></li>
        <li><h3>Pierwszy dzień</h3><p>Składasz dokumenty, poznajecie wychowawcę i specjalistów, a dziecko spokojnie wchodzi w nowy rytm.</p></li>
      </ol>'''


def sekcja_kontakt(klasa=""):
    return f'''
<section class="sekcja {klasa}" aria-labelledby="kontakt-tytul">
  <div class="kontener kontakt-uklad">
    <div>
      <h2 id="kontakt-tytul">Jak do nas trafić</h2>
      <ul class="dane-kontaktowe">
        <li><span class="ikona">{ikona("pinezka")}</span><span><small>Adres</small><b>{ULICA}<br>{KOD_MIASTO}</b></span></li>
        <li><span class="ikona">{ikona("telefon")}</span><span><small>Telefon i faks</small><a href="{TEL_HREF}">{TEL}</a></span></li>
        <li><span class="ikona">{ikona("mail")}</span><span><small>E-mail sekretariatu</small><a href="mailto:{EMAIL}">{EMAIL}</a></span></li>
      </ul>
      <a class="btn btn--obrys" href="kontakt.html">Wszystkie dane kontaktowe</a>
    </div>
    {mapa()}
  </div>
</section>'''


def mapa():
    return f'''<div class="mapa">
      <div class="mapa__zgoda">
        {mapa_tlo()}
        <button type="button" class="btn btn--glowny" data-mapa="{MAPA_EMBED}">{ikona("pinezka")}Pokaż mapę</button>
        <p>Mapa pochodzi z serwisu Google Maps — wczytamy ją dopiero po kliknięciu. Możesz też <a href="{MAPA_LINK}" rel="noopener">otworzyć lokalizację w OpenStreetMap</a>.</p>
      </div>
    </div>'''


# ---------------------------------------------------------------------------
# O NAS
# ---------------------------------------------------------------------------
def strona_o_nas():
    struktura = "".join(f'<li><a href="{j[1]}">{j[2]}</a> — {j[3][0].lower() + j[3][1:]}</li>' for j in JEDNOSTKI)
    tresc = naglowek_strony("O nas", "Jesteśmy publiczną placówką dla dzieci i młodzieży z niepełnosprawnością intelektualną. Uczymy, wychowujemy i wspieramy — od przedszkola aż po przygotowanie do dorosłego życia.", [("Ośrodek", None), ("O nas", None)]) + f'''
<div class="sekcja">
  <div class="kontener tresc-uklad">
    <div class="proza">
      <h2>Dyrekcja</h2>
      <ul class="osoby">
        <li><b>mgr Katarzyna Bobrowska</b><span>Dyrektor Ośrodka</span></li>
        <li><b>mgr Małgorzata Szewczyk</b><span>Wicedyrektor Ośrodka</span></li>
        <li><b>mgr Justyna Cichowska</b><span>Kierownik</span></li>
      </ul>
      <p>Dyrektor kieruje Ośrodkiem przy pomocy wicedyrektora i głównego księgowego. Szczegółową organizację pracy określa Statut, dostępny w <a href="{BIP}" rel="noopener">Biuletynie Informacji Publicznej</a>.</p>

      <h2>Struktura Ośrodka</h2>
      <ul>{struktura}</ul>
      <p>Uczniowie z niepełnosprawnością intelektualną w stopniu głębokim są objęci zajęciami rewalidacyjno-wychowawczymi.</p>

      <h2>Kadra</h2>
      <p>W Ośrodku pracuje 86 osób, w tym 60 pracowników pedagogicznych. Nasi nauczyciele mają przygotowanie z zakresu pedagogiki specjalnej (oligofrenopedagogiki) oraz kwalifikacje przedmiotowe lub terapeutyczne. Wielu z nich stale się dokształca — na studiach podyplomowych, kursach, konferencjach i warsztatach.</p>
      <p>W zespole są m.in.:</p>
      {lista_ptaszki([
        "nauczyciele prowadzący zajęcia rewalidacyjne: terapię mowy i komunikacji, doskonalenie technik szkolnych, usprawnianie funkcji percepcyjno-motorycznych i integrację sensoryczną,",
        "psycholog prowadzący zajęcia rozwijające kompetencje społeczno-emocjonalne,",
        "bibliotekarz,",
        "wychowawcy świetlicy szkolnej i wychowawcy internatu,",
        "pracownicy administracji i obsługi, którzy dbają o to, żeby w Ośrodku było czysto, ciepło i bezpiecznie."
      ])}

      <h2>Jak pracujemy</h2>
      <p>Cele edukacyjne, wychowawczo-profilaktyczne i rewalidacyjne realizujemy na podstawie Indywidualnych Programów Edukacyjno-Terapeutycznych, przygotowywanych osobno dla każdego ucznia. Pracujemy w małych zespołach, korzystamy z tablic interaktywnych, programów multimedialnych, Sali Doświadczania Świata i sali do terapii integracji sensorycznej.</p>
      <p>Organizujemy pomoc psychologiczno-pedagogiczną, która wspiera rozwój uczniów i ich udział w życiu szkoły oraz lokalnej społeczności. Uczniowie biorą udział w konkursach, wycieczkach, programach i innowacjach pedagogicznych.</p>

      <h2 id="patron">Patron — ks. Jan Twardowski</h2>
      <p>Ks. Jan Twardowski urodził się 1 czerwca 1915 r. w Warszawie, zmarł 18 stycznia 2006 r. Był kapłanem i jednym z najchętniej czytanych polskich poetów. W krótkich, prostych wierszach łączył obserwację przyrody z refleksją nad życiem i miłością do ludzi. Pisał także dla dzieci.</p>
      <p>Mówiono o nim „ksiądz od biedronki” — bo dostrzegał to, co małe i łatwe do przeoczenia. Właśnie taka uważność na każdego człowieka, w jego tempie i z jego możliwościami, jest bliska pracy naszego Ośrodka.</p>

      <h2>Samorządy</h2>
      <p>W Ośrodku działają samorząd uczniowski i samorząd wychowanków internatu. Uczniowie uczą się w nich współdecydowania o życiu szkoły i odpowiedzialności za wspólne sprawy.</p>
    </div>
    <aside>
      {ramka_szkoly("")}
      {ramka_kontakt()}
    </aside>
  </div>
</div>'''
    strona("o-nas.html", "O nas", "Dyrekcja, struktura, kadra i patron Specjalnego Ośrodka Szkolno-Wychowawczego im. ks. Jana Twardowskiego w Ostrołęce.", tresc, aktywne="osrodek")


# ---------------------------------------------------------------------------
# JEDNOSTKI
# ---------------------------------------------------------------------------
def podstrona_jednostki(idx, lead, proza, fakty):
    j = JEDNOSTKI[idx]
    fakty_html = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in fakty)
    tresc = naglowek_strony(j[2], lead, [("Nasze szkoły", None), (j[2], None)], kolor=j[6]) + f'''
<div class="sekcja" style="--k:{j[6]}">
  <div class="kontener tresc-uklad">
    <div class="proza">{proza}
      <div class="uwaga"><p><strong>Chcesz zapisać dziecko?</strong> Rekrutacja trwa przez cały rok. Zobacz, <a href="rekrutacja.html">jak wygląda zapis krok po kroku</a>, albo zadzwoń: <a href="{TEL_HREF}">{TEL}</a>.</p></div>
    </div>
    <aside>
      <section class="ramka" style="--k:{j[6]}" aria-labelledby="fakty"><h2 id="fakty">W skrócie</h2><dl>{fakty_html}</dl></section>
      {ramka_szkoly(j[1])}
    </aside>
  </div>
</div>'''
    strona(j[1], j[2], j[3], tresc, aktywne="szkoly")


def strony_jednostek():
    podstrona_jednostki(0,
        "Przedszkole Specjalne jest częścią społeczności naszego Ośrodka. To miejsce, w którym dziecko czuje się bezpiecznie i chętnie wraca każdego dnia.",
        f'''
      <h2>Organizacja pracy</h2>
      <p>Przedszkole jest czynne od poniedziałku do piątku w godzinach 7.30–15.30. Zajęcia odbywają się w małych zespołach. Nad rozwojem dzieci czuwa wykwalifikowana kadra, którą wspiera pomoc nauczyciela.</p>
      <p>Pracę wychowawczo-dydaktyczną prowadzimy w oparciu o podstawę programową wychowania przedszkolnego. Realizujemy ją w godzinach 8.00–13.00.</p>
      <h2>Bezpieczna przestrzeń</h2>
      <p>Przestrzeń przedszkolną urządzamy z myślą o naszych podopiecznych. Najważniejsze jest dla nas poczucie bezpieczeństwa dziecka — dopiero wtedy może ono poznawać świat, bawić się i uczyć. Cieszymy się, kiedy dziecko chętnie przychodzi do przedszkola.</p>
      <h2>Co oferujemy</h2>
      {lista_ptaszki([
        "zajęcia w małych grupach, dostosowane do możliwości każdego dziecka,",
        "indywidualny program edukacyjno-terapeutyczny,",
        "zajęcia rewalidacyjne i terapeutyczne, m.in. terapię mowy i komunikacji oraz integrację sensoryczną,",
        "wsparcie psychologa i pedagogów — także dla rodziców,",
        "posiłki przygotowywane na miejscu (<a href=\"dla-rodzicow.html#jadlospis\">jadłospis</a>)."
      ])}''',
        [("Dla kogo", "Dzieci z orzeczeniem o potrzebie kształcenia specjalnego"), ("Godziny", "pon.–pt., 7.30–15.30"), ("Podstawa programowa", "8.00–13.00"), ("Grupy", "Małe zespoły z pomocą nauczyciela")])

    podstrona_jednostki(1,
        "Ośmioletnia szkoła podstawowa dla uczniów z niepełnosprawnością intelektualną. Uczymy w tempie dziecka, według programu przygotowanego właśnie dla niego.",
        f'''
      <h2>Dla kogo jest szkoła</h2>
      <p>W Szkole Podstawowej uczą się uczniowie z niepełnosprawnością intelektualną w stopniu:</p>
      {lista_ptaszki(["lekkim,", "umiarkowanym i znacznym, także z niepełnosprawnościami sprzężonymi."])}
      <p>Uczniowie z niepełnosprawnością intelektualną w stopniu głębokim są objęci zajęciami rewalidacyjno-wychowawczymi.</p>
      <h2>Etapy nauki</h2>
      <p>Nauka trwa 8 lat i przebiega na dwóch etapach edukacyjnych:</p>
      {lista_ptaszki(["I etap — klasy I–III,", "II etap — klasy IV–VIII."])}
      <h2>Jak uczymy</h2>
      <p>Cele edukacyjne, wychowawczo-profilaktyczne i rewalidacyjne realizujemy na podstawie Indywidualnych Programów Edukacyjno-Terapeutycznych, przygotowanych dla każdego ucznia. Na zajęciach korzystamy z komputerów, tablic interaktywnych, multimedialnych programów edukacyjnych i zasobów internetu. Część zajęć odbywa się w Sali Doświadczania Świata i w sali terapii integracji sensorycznej.</p>
      <p>Organizujemy pomoc psychologiczno-pedagogiczną, która wspiera rozwój uczniów i ich aktywny udział w życiu szkoły i lokalnej społeczności. Uczniowie biorą udział w konkursach, wycieczkach i spotkaniach, a także w programach i innowacjach pedagogicznych.</p>''',
        [("Czas nauki", "8 lat (klasy I–VIII)"), ("Etapy", "I–III oraz IV–VIII"), ("Program", "IPET dla każdego ucznia"), ("Dodatkowo", "Zajęcia rewalidacyjno-wychowawcze")])

    podstrona_jednostki(2,
        "Szkoła, w której młodzież zdobywa zawód i przygotowuje się do samodzielnej pracy.",
        f'''
      <h2>Dla kogo</h2>
      <p>Branżowa Szkoła Specjalna I stopnia jest przeznaczona dla uczniów z niepełnosprawnością intelektualną w stopniu lekkim, którzy ukończyli szkołę podstawową i mają orzeczenie o potrzebie kształcenia specjalnego.</p>
      <h2>Zawody</h2>
      <p>Kształcimy w zawodach z branży spożywczo-gastronomicznej, m.in.:</p>
      {lista_ptaszki(["kucharz,", "piekarz,", "cukiernik."])}
      <p>Aktualną listę zawodów na dany rok szkolny potwierdzi sekretariat.</p>
      <h2>Jak wygląda nauka</h2>
      <p>Nauka w szkole branżowej I stopnia trwa 3 lata i łączy przedmioty ogólnokształcące z kształceniem zawodowym — teorią i praktyką. Program dopasowujemy do możliwości ucznia, a nauczyciele i specjaliści wspierają go na każdym etapie.</p>
      {lista_ptaszki([
        "zajęcia rewalidacyjne i pomoc psychologiczno-pedagogiczna,",
        "doradztwo zawodowe — pomagamy zaplanować dalszą drogę po szkole,",
        "biblioteka z czytelnią, świetlica i możliwość zamieszkania w internacie."
      ])}''',
        [("Dla kogo", "Niepełnosprawność intelektualna w stopniu lekkim"), ("Czas nauki", "3 lata"), ("Zawody", "m.in. kucharz, piekarz, cukiernik")])

    podstrona_jednostki(3,
        "Publiczna, trzyletnia szkoła, która uczy samodzielności i przygotowuje do pracy — na miarę możliwości każdego ucznia.",
        f'''
      <h2>Dla kogo</h2>
      <p>Szkoła jest przeznaczona dla młodzieży z niepełnosprawnością intelektualną w stopniu umiarkowanym lub znacznym oraz z niepełnosprawnościami sprzężonymi. Zapisy przyjmujemy przez cały rok.</p>
      <h2>Czego się uczymy</h2>
      <p>Wprowadzamy uczniów w świat wiedzy i pracy, dbając o ich harmonijny rozwój. W szkole:</p>
      {lista_ptaszki([
        "uczniowie poznają podstawowe wiadomości, które pomagają rozumieć otaczający świat,",
        "zdobywają umiejętności, dzięki którym potrafią wykorzystać tę wiedzę w codziennych zadaniach i przy rozwiązywaniu problemów,",
        "kształtują postawy potrzebne do odpowiedzialnego funkcjonowania we współczesnym świecie — także do podjęcia pracy zarobkowej."
      ])}
      <h2>Pracownie</h2>
      <p>Uczniowie poznają różne zajęcia i zawody w nowocześnie wyposażonych pracowniach:</p>
      <ul class="kafle">
        <li><h3>{ikona("dom")}Gospodarstwo domowe</h3><p>Gotowanie, porządki, codzienne czynności.</p></li>
        <li><h3>{ikona("narzedzia")}Szycie</h3><p>Praca z tkaniną i maszyną do szycia.</p></li>
        <li><h3>{ikona("dlon")}Ceramika</h3><p>Praca z gliną, sprawność rąk, cierpliwość.</p></li>
        <li><h3>{ikona("zmysly")}Pracownia komputerowa</h3><p>Podstawy obsługi komputera i bezpieczeństwo w sieci.</p></li>
      </ul>
      <h2>Wsparcie i życie szkoły</h2>
      <p>W miarę potrzeb uczniowie korzystają z zajęć rewalidacyjnych i pomocy psychologiczno-pedagogicznej. Do ich dyspozycji są biblioteka z czytelnią, świetlica szkolna, internat, koła zainteresowań i zajęcia dodatkowe.</p>
      <p>Współpracujemy z instytucjami kultury i edukacji, Urzędem Miasta i Poradnią Psychologiczno-Pedagogiczną. Organizujemy spotkania, wyjścia, wycieczki i wydarzenia kulturalne. Ważne jest dla nas poszanowanie godności ucznia oraz atmosfera akceptacji, życzliwości i bezpieczeństwa.</p>''',
        [("Dla kogo", "Niepełnosprawność intelektualna w stopniu umiarkowanym lub znacznym, także sprzężona"), ("Czas nauki", "3 lata"), ("Pracownie", "gospodarstwo domowe, szycie, ceramika, komputerowa"), ("Zapisy", "Przez cały rok")])

    podstrona_jednostki(4,
        "Część mieszkalna Ośrodka dla uczniów naszych szkół — z opieką wychowawców i spokojnym rytmem dnia.",
        f'''
      <h2>Dla kogo</h2>
      <p>Internat jest przeznaczony dla uczniów szkół wchodzących w skład Ośrodka, przede wszystkim tych, którzy mieszkają daleko od Ostrołęki i nie mogą codziennie dojeżdżać.</p>
      <h2>Co zapewniamy</h2>
      {lista_ptaszki([
        "opiekę wychowawców i pomoc w nauce własnej,",
        "zajęcia popołudniowe rozwijające samodzielność, zainteresowania i umiejętności społeczne,",
        "posiłki i warunki do odpoczynku,",
        "samorząd wychowanków, w którym młodzież współdecyduje o życiu internatu."
      ])}
      <h2>Zasady</h2>
      <p>Szczegółowe zasady pobytu, godziny pracy internatu i rozkład dnia opisuje regulamin internatu. O wolne miejsca i warunki przyjęcia zapytaj w sekretariacie.</p>''',
        [("Dla kogo", "Uczniowie szkół Ośrodka"), ("Opieka", "Wychowawcy internatu"), ("Informacje", f'Sekretariat, tel. <a href="{TEL_HREF}">{TEL}</a>')])


# ---------------------------------------------------------------------------
# AKTUALNOŚCI
# ---------------------------------------------------------------------------
def strony_aktualnosci():
    tresc = naglowek_strony("Aktualności", "Wydarzenia, wycieczki, konkursy i codzienne życie naszych szkół.", [("Aktualności", None)]) + '''
<div class="sekcja">
  <div class="kontener">
    <h2 class="wizualnie-ukryte">Filtruj według jednostki</h2>
    <ul class="filtry" id="filtry" aria-label="Filtruj według jednostki"></ul>
    <p class="wizualnie-ukryte" id="aktualnosci-komunikat" aria-live="polite"></p>
    <ul class="siatka-wpisow" id="aktualnosci-lista"><li>Wczytywanie aktualności…</li></ul>
  </div>
</div>'''
    strona("aktualnosci.html", "Aktualności", "Aktualności Specjalnego Ośrodka Szkolno-Wychowawczego w Ostrołęce.", tresc,
           skrypty=("aktualnosci-dane.js", "aktualnosci.js"))

    tresc = '''
<div class="naglowek-strony">
  <div class="kontener">
    <div>
      <nav class="okruszki" aria-label="Jesteś tutaj"><ol><li><a href="index.html">Strona główna</a></li><li><a href="aktualnosci.html">Aktualności</a></li></ol></nav>
      <h1 id="wpis-tytul">Aktualność</h1>
      <div id="wpis-meta"></div>
    </div>
  </div>
</div>
<article class="wpis" aria-labelledby="wpis-tytul">
  <div class="kontener">
    <div class="wpis__tresc proza" id="wpis"><p>Wczytywanie wpisu…</p></div>
  </div>
</article>'''
    strona("aktualnosc.html", "Aktualność", "Wpis z aktualności SOSW w Ostrołęce.", tresc, skrypty=("aktualnosci-dane.js", "aktualnosci.js"))


# ---------------------------------------------------------------------------
# DLA RODZICÓW
# ---------------------------------------------------------------------------
def strona_dla_rodzicow():
    tresc = naglowek_strony("Dla rodziców", "Najważniejsze informacje w jednym miejscu: dziennik, jadłospis, dokumenty i wsparcie.", [("Dla rodziców", None)]) + f'''
<div class="sekcja">
  <div class="kontener tresc-uklad">
    <div class="proza">
      <h2 id="dziennik">Dziennik elektroniczny</h2>
      <p>Oceny, frekwencję, plan lekcji i wiadomości od nauczycieli sprawdzisz w dzienniku elektronicznym VULCAN. Dane do pierwszego logowania przekazuje wychowawca.</p>
      <p><a class="btn btn--glowny" href="{DZIENNIK}" rel="noopener">{ikona("dziennik")}Zaloguj się do dziennika</a></p>

      <h2 id="jadlospis">Jadłospis</h2>
      <p>Aktualny jadłospis publikujemy co tydzień. Jeśli Twoje dziecko ma alergię lub specjalną dietę, poinformuj o tym wychowawcę i sekretariat.</p>
      <ul class="dokumenty">
        <li><a href="dokumenty/jadlospis.pdf">{ikona("plik")}<span>Jadłospis na bieżący tydzień<small>PDF</small></span></a></li>
      </ul>

      <h2 id="pomoc">Wsparcie dla rodzin</h2>
      <p>Rodzice mogą skorzystać z konsultacji z psychologiem, pedagogiem i specjalistami prowadzącymi zajęcia z dzieckiem. Wspólnie omawiamy postępy, ustalamy cele w Indywidualnym Programie Edukacyjno-Terapeutycznym i szukamy rozwiązań trudności. Spotkanie umówisz przez wychowawcę lub sekretariat.</p>

      <h2 id="doradztwo">Doradztwo zawodowe</h2>
      <p>Pomagamy uczniom i rodzicom zaplanować dalszą drogę: wybór szkoły po ósmej klasie, naukę zawodu i przygotowanie do pracy. Uczniowie poznają zawody na zajęciach, w pracowniach i podczas wyjść do zakładów pracy.</p>

      <h2 id="nauczanie-zdalne">Nauczanie zdalne</h2>
      <p>Jeśli zajęcia trzeba będzie prowadzić na odległość, informacje o organizacji nauki przekażemy przez dziennik elektroniczny i na tej stronie.</p>

      <h2 id="stowarzyszenie">Stowarzyszenie</h2>
      <p>Przy Ośrodku działa stowarzyszenie wspierające jego wychowanków. Informacje o działalności i o tym, jak można pomóc, uzyskasz w sekretariacie.</p>

      <h2 id="dokumenty">Dokumenty dla rodziców</h2>
      <p>Wnioski, oświadczenia, zgody i regulaminy znajdziesz na stronie <a href="dokumenty.html">Dokumenty</a>.</p>
    </div>
    <aside>
      <nav class="ramka" aria-labelledby="na-tej-stronie">
        <h2 id="na-tej-stronie">Na tej stronie</h2>
        <ul class="podmenu" style="position:static;box-shadow:none;padding:0;min-width:0">
          <li><a href="#dziennik">Dziennik elektroniczny</a></li>
          <li><a href="#jadlospis">Jadłospis</a></li>
          <li><a href="#pomoc">Wsparcie dla rodzin</a></li>
          <li><a href="#doradztwo">Doradztwo zawodowe</a></li>
          <li><a href="#nauczanie-zdalne">Nauczanie zdalne</a></li>
          <li><a href="#stowarzyszenie">Stowarzyszenie</a></li>
          <li><a href="#dokumenty">Dokumenty</a></li>
        </ul>
      </nav>
      {ramka_kontakt()}
    </aside>
  </div>
</div>'''
    strona("dla-rodzicow.html", "Dla rodziców", "Informacje dla rodziców uczniów SOSW w Ostrołęce: dziennik elektroniczny, jadłospis, wsparcie, doradztwo zawodowe.", tresc, aktywne="rodzice")


def strona_rekrutacja():
    tresc = naglowek_strony("Rekrutacja", "Rekrutacja trwa przez cały rok. Wyjaśniamy, jak zapisać dziecko do przedszkola lub jednej z naszych szkół.", [("Dla rodziców", None), ("Rekrutacja", None)]) + f'''
<div class="sekcja">
  <div class="kontener">
    <div class="rekrutacja-pas">
      <h2>Zapis krok po kroku</h2>
      {kroki_rekrutacji()}
    </div>
  </div>
</div>
<div class="sekcja sekcja--tlo">
  <div class="kontener tresc-uklad">
    <div class="proza">
      <h2>Kogo przyjmujemy</h2>
      <p>Przyjmujemy dzieci i młodzież z orzeczeniem o potrzebie kształcenia specjalnego wydanym przez poradnię psychologiczno-pedagogiczną:</p>
      {lista_ptaszki([f'<a href="{j[1]}">{j[2]}</a>' for j in JEDNOSTKI[:4]] + ['<a href="internat.html">Internat</a> — dla uczniów naszych szkół, którzy mieszkają daleko'])}

      <h2>Jakie dokumenty przygotować</h2>
      {lista_ptaszki([
        "orzeczenie o potrzebie kształcenia specjalnego,",
        "skierowanie wydane przez organ prowadzący (dla mieszkańców Ostrołęki — Prezydent Miasta Ostrołęki, dla pozostałych — starosta powiatu, w którym mieszka dziecko),",
        "wniosek o przyjęcie (otrzymasz go w sekretariacie),",
        "w przypadku ucznia przechodzącego z innej szkoły — arkusz ocen lub świadectwo."
      ])}
      <p>Dokładną listę dokumentów potwierdzi sekretariat — może się ona różnić w zależności od wieku dziecka i wybranej szkoły.</p>

      <h2>Częste pytania</h2>
      <div class="faq">
        <details><summary>Czy mogę zapisać dziecko w trakcie roku szkolnego?</summary><div><p>Tak. Rekrutacja trwa przez cały rok — dziecko może rozpocząć naukę w dowolnym momencie.</p></div></details>
        <details><summary>Czy mogę najpierw zobaczyć szkołę?</summary><div><p>Tak, zapraszamy. Zadzwoń do sekretariatu i umów wizytę — pokażemy sale, przedstawimy specjalistów i odpowiemy na pytania.</p></div></details>
        <details><summary>Skąd wziąć orzeczenie o potrzebie kształcenia specjalnego?</summary><div><p>Orzeczenie wydaje zespół orzekający w publicznej poradni psychologiczno-pedagogicznej właściwej dla miejsca zamieszkania dziecka. Wniosek składa rodzic.</p></div></details>
        <details><summary>Czy uczeń spoza Ostrołęki może zamieszkać w internacie?</summary><div><p>Internat jest przeznaczony dla uczniów naszych szkół. O wolne miejsca zapytaj w sekretariacie.</p></div></details>
      </div>

      <h2>Erasmus+</h2>
      <p>Regulaminy rekrutacji do projektu Erasmus+ dla uczniów i nauczycieli znajdziesz na stronie <a href="projekty.html#erasmus">Projekty i innowacje</a>.</p>
    </div>
    <aside>{ramka_kontakt()}</aside>
  </div>
</div>'''
    strona("rekrutacja.html", "Rekrutacja", "Rekrutacja do SOSW w Ostrołęce trwa przez cały rok. Jak zapisać dziecko do przedszkola lub szkoły specjalnej — krok po kroku.", tresc, aktywne="rodzice", tlo_stopki="var(--papier-2)")


# ---------------------------------------------------------------------------
# PROJEKTY
# ---------------------------------------------------------------------------
def strona_projekty():
    tresc = naglowek_strony("Projekty i innowacje", "Programy, które poszerzają świat naszych uczniów — od zdrowych nawyków po wyjazdy zagraniczne.", [("Ośrodek", None), ("Projekty i innowacje", None)]) + f'''
<div class="sekcja">
  <div class="kontener tresc-uklad">
    <div class="proza">
      <h2 id="erasmus">Erasmus+</h2>
      <p>Ośrodek realizuje projekt w programie Erasmus+, dzięki któremu uczniowie i nauczyciele mogą zdobywać nowe doświadczenia za granicą. Zasady udziału opisują regulaminy rekrutacji:</p>
      <ul class="dokumenty">
        <li><a href="dokumenty/erasmus-regulamin-uczniowie.pdf">{ikona("plik")}<span>Regulamin rekrutacji i uczestnictwa w projekcie — uczniowie<small>PDF</small></span></a></li>
        <li><a href="dokumenty/erasmus-regulamin-nauczyciele.pdf">{ikona("plik")}<span>Regulamin rekrutacji i uczestnictwa w projekcie — nauczyciele<small>PDF</small></span></a></li>
      </ul>

      <h2 id="zdrowy-mozg">„W zdrowym ciele zdrowy mózg”</h2>
      <p>Innowacja pedagogiczna SOSW w Ostrołęce. Rozmawiamy z uczniami o tym, jak codzienne nawyki — ruch, sen, jedzenie, odpoczynek — wpływają na pracę mózgu, koncentrację uwagi, myślenie i naukę. <a href="aktualnosc.html?wpis=w-zdrowym-ciele-zdrowy-mozg">Przeczytaj o starcie innowacji</a>.</p>

      <h2 id="bohateron">BohaterON – włącz historię!</h2>
      <p>Co roku włączamy się w ogólnopolską kampanię, która upamiętnia uczestników Powstania Warszawskiego i przybliża młodym ludziom historię Polski. <a href="aktualnosc.html?wpis=bohateron-2026">Zobacz tegoroczną edycję</a>.</p>

      <h2 id="grzybobranie">Grzybobranie po Kurpiowsku</h2>
      <p>Cykliczne wydarzenie, w którym nasi podopieczni poznają kurpiowską przyrodę i tradycję. <a href="aktualnosc.html?wpis=grzybobranie-po-kurpiowsku-2026">Relacja z ostatniego grzybobrania</a>.</p>
    </div>
    <aside>{ramka_kontakt()}</aside>
  </div>
</div>'''
    strona("projekty.html", "Projekty i innowacje", "Projekty i innowacje pedagogiczne SOSW w Ostrołęce: Erasmus+, „W zdrowym ciele zdrowy mózg”, BohaterON.", tresc, aktywne="osrodek")


# ---------------------------------------------------------------------------
# DOKUMENTY
# ---------------------------------------------------------------------------
def strona_dokumenty():
    def dok(nazwa, href, opis="PDF", zew=False):
        return f'<li><a href="{href}"{" rel=" + chr(34) + "noopener" + chr(34) if zew else ""}>{ikona("link" if zew else "plik")}<span>{nazwa}<small>{opis}</small></span></a></li>'
    tresc = naglowek_strony("Dokumenty", "Dokumenty Ośrodka oraz wnioski i formularze dla rodziców.", [("Ośrodek", None), ("Dokumenty", None)]) + f'''
<div class="sekcja">
  <div class="kontener tresc-uklad">
    <div class="proza">
      <h2>Dokumenty Ośrodka</h2>
      <p>Statut, regulaminy i dokumenty organizacyjne publikujemy w Biuletynie Informacji Publicznej.</p>
      <ul class="dokumenty">
        {dok("Statut Ośrodka", BIP, "Biuletyn Informacji Publicznej", True)}
        {dok("Regulamin organizacyjny", BIP, "Biuletyn Informacji Publicznej", True)}
        {dok("Program wychowawczo-profilaktyczny", BIP, "Biuletyn Informacji Publicznej", True)}
      </ul>

      <h2>Dokumenty na rok szkolny 2026/2027</h2>
      <p>Wnioski, zgody i oświadczenia dla rodziców wydaje sekretariat. Wersje do pobrania publikujemy na tej stronie.</p>
      <ul class="dokumenty">
        {dok("Jadłospis na bieżący tydzień", "dokumenty/jadlospis.pdf")}
        {dok("Erasmus+ — regulamin rekrutacji i uczestnictwa w projekcie (uczniowie)", "dokumenty/erasmus-regulamin-uczniowie.pdf")}
        {dok("Erasmus+ — regulamin rekrutacji i uczestnictwa w projekcie (nauczyciele)", "dokumenty/erasmus-regulamin-nauczyciele.pdf")}
      </ul>

      <h2>Dostępność i ochrona danych</h2>
      <ul class="dokumenty">
        {dok("Deklaracja dostępności", "deklaracja-dostepnosci.html", "strona")}
        {dok("RODO i polityka prywatności", "polityka-prywatnosci.html", "strona")}
      </ul>
    </div>
    <aside>{ramka_kontakt()}</aside>
  </div>
</div>'''
    strona("dokumenty.html", "Dokumenty", "Statut, regulaminy, wnioski i formularze SOSW w Ostrołęce.", tresc, aktywne="osrodek")


# ---------------------------------------------------------------------------
# KONTAKT
# ---------------------------------------------------------------------------
def strona_kontakt():
    tresc = naglowek_strony("Kontakt", "Zadzwoń, napisz albo odwiedź nas przy ul. Traugutta 9.", [("Kontakt", None)]) + f'''
<div class="sekcja">
  <div class="kontener kontakt-uklad">
    <div>
      <h2>{NAZWA.replace(" im. ", "<br>im. ")}</h2>
      <ul class="dane-kontaktowe">
        <li><span class="ikona">{ikona("pinezka")}</span><span><small>Adres</small><b>{ULICA}<br>{KOD_MIASTO}</b></span></li>
        <li><span class="ikona">{ikona("telefon")}</span><span><small>Telefon</small><a href="{TEL_HREF}">{TEL}</a></span></li>
        <li><span class="ikona">{ikona("plik")}</span><span><small>Faks</small><b>{FAX}</b></span></li>
        <li><span class="ikona">{ikona("mail")}</span><span><small>E-mail sekretariatu</small><a href="mailto:{EMAIL}">{EMAIL}</a></span></li>
        <li><span class="ikona">{ikona("tarcza")}</span><span><small>Inspektor ochrony danych — {IOD_OSOBA}</small><a href="mailto:{IOD_EMAIL}">{IOD_EMAIL}</a></span></li>
        <li><span class="ikona">{ikona("link")}</span><span><small>Biuletyn Informacji Publicznej</small><a href="{BIP}" rel="noopener">e-bip.org.pl/soswostroleka</a></span></li>
      </ul>
    </div>
    {mapa()}
  </div>
</div>'''
    strona("kontakt.html", "Kontakt", f"Kontakt: {ULICA}, {KOD_MIASTO}, tel. {TEL}, {EMAIL}.", tresc)


# ---------------------------------------------------------------------------
# DEKLARACJA DOSTĘPNOŚCI / PRYWATNOŚĆ / 404
# ---------------------------------------------------------------------------
def strona_deklaracja():
    tresc = naglowek_strony("Deklaracja dostępności", "", [("Deklaracja dostępności", None)], ornament=False) + f'''
<div class="sekcja">
  <div class="kontener">
    <div class="proza">
      <p id="a11y-wstep"><span id="a11y-podmiot">{NAZWA}</span> zobowiązuje się zapewnić dostępność swojej strony internetowej zgodnie z ustawą z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych. Deklaracja dostępności dotyczy strony internetowej <a id="a11y-url" href="{ADRES_STRONY}">{ADRES_STRONY}</a>.</p>
      <ul>
        <li>Data publikacji strony internetowej: <span id="a11y-data-publikacja">[uzupełnij: RRRR-MM-DD]</span>.</li>
        <li>Data ostatniej istotnej aktualizacji: <span id="a11y-data-aktualizacja">[uzupełnij: RRRR-MM-DD]</span>.</li>
      </ul>

      <h2 id="a11y-status">Stan dostępności cyfrowej</h2>
      <p>Strona internetowa jest <strong>częściowo zgodna</strong> z ustawą o dostępności cyfrowej z powodu niezgodności lub wyłączeń wymienionych poniżej.</p>
      <h3>Treści niedostępne</h3>
      <ul>
        <li>Część dokumentów PDF opublikowanych przed uruchomieniem nowej strony może nie być w pełni dostępna (np. skany).</li>
        <li>Część zdjęć w galeriach może nie mieć pełnych opisów alternatywnych.</li>
        <li>Mapa dojazdu pochodzi z serwisu zewnętrznego i nie jest w pełni dostępna — adres podajemy także w formie tekstu.</li>
      </ul>

      <h2 id="a11y-przygotowanie">Przygotowanie deklaracji dostępności</h2>
      <p>Deklarację sporządzono dnia <span id="a11y-data-sporzadzenia">[uzupełnij: RRRR-MM-DD]</span> na podstawie samooceny przeprowadzonej przez podmiot publiczny.</p>

      <h2>Ułatwienia na stronie</h2>
      <ul>
        <li>panel „Ułatwienia dostępu” (w pasku na górze strony): powiększenie tekstu, wysoki kontrast, podkreślenie linków, większe odstępy w tekście i zatrzymanie animacji,</li>
        <li>link „Przejdź do treści” na początku każdej strony,</li>
        <li>pełna obsługa za pomocą klawiatury i widoczny wskaźnik fokusu,</li>
        <li>czcionka Atkinson Hyperlegible Next, zaprojektowana z myślą o osobach słabowidzących,</li>
        <li>strona działa poprawnie po powiększeniu do 200% i na urządzeniach mobilnych.</li>
      </ul>

      <h2 id="a11y-kontakt">Informacje zwrotne i dane kontaktowe</h2>
      <p>Wszystkie problemy z dostępnością cyfrową tej strony internetowej możesz zgłosić do: <span id="a11y-kontakt-osoba">[uzupełnij: imię i nazwisko]</span>, e-mail <a id="a11y-kontakt-email" href="mailto:{EMAIL}">{EMAIL}</a>, telefon <span id="a11y-kontakt-telefon">{TEL}</span>.</p>
      <p>Każdy ma prawo wystąpić z żądaniem zapewnienia dostępności cyfrowej strony internetowej, aplikacji mobilnej lub jakiegoś ich elementu. Można także zażądać udostępnienia informacji za pomocą alternatywnego sposobu dostępu, na przykład przez odczytanie niedostępnego cyfrowo dokumentu, opisanie zawartości filmu bez audiodeskrypcji itp. Żądanie powinno zawierać dane osoby zgłaszającej żądanie, wskazanie, o którą stronę internetową lub aplikację mobilną chodzi, oraz sposób kontaktu. Jeżeli osoba żądająca zgłasza potrzebę otrzymania informacji za pomocą alternatywnego sposobu dostępu, powinna także określić dogodny dla niej sposób przedstawienia tej informacji.</p>
      <p>Podmiot publiczny powinien zrealizować żądanie niezwłocznie, nie później niż w ciągu 7 dni od dnia wystąpienia z żądaniem. Jeżeli dotrzymanie tego terminu nie jest możliwe, podmiot publiczny niezwłocznie informuje o tym wnoszącego żądanie, kiedy realizacja żądania będzie możliwa, przy czym termin ten nie może być dłuższy niż 2 miesiące od dnia wystąpienia z żądaniem. Jeżeli zapewnienie dostępności cyfrowej nie jest możliwe, podmiot publiczny może zaproponować alternatywny sposób dostępu do informacji.</p>
      <p>W przypadku, gdy podmiot publiczny odmówi realizacji żądania zapewnienia dostępności lub alternatywnego sposobu dostępu do informacji, wnoszący żądanie może złożyć skargę w sprawie zapewnienia dostępności cyfrowej strony internetowej, aplikacji mobilnej lub elementu strony internetowej lub aplikacji mobilnej. Po wyczerpaniu wskazanej wyżej procedury można także złożyć wniosek do <a href="https://bip.brpo.gov.pl/" rel="noopener">Rzecznika Praw Obywatelskich</a>.</p>

      <h2 id="a11y-architektura">Dostępność architektoniczna</h2>
      <p>[uzupełnij: opis wejść do budynku przy ul. gen. Romualda Traugutta 9, dostępność dla osób na wózkach, windy/podjazdy, miejsca parkingowe dla osób z niepełnosprawnościami, możliwość wejścia z psem asystującym, dostępność tłumacza języka migowego.]</p>

      <h2 id="a11y-aplikacje">Aplikacje mobilne</h2>
      <p>Ośrodek nie udostępnia własnych aplikacji mobilnych.</p>
    </div>
  </div>
</div>'''
    strona("deklaracja-dostepnosci.html", "Deklaracja dostępności", "Deklaracja dostępności strony internetowej SOSW w Ostrołęce.", tresc)


def strona_prywatnosc():
    tresc = naglowek_strony("RODO i prywatność", "", [("RODO i prywatność", None)], ornament=False) + f'''
<div class="sekcja">
  <div class="kontener">
    <div class="proza">
      <h2>Inspektor ochrony danych</h2>
      <p>W sprawach dotyczących przetwarzania danych osobowych możesz skontaktować się z inspektorem ochrony danych: <strong>{IOD_OSOBA}</strong>, e-mail <a href="mailto:{IOD_EMAIL}">{IOD_EMAIL}</a>.</p>
      <p>Administratorem danych osobowych uczniów, rodziców i pracowników jest {NAZWA}, {ULICA}, {KOD_MIASTO}. Pełne klauzule informacyjne udostępnia sekretariat oraz <a href="{BIP}" rel="noopener">Biuletyn Informacji Publicznej</a>.</p>

      <h2>Pliki cookies i pamięć przeglądarki</h2>
      <p>Ta strona nie używa plików cookies ani narzędzi śledzących. Czcionki są zapisane na naszym serwerze, a nie pobierane z serwisów zewnętrznych.</p>
      <p>Jeśli skorzystasz z panelu „Ułatwienia dostępu”, wybrane ustawienia (np. wielkość tekstu) zapiszemy w pamięci Twojej przeglądarki (localStorage), żeby nie trzeba było ich ustawiać na każdej podstronie. Te informacje nie są nigdzie wysyłane. Możesz je usunąć przyciskiem „Przywróć ustawienia domyślne”.</p>

      <h2>Mapa</h2>
      <p>Mapa dojazdu pochodzi z serwisu Google Maps i wczytuje się dopiero po kliknięciu przycisku „Pokaż mapę”. Od tej chwili obowiązuje <a href="https://policies.google.com/privacy?hl=pl" rel="noopener">polityka prywatności Google</a>.</p>

      <h2>Wizerunek uczniów</h2>
      <p>Zdjęcia uczniów publikujemy wyłącznie za zgodą rodziców lub opiekunów prawnych. Zgodę można w każdej chwili wycofać — wystarczy poinformować sekretariat.</p>
    </div>
  </div>
</div>'''
    strona("polityka-prywatnosci.html", "RODO i prywatność", "Ochrona danych osobowych i polityka prywatności strony SOSW w Ostrołęce.", tresc)


def strona_404():
    tresc = f'''
<div class="kontener blad">
  {galazka("")}
  <h1>Nie znaleźliśmy tej strony</h1>
  <p>Adres mógł się zmienić po przeniesieniu serwisu na nową stronę. Spróbuj zacząć od strony głównej albo skorzystaj z menu.</p>
  <p><a class="btn btn--glowny" href="index.html">Przejdź na stronę główną</a></p>
</div>'''
    strona("404.html", "Nie znaleziono strony", "Strona nie istnieje.", tresc)


def zapisz_grafiki():
    with open(os.path.join(KATALOG, "assets/img/favicon.svg"), "w", encoding="utf-8") as f:
        f.write(favicon())
    with open(os.path.join(KATALOG, "assets/img/leluja.svg"), "w", encoding="utf-8") as f:
        f.write(leluja().replace('class="leluja" ', 'xmlns:xlink="http://www.w3.org/1999/xlink" '))


if __name__ == "__main__":
    zapisz_grafiki()
    strona_glowna()
    strona_o_nas()
    strony_jednostek()
    strony_aktualnosci()
    strona_dla_rodzicow()
    strona_rekrutacja()
    strona_projekty()
    strona_dokumenty()
    strona_kontakt()
    strona_deklaracja()
    strona_prywatnosc()
    strona_404()
