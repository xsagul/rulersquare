/* Editorial identity and structured-data Person/Organization references.
 *
 * Calculator pages carry a clean brand byline (`Ruler Square`) with update date
 * and methodology link. Founder/maintainer details and Person schema live on
 * /about/ and /methodology/ so every page stays focused on US home projects.
 */

const PERSON_ID = "https://rulersquare.com/#person";
const ORG_ID = "https://rulersquare.com/#organization";

const AUTHOR = {
  name: "Știuriuc Sorin-Marian",
  jobTitle: "Founder & Software Engineer",
  url: "https://rulersquare.com/about/",
  description:
    "Founder and engineer behind Ruler Square, building transparent material, home-system, and project cost calculators.",
  sameAs: [
    "https://www.linkedin.com/in/sorin-stiuriuc/",
    "https://github.com/xsagul",
    "https://dev.to/sorin_stiuriuc",
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

const UPDATED = { iso: "2026-11-19", text: "November 19, 2026" };

const byline = (updated = UPDATED) =>
  `<p class="byline">Updated <time datetime="${updated.iso}">${updated.text}</time> · <a href="/methodology/">Formulas &amp; methodology</a></p>`;

const authorRef = { "@type": "Organization", "@id": ORG_ID, name: "Ruler Square", url: "https://rulersquare.com/" };

module.exports = { AUTHOR, PERSON_ID, ORG_ID, personSchema, UPDATED, byline, authorRef };
