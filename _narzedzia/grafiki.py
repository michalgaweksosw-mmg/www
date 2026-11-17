# -*- coding: utf-8 -*-
"""Grafiki SVG w stylu kurpiowskiej wycinanki (własne, oryginalne rysunki)."""

BOR = "#1d5a3b"
BOR2 = "#2e7a50"
CZERWIEN = "#c4303a"
SLONCE = "#f2b705"
CHABER = "#2c5fc4"
ATRAMENT = "#1b2340"


def _tulipan(cx, cy, kolor, srodek=SLONCE):
    return (
        f'<path d="M{cx-14} {cy+4} C{cx-16} {cy-14} {cx-8} {cy-22} {cx} {cy-14} '
        f'C{cx+8} {cy-22} {cx+16} {cy-14} {cx+14} {cy+4} C{cx+8} {cy+13} {cx-8} {cy+13} {cx-14} {cy+4}Z" fill="{kolor}"/>'
        f'<path d="M{cx} {cy-6} c4 4 4 10 0 13 c-4 -3 -4 -9 0 -13z" fill="{srodek}"/>'
    )


def _ptak(tx, ty, kolor=CHABER, skrzydlo=SLONCE):
    return (
        f'<g transform="translate({tx} {ty})">'
        f'<path d="M-26 4 L-46 -6 L-40 10 L-48 20 L-22 12 Z" fill="{BOR}"/>'
        f'<path d="M-28 6 C-24 -12 -4 -18 12 -12 C18 -20 30 -20 34 -10 L43 -6 L34 -2 C32 12 16 20 0 18 C-12 18 -22 14 -28 6 Z" fill="{kolor}"/>'
        f'<path d="M-12 1 C-4 -8 10 -8 17 2 C8 10 -4 10 -12 1 Z" fill="{skrzydlo}"/>'
        f'<circle cx="26" cy="-11" r="2.6" fill="#fff"/>'
        f'</g>'
    )


def _rozeta(cx, cy, r=1.0, platki=CZERWIEN, pierscien=SLONCE, srodek=CHABER, otwory=True, klasa=""):
    out = [f'<g{(" class=" + chr(34) + klasa + chr(34)) if klasa else ""}>']
    for i in range(8):
        out.append(f'<ellipse cx="{cx}" cy="{cy - 50*r:.1f}" rx="{15*r:.1f}" ry="{32*r:.1f}" fill="{platki}" transform="rotate({i*45} {cx} {cy})"/>')
    for i in range(8):
        out.append(f'<ellipse cx="{cx}" cy="{cy - 34*r:.1f}" rx="{8*r:.1f}" ry="{16*r:.1f}" fill="{BOR}" transform="rotate({i*45 + 22.5} {cx} {cy})"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{30*r:.1f}" fill="{pierscien}"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{20*r:.1f}" fill="{srodek}"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{11*r:.1f}" fill="{platki}"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{4.5*r:.1f}" fill="#fff"/>')
    if otwory:
        for i in range(8):
            out.append(f'<circle cx="{cx}" cy="{cy - 66*r:.1f}" r="{3.2*r:.1f}" fill="#fff" transform="rotate({i*45} {cx} {cy})"/>')
    out.append('</g>')
    return "".join(out)


def leluja(tytul=True):
    """Leluja — kurpiowskie drzewko życia. Lewa połowa rysowana raz i odbijana lustrzanie."""
    # połówki poszczególnych warstw (do odbicia)
    h2 = (
        f'<path d="M196 428 C172 424 140 412 116 392 C146 394 178 404 196 412 Z" fill="{BOR}"/>'
        f'<path d="M184 414 C164 410 146 404 132 396" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
        + _tulipan(110, 386, CZERWIEN)
        + f'<path d="M196 372 C170 366 132 350 104 324 C138 330 176 344 196 356 Z" fill="{BOR2}"/>'
        f'<path d="M182 358 C160 352 138 342 122 332" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
        + _tulipan(98, 318, CHABER, SLONCE)
    )
    h3 = (
        f'<path d="M196 318 C164 312 116 292 78 262 C120 268 168 290 196 300 Z" fill="{BOR}"/>'
        f'<ellipse cx="146" cy="282" rx="15" ry="6" fill="{BOR2}" transform="rotate(-62 146 282)"/>'
        f'<ellipse cx="118" cy="268" rx="13" ry="5.5" fill="{BOR2}" transform="rotate(-58 118 268)"/>'
        f'<circle cx="72" cy="256" r="17" fill="{CZERWIEN}"/><circle cx="72" cy="256" r="10" fill="{SLONCE}"/><circle cx="72" cy="256" r="4" fill="{ATRAMENT}"/>'
        f'<path d="M30 300 l7 -9 l7 9 l-7 9z" fill="{SLONCE}"/>'
        f'<circle cx="40" cy="380" r="5" fill="{CZERWIEN}"/>'
    )
    h4 = (
        f'<path d="M196 262 C170 252 128 232 100 214 C132 216 172 230 198 246 Z" fill="{BOR2}"/>'
        + _ptak(96, 190)
        + f'<path d="M48 140 l8 -10 l8 10 l-8 10z" fill="{CZERWIEN}"/>'
        f'<circle cx="80" cy="96" r="5" fill="{CHABER}"/>'
    )
    lustro = 'transform="translate(400 0) scale(-1 1)"'
    t = '<title>Leluja — kurpiowskie drzewko życia w stylu wycinanki</title>' if tytul else ''
    return (
        f'<svg class="leluja" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Leluja — kurpiowskie drzewko życia w stylu wycinanki">{t}'
        f'<defs><g id="lel-h2">{h2}</g><g id="lel-h3">{h3}</g><g id="lel-h4">{h4}</g></defs>'
        f'<g class="w w1">'
        f'<path d="M118 452 C150 434 250 434 282 452 L268 492 L132 492 Z" fill="{CZERWIEN}"/>'
        f'<path d="M127 466 L273 466 L270 474 L130 474 Z" fill="{SLONCE}"/>'
        + "".join(f'<circle cx="{x}" cy="483" r="3.2" fill="#fff"/>' for x in (150, 175, 200, 225, 250))
        + '</g>'
        f'<g class="w w2"><path d="M194 446 L194 150 Q200 138 206 150 L206 446 Z" fill="{BOR}"/>'
        f'<use href="#lel-h2"/><use href="#lel-h2" {lustro}/></g>'
        f'<g class="w w3"><use href="#lel-h3"/><use href="#lel-h3" {lustro}/></g>'
        f'<g class="w w4"><use href="#lel-h4"/><use href="#lel-h4" {lustro}/></g>'
        f'<g class="w w5">{_rozeta(200, 100, 1.0)}</g>'
        f'</svg>'
    )


