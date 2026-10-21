#!/usr/bin/env node
/* Tells Bing and Yandex (IndexNow) about new or changed pages, the moment they
 * ship, instead of waiting for a crawl. Google does not take part in IndexNow;
 * for Google the sitemap and Search Console remain the route.
 *
 *   node scripts/indexnow.js                        every URL in the live sitemap
 *   node scripts/indexnow.js /gravel-calculator/    only these pages
 *
 * Run it after a deploy that adds or changes content. The key is the name of
 * the one hex .txt file in src/public/, which the build copies to the site root.
 */
const fs = require("fs");
const path = require("path");

const HOST = "rulersquare.com";
const ORIGIN = `https://${HOST}`;

const keyFile = fs.readdirSync(path.join(__dirname, "../src/public")).find(f => /^[a-f0-9]{8,128}\.txt$/i.test(f));
if (!keyFile) {
  console.error("No IndexNow key file (<hex>.txt) in src/public/.");
  process.exit(1);
}
const KEY = keyFile.replace(/\.txt$/i, "");
const KEY_LOCATION = `${ORIGIN}/${keyFile}`;

const toFull = a => /^https?:\/\//i.test(a) ? a : ORIGIN + (a.startsWith("/") ? a : "/" + a);

async function fromSitemap() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  return [...(await res.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
}

(async () => {
  const args = process.argv.slice(2);
  const urlList = args.length ? args.map(toFull) : await fromSitemap();

  // A key that is not live yet gets a 403, so check before submitting.
  const live = await fetch(KEY_LOCATION);
  if (!live.ok || (await live.text()).trim() !== KEY) {
    console.error(`The key is not served at ${KEY_LOCATION} yet. Deploy first.`);
    process.exit(1);
  }

  console.log(`IndexNow: ${urlList.length} URLs for ${HOST}`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  // 200 and 202 mean accepted; 403 means the key was not found; 422 means a bad URL or key.
  const body = await res.text();
  console.log(`HTTP ${res.status}${body ? ": " + body : ""}`);
  if (res.status !== 200 && res.status !== 202) process.exit(1);
})().catch(e => { console.error(e.message); process.exit(1); });
