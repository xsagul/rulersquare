# CLAUDE.md — rulersquare.com

Site în engleză, pentru SUA: calculatoare de materiale și costuri de proiect.
Proprietar: Știuriuc Sorin-Marian. Decizia de nișă, concurenții și planul pe etape sunt în
`PROJECT_BRIEF.md`; aici stau doar regulile de lucru și faptele care nu se văd din cod.

## Ținta

**100 €/lună din reclame** (decis de proprietar pe 21 octombrie 2026). La un RPM de 5–8 $ pe
trafic de calculatoare din SUA înseamnă ~15.000–20.000 de afișări pe lună. Primul pas nu e
monetizarea, ci indexarea: pe 21 octombrie 2026, Search Console arăta 3 pagini indexate din 69,
60 „Discovered – currently not indexed” și **0 linkuri externe**. Tehnic, site-ul e curat.

## Stack și publicare

- Generator static în Node, fără framework: `node build.js` → `dist/`. Fără dependențe la rulare.
- Cloudflare Workers cu assets statice, contul `rulersquare` (`c301a52e9c21052e9b611b05e38c19dc`).
  `npm run deploy` rulează build-ul, testele și auditul, apoi `wrangler deploy`. Wrangler trebuie
  să fie logat cu acces la contul `rulersquare`; un token pe contul personal dă eroarea 10000.
- **Publicarea e automată din 22 noiembrie 2026:** Cloudflare Workers Builds e legat de repo-ul
  `xsagul/rulersquare`, branch-ul `main` (build `npm run build`, deploy `npx wrangler deploy`).
  Orice push pe `main` publică site-ul; rulează `npm run check` înainte de push, fiindcă build-ul
  din Cloudflare nu rulează testele. `npm run deploy` rămâne varianta manuală.
- `npm run check` = build + 305 de teste pe motoare + audit (sitemap, canonical, metadata,
  JSON-LD, linkuri interne). Rulează-l înainte de orice commit.
- `npm run indexnow` trimite sitemap-ul la Bing și Yandex după un deploy cu conținut nou.
  Cheia e singurul fișier `<hex>.txt` din `src/public/`; tot ce e acolo ajunge în rădăcina site-ului.
- Repo public: https://github.com/xsagul/rulersquare.

## Reguli de lucru

- **Autonomie** pe cod, SEO on-page, conținut, audit, commit și deploy nedistructiv. Proprietarul
  e chemat doar pentru: login-uri, CAPTCHA, crearea de conturi, plăți, mesaje sau postări în
  numele lui (dev.to, Reddit, LinkedIn, GitHub), modificări în conturile Google, Cloudflare,
  AdSense și schimbări care șterg sau mută secțiuni întregi.
- **Backlinkuri:** active pe site care atrag linkuri (widget cu credit dofollow, date
  descărcabile), nu outreach agresiv. Niciodată linkuri cumpărate. Lecție din salariile.ro: un
  link din interiorul unui `<iframe>` nu e backlink pentru site-ul gazdă; creditul trebuie să
  stea în codul de integrare, în afara iframe-ului.
- **Indexarea înainte de volum.** Google nu deschide paginile unui domeniu fără autoritate doar
  pentru că sunt în sitemap (la salariile.ro, 100+ pagini de meserie au rămas „descoperite,
  necrawlate”). O pagină nouă se adaugă pentru o intenție de căutare verificată în SE Ranking,
  nu pentru un cuvânt izolat.
- **O cifră are un singur proprietar.** Densitățile stau în `src/data/materials.js`, intervalele de cost în `src/data/costs.js` și
  `src/data/costs-more.js`. Nu rescrie o valoare în proză ca s-o ai la îndemână.
- **Fiecare cifră are sursă** (`/methodology/`). Cantitățile se rotunjesc în sus.
- **Arată dovezi:** comanda rulată și ce a returnat, nu doar „am rezolvat”.

## Diagramele de măsurare

Stilul ales în testul A/B (21 octombrie 2026): săgeți cu vârf la ambele capete și numele
măsurătorii scris întreg. Stau în starea goală a panoului de rezultate. Regula cine primește
desen și cine nu e în comentariul din `src/diagrams.js`. Pe scurt: niciun desen, decât unul care
induce în eroare.

## Structura și aspectul — 21 noiembrie 2026

- **10 grupe pe proiect**, nu pe tip de răspuns: lista e în `src/data/groups.js`, iar raționamentul în
  `research/structura-2026-11-21.md`. Într-o grupă stau împreună calculatoarele de cantitate și
  cele de cost. `test.js` verifică faptul că fiecare calculator e în exact o grupă.
