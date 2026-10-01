# Hot Frog · hotdogovi s karakterom

One-page web stranica za **Hot Frog** fast food, Ozaljska ul. 34, Zagreb (Trešnjevka).

**Live:** https://kriscro99.github.io/hot-frog/

## Sadržaj
- Tekstovi, jelovnik (bez cijena) i fotografije preuzeti s klijentove stranice hotfrog.hr.
- Wolt / Glovo linkovi i telefon (097 766 1373) preuzeti s Google Maps i Wolt stranice restorana.
- Radno vrijeme: pon – ned 11:00 – 23:00 (s hotfrog.hr). Status "Otvoreno / Zatvoreno" računa se u `js/main.js` (`OPEN` / `CLOSE`, vrijeme Europe/Zagreb).

## SEO
Klijent već ima svoju stranicu (hotfrog.hr), pa ova verzija ima `<meta name="robots" content="noindex, follow">` u `index.html`.
Kad se stranica prebaci na vlastitu domenu: obrisati tu liniju i promijeniti `canonical` / `og:url` / `og:image` / JSON-LD `url` na novu domenu.

## Struktura
- `index.html` – cijela stranica (natpis HOT FROG je inline SVG, vektoriziran iz logotipa)
- `css/style.css`, `css/fonts.css` – stil i lokalno hostani fontovi (Anton, Bricolage Grotesque, Caveat Brush)
- `js/main.js` – intro, navigacija, scroll animacije, hot dog showcase, "Složi svoju kombinaciju", galerija, FAQ
- `img/` – logo, izrezana jela (`menu/`), galerija, pozadine kategorija (`bg/`), og-image i ikone
