/* Author identity, shared by every page that carries an E-E-A-T signal.
 *
 * `sameAs` ties the byline to verifiable external profiles so Google can build
 * a knowledge graph entry around the person rather than an anonymous site.
 * That matters here because the paycheck and tax pages are YMYL: a financial
 * page with no identifiable author behind it is the weakest kind there is.
 *
 */

const PERSON_ID = "https://rulersquare.com/#person";

const AUTHOR = {
  name: "Știuriuc Sorin-Marian",
  jobTitle: "Full-stack developer",
  url: "https://rulersquare.com/about/",
  description:
    "Builds and maintains Ruler Square’s material, project cost and US pay calculators.",
  sameAs: [
    "https://www.linkedin.com/in/%C8%99tiuriuc-sorin-marian/",
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

module.exports = { AUTHOR, PERSON_ID, personSchema };