- **Nicio adresă nouă.** Cele 4 hub-uri vechi rămân: `/construction-calculators/` le are pe toate,
  cu ancoră pe grupă; `/landscaping-calculators/`, `/home-systems-calculators/` și `/cost-calculators/`
  le au pe ale lor. Firul de navigare al fiecărui calculator arată grupa (setat în `build.js`).
- **Aspectul „plan tehnic”** (direcția C, aleasă de proprietar): hârtie cu grilă, cerneală
  #1f3a5f, portocaliu doar pentru acțiuni și cote, colțuri drepte, titluri cu serife.
- **Desenele grupelor** (`src/assets/g-*.webp`) sunt generate în ChatGPT Image pe o singură planșă,
  pentru stil unitar, și verificate cotă cu cotă înainte să fie puse. Regula proprietarului: orice
  imagine cu desen tehnic vine din ChatGPT Image, nu e desenată de agent. Planșele sunt în
  `research/design-2026-11-21/`.

## Starea curentă — 15 noiembrie 2026

- Proprietarul a autorizat refacerea, eliminarea paginilor nepotrivite și extinderea pe intenții valoroase.
- Cele șase calculatoare de salarii și hub-ul lor sunt retrase, conform cererii din conversația Claude.
- Catalog: 69 de calculatoare, în trei hub-uri (Construction, Landscaping, Costs); 79 de pagini HTML.
- Au fost integrate cele 16 pagini de cost și 6 calculatoare începute de Claude.
- **Culoarea foii rămâne `#f6f1e6`** (proprietarul, 22 noiembrie 2026): comparată cu hârtia măsurată din pozele de produs
  ale caietelor premium (Rhodia Goalbook ~`#fef7e6`, Midori MD ~`#fefae7`, Leuchtturm1917 ~`#fcfbee`), a noastră a
  rămas cea mai frumoasă; pozele de studio nu dau culoarea reală a hârtiei. Nu se repropune.
- **Sistemul „caiet”** (proprietarul, 22 noiembrie 2026), regulile în `src/assets/style.css`, secțiunea „Notebook
  system”: unitatea e pătratul de 24 px; rândurile de text au 1 unitate (titlurile mari 2) și stau cu baza literelor pe
  linie; orice linie desenată (riglă, separator, chenar) cade pe o linie a grilei; cutiile încep pe o linie și au
  24n+1 px, cu chenarul desenat înăuntru; în calculator: margini de 1 unitate, câmpuri și butoane de 2, rânduri de 2;
  spațiile sunt unități întregi, desenele sunt exceptate. `src/assets/grid.js` rotunjește cutiile și pune pe linie ce
  urmează după conținut de orice înălțime și măsoară fontul din browserul vizitatorului ca să pună baza literelor
  pe linie (fonturile diferă pe Windows, Mac și iPhone). Scara de text: 38/44 pe desktop — singura excepție de la caiet, asumată de proprietar pe 22 noiembrie 2026 fiindcă arată cel mai bine; primul rând stă pe linie, al doilea cu 4 px deasupra (26/24 pe telefon: proprietarul vrea titlul pe maxim 2 rânduri, fără aer de SaaS). Ierarhia se face prin grosime, în trepte mici, nu prin transparență: titlul paginii 700, titlurile de secțiune 600, grupele și întrebările 600 la mărime mai mică. Titlurile folosesc Newsreader (variabil, găzduit pe site, `src/assets/newsreader.woff2`, 132 KB, descărcat de la Google Fonts; ales de proprietar pe 22 noiembrie 2026 dintre Georgia, Source Serif 4, Literata, Fraunces, Bitter, IBM Plex Serif și Geist); Georgia are doar 400 și 700; sub titlul de secțiune de pe prima pagină stă o linie subțire de cerneală care se întrerupe în jurul cozilor literelor, nu le taie, 22/24, 20/24,
  18/24, 17/24, 15/24, 13–14/24. Conținutul are lățimea în pătrate întregi, liniile verticale pornesc de la marginea
  lui. `node scripts/grid-check.js`, `--fonts` (alte fonturi) și `--all-sizes` (telefon mic, tabletă, laptop) trebuie să dea 100%
  înainte de orice push care atinge CSS-ul.
- Prima pagină are căutarea și cele 10 grupe, fără calculator în ea (proprietarul, 22 noiembrie 2026: nu aduce nimic
  față de pagina dedicată și împinge grupele în jos). Feet & inches se găsește în grupa Measure și în căutare.
- Paginile de proiect au cel mult trei trimiteri alese manual la pașii următori.
- Nu se adaugă cod AdSense fără ID-ul real al proprietarului.
