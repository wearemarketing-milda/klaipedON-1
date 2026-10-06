# KlaipedON Handoff

Šitas projektas sąmoningai kuriamas kaip tarpinis sluoksnis tarp dizaino/prototipo ir būsimos WordPress temos.

## Techninis principas

- Frontend sluoksnis: `HTML + Tailwind CSS + minimalus vanilla JS`
- Tikslas: greitas dizaino iteravimas be sunkios framework priklausomybės
- Handoff tikslas: kad WordPress developeris galėtų sekcijas perkelti į `template-parts` arba ACF blokus

## Kodėl ne React

- Čia nereikia SPA logikos
- WordPress integracijoje paprastas HTML daug lengviau transformuojamas į PHP partialus
- ACF pagrindu valdomam turiniui semantinis markup yra svarbiau nei front-end framework abstrakcijos

## Rekomenduojama WordPress integracijos kryptis

- `header`, `footer`, `hero`, `about`, `feature-grid`, `process`, `contact` dalinti į atskirus partial failus
- Dizaino tokenus iškelti į temos CSS kintamuosius arba `theme.json`, priklausomai nuo pasirinkto build setup
- Interakcijas palikti mažas ir izoliuotas, kad būtų paprasta perkelti į temos JS failą

## HTML žymėjimo konvencijos

- `data-wp-partial` nurodo numatomą WordPress partial kelią
- `data-acf-field` nurodo vienetinį lauką
- `data-acf-repeater` nurodo repeater tipo turinį
- `data-acf-sub-field` nurodo repeater įrašo vidinį lauką

## El. parduotuvė

Visas prototipas yra vienoje vietoje. Kiti svetainės puslapiai šitam srautui nepriklauso.

| URL | Failai | WooCommerce |
|---|---|---|
| `/el-parduotuve/` | `el-parduotuve/index.html`, `src/scripts/shop.js` | `archive-product.php` |
| `/el-parduotuve/{slug}/` | `el-parduotuve/preke/index.html`, `src/scripts/shop-product.js` | `content-single-product.php` |
| Krepšelis (drawer visuose puslapiuose) | `src/scripts/shop-cart.js` | krepšelio fragmentas |
| `/el-parduotuve/atsiskaitymas/` | `el-parduotuve/atsiskaitymas/index.html`, `src/scripts/shop-checkout.js` | `woocommerce/checkout/form-checkout.php` |
| `/el-parduotuve/aciu/` | `el-parduotuve/aciu/index.html`, `src/scripts/shop-thanks.js` | `checkout/thankyou.php` |

Duomenys ir turtai:

- `src/data/shop-products.js` — prekės
- `src/data/shop-lockers.js` — Omniva paštomatai Klaipėdos regione
- `public/el-parduotuve/images/` — prekių nuotraukos
- `public/el-parduotuve/payments/` — mokėjimo ir Omniva ženklai

Be šitų bendrų failų srautas neįsijungia:

- `src/main.js` — paleidžia parduotuvės skriptus ir registruoja `Truck` bei `ShieldCheck` ikonas
- `vite.config.js` — keturi build įėjimai ir perrašymas, kad prekės slug nepavirstų atsiskaitymo ar padėkos puslapiu
- `src/styles.css` — parduotuvės taisyklės pridėtos failo gale, po `@layer` blokų
- `src/scripts/site-ui.js` — filtrų mygtuko tekstas parduotuvėje ir dalijimosi mygtukas

Veikianti peržiūra: [klaipedon-deploy.vercel.app/el-parduotuve/](https://klaipedon-deploy.vercel.app/el-parduotuve/).

Prototipo taisyklės, kurių nereikia laikyti galutinėmis WooCommerce kainomis:

- Kainos su PVM. Paštomatas 3,00 €, kurjeris į adresą 5,00 €. Tai laikinos sumos.
- Mokėjimas numatytas per Paysera (bankas, Apple Pay, kortelė, Paysera paskyra). Kortelės duomenų forma čia nerenka.
- Krepšelis laikomas `localStorage` rakte `klaipedon-shop-cart`. Atsiskaitymo juodraštis yra `sessionStorage` raktas `klaipedon-checkout`, padėkos suvestinė — `klaipedon-order`.
- Nėra paskyros, DPD, atsiėmimo parduotuvėje ir veikiančio nuolaidos kodo.

## Rekomenduojama rankoff seka

1. Užbaigti Figma dizainą pagal šitą section-first struktūrą
2. Sulyginti galutinį HTML su realiomis sekcijomis ir ACF poreikiu
3. Paruošti galutinį `docs/ACF-MAP.md`
4. Perduoti developer'iui kartu su dizainu, HTML preview ir turinio modeliu
