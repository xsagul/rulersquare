/* Author identity, shared by every page that carries an E-E-A-T signal.
 *
 * `sameAs` ties the byline to verifiable external profiles so Google can build
 * a knowledge graph entry around the person rather than an anonymous site.
 * Cost pages quote money figures, so each one names who maintains it and
 * where every number comes from.
 *
 */

const PERSON_ID = "https://rulersquare.com/#person";

const AUTHOR = {
  name: "Știuriuc Sorin-Marian",
  jobTitle: "Full-stack developer",
  url: "https://rulersquare.com/about/",
  description:
    "Builds and maintains Ruler Square’s construction material and project cost calculators, and salariile.ro, an independent Romanian salary calculator.",
  sameAs: [
    "https://www.linkedin.com/in/sorin-stiuriuc/",
    "https://github.com/xsagul",
    "https://dev.to/sorin_stiuriuc",
    // Same Person @id on a site with its own published methodology and source
    // code. The reciprocal sameAs there is what makes the pair verifiable.
    "https://salariile.ro/despre",
  ],
};

const personSchema = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: AUTHOR.name,
  url: AUTHOR.url,
  jobTitle: AUTHOR.jobTitle,
  description: AUTHOR.description,
  sameAs: AUTHOR.sameAs,
};

/* The visible half of the same signal: who wrote the page, when it was last
 * checked, and where the arithmetic is explained. The category leaders put
 * this on every calculator; until now it lived only on /about/. */
const UPDATED = { iso: "2026-10-22", text: "October 22, 2026" };
const byline = (updated = UPDATED) => `<p class="byline">By <a href="${AUTHOR.url.replace("https://rulersquare.com", "")}">${AUTHOR.name}</a> · Updated <time datetime="${updated.iso}">${updated.text}</time> · <a href="/methodology/">How we calculate</a></p>`;
const authorRef = { "@type": "Person", "@id": PERSON_ID, name: AUTHOR.name, url: AUTHOR.url };

module.exports = { AUTHOR, PERSON_ID, personSchema, UPDATED, byline, authorRef };
