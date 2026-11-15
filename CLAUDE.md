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

## Starea curentă — 15 noiembrie 2026

- Proprietarul a autorizat refacerea, eliminarea paginilor nepotrivite și extinderea pe intenții valoroase.
- Cele șase calculatoare de salarii și hub-ul lor sunt retrase, conform cererii din conversația Claude.
- Catalog: 69 de calculatoare, în trei hub-uri (Construction, Landscaping, Costs); 79 de pagini HTML.
- Au fost integrate cele 16 pagini de cost și 6 calculatoare începute de Claude.
- Prima pagină folosește căutare, categorii și opt instrumente populare; catalogul complet stă în hub-uri.
- Paginile de proiect au cel mult trei trimiteri alese manual la pașii următori.
- Nu se adaugă cod AdSense fără ID-ul real al proprietarului.
