# Ruler Square

Source for **[rulersquare.com](https://rulersquare.com)** — free calculators for
building materials and home project costs.

69 calculators: concrete, gravel, crushed stone, sand, topsoil, mulch, asphalt,
road base, square footage, roof pitch, stairs, framing, rebar, brick, pavers,
drywall, tile, siding, paint, insulation, board feet, fence, deck, sod, ramps,
tank volume, project cost ranges, flooring, carpet, wallpaper, linear feet and pool volume.

## Why the source is public

Every page shows the formula it used. Publishing the code is the next step:
the arithmetic behind a number can be read rather than trusted. If a figure
disagrees with its stated source, that is a bug — open an issue.

## How it is built

A static site generator in plain Node, no framework and no runtime
dependencies. `build.js` renders every page to `dist/`, which Cloudflare serves.

```
src/
  assets/        calculation engines + styles; each engine runs in the
                 browser and in the test suite from the same file
  data/          material densities, sourced cost ranges, page definitions
  pages/         page templates and content
  author.js      shared author identity (schema.org Person)
  layout.js      shared HTML shell
  og.js          Open Graph image, drawn at build time with no dependencies
build.js         the generator
test.js          305 assertions over every engine
```

## Commands

```bash
npm install
npm test       # 305 assertions; fails loudly rather than silently
npm run build  # production build to dist/
npm run dev    # local build, adds a translation helper that never ships
npm run check  # build, engine tests and generated-page audit
npm run deploy # check, then deploy to the existing Cloudflare Worker
```

## Design decisions worth knowing

- **Engines are shared, not duplicated.** Each calculator module exports its
  maths for Node and attaches its UI in the browser, so the tested code and the
  shipped code are the same code.
- **Worked examples are checked against the engine.** If a page's example
  disagrees with the calculator, the test suite fails.
- **Quantities round up, never to nearest.** Running short mid-job costs more
  than ordering long.
- **A measured field gets a unit selector; a trade constant does not.** Nominal
  lumber thickness is always inches; offering yards there is noise.
- **No page ships a figure without a source.** See
  [rulersquare.com/methodology](https://rulersquare.com/methodology/).

## Author

Built and maintained by Știuriuc Sorin-Marian.

[LinkedIn](https://www.linkedin.com/in/sorin-stiuriuc/) ·
[GitHub](https://github.com/xsagul) ·
[dev.to](https://dev.to/sorin_stiuriuc)

## Licence

Source code is MIT. Site content and the calculator copy are not — please do
not republish the pages themselves.