def znak(rozmiar_klasa="marka__znak"):
    """Znak graficzny (rozeta) — tymczasowy, do zastąpienia oficjalnym logo Ośrodka."""
    return (
        f'<svg class="{rozmiar_klasa}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">'
        f'<circle cx="100" cy="100" r="98" fill="{BOR}"/>'
        + _rozeta(100, 100, 1.08, platki=CZERWIEN, pierscien=SLONCE, srodek=CHABER, otwory=False)
        + '</svg>'
    )


def favicon():
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">'
        f'<circle cx="100" cy="100" r="98" fill="{BOR}"/>'
        + _rozeta(100, 100, 1.08, otwory=False)
        + '</svg>'
    )


def biedronka(klasa="patron__znak"):
    """Biedronka — ks. Jana Twardowskiego nazywano „księdzem od biedronki”."""
    kropki = [(78, 118, 13), (122, 118, 13), (70, 158, 11), (130, 158, 11), (100, 186, 9)]
    return (
        f'<svg class="{klasa}" viewBox="0 0 200 220" aria-hidden="true" focusable="false">'
        f'<path d="M100 20 C70 20 60 40 64 52 L136 52 C140 40 130 20 100 20Z" fill="{ATRAMENT}"/>'
        f'<circle cx="86" cy="36" r="4" fill="#fff"/><circle cx="114" cy="36" r="4" fill="#fff"/>'
        f'<path d="M84 18 C78 6 70 4 62 6" stroke="{ATRAMENT}" stroke-width="5" fill="none" stroke-linecap="round"/>'
        f'<path d="M116 18 C122 6 130 4 138 6" stroke="{ATRAMENT}" stroke-width="5" fill="none" stroke-linecap="round"/>'
        f'<path d="M40 70 L18 60 M38 120 L12 122 M44 168 L22 186 M160 70 L182 60 M162 120 L188 122 M156 168 L178 186" stroke="{ATRAMENT}" stroke-width="7" stroke-linecap="round"/>'
        f'<path d="M100 50 C42 50 28 110 38 150 C48 192 80 210 100 210 C120 210 152 192 162 150 C172 110 158 50 100 50Z" fill="{CZERWIEN}"/>'
        f'<path d="M100 50 L100 210" stroke="{ATRAMENT}" stroke-width="6"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{ATRAMENT}"/>' for x, y, r in kropki if x != 100)
        + f'<circle cx="100" cy="186" r="9" fill="{SLONCE}"/>'
        f'<path d="M60 92 C66 80 76 72 88 68" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>'
        f'</svg>'
    )


def galazka(klasa="naglowek-strony__ornament"):
    """Ornament nagłówka podstrony — gałązka z rozetką w kolorze jednostki (currentColor)."""
    liscie = ""
    for i, y in enumerate((150, 118, 86)):
        liscie += (
            f'<path d="M100 {y} C84 {y-6} 66 {y-18} 54 {y-36} C74 {y-32} 92 {y-20} 100 {y-10}Z" fill="currentColor"/>'
            f'<path d="M100 {y} C116 {y-6} 134 {y-18} 146 {y-36} C126 {y-32} 108 {y-20} 100 {y-10}Z" fill="currentColor"/>'
        )
    return (
        f'<svg class="{klasa}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">'
        f'<rect x="96" y="60" width="8" height="132" rx="4" fill="currentColor"/>'
        + liscie
        + "".join(f'<ellipse cx="100" cy="22" rx="9" ry="20" fill="currentColor" transform="rotate({i*45} 100 44)"/>' for i in range(8))
        + f'<circle cx="100" cy="44" r="15" fill="{SLONCE}"/><circle cx="100" cy="44" r="7" fill="{ATRAMENT}"/>'
        f'</svg>'
    )


def mapa_tlo():
    """Uproszczony, dekoracyjny „plan” pod przyciskiem mapy."""
    return (
        '<svg class="mapa__tlo" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
        '<rect width="600" height="400" fill="#e3ecdd"/>'
        '<path d="M-20 300 C120 260 220 330 360 290 S560 230 640 260" stroke="#b9cfe9" stroke-width="38" fill="none"/>'
        '<path d="M0 120 L600 170 M120 0 L170 400 M380 0 L420 400 M0 40 L600 70" stroke="#fff" stroke-width="12"/>'
        '<path d="M0 220 L600 210" stroke="#fff" stroke-width="18"/>'
        '<rect x="200" y="90" width="80" height="60" rx="6" fill="#d2dfca"/><rect x="440" y="90" width="110" height="70" rx="6" fill="#d2dfca"/>'
        '<rect x="30" y="140" width="70" height="60" rx="6" fill="#d2dfca"/>'
        '</svg>'
    )
