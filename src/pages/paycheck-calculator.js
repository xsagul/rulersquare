const { SITE } = require("../layout");
const D = require("../data/tax2026");

const money = n => "$" + n.toLocaleString("en-US");
const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

/* Bracket table for one filing status, rendered from the same data the
 * calculator runs on, so the page can never drift from the engine. */
function bracketTable(status) {
  const rows = [];
  let lower = 0;
  for (const [upper, rate] of D.FEDERAL_BRACKETS[status]) {
    rows.push([
      (rate * 100).toFixed(0) + "%",
      upper === Infinity ? money(lower) + " and up" : money(lower) + " – " + money(upper),
    ]);
    lower = upper;
  }
  return table(["Rate", "Taxable income"], rows);
}

/* JSON has no Infinity, so the top bracket ships as null and is reopened in
 * the browser before the engine runs. */
const TAX_JSON = JSON.stringify({
  FEDERAL_BRACKETS: Object.fromEntries(Object.entries(D.FEDERAL_BRACKETS).map(
    ([k, v]) => [k, v.map(([u, r]) => [u === Infinity ? null : u, r])])),
  STANDARD_DEDUCTION: D.STANDARD_DEDUCTION,
  FICA: D.FICA,
  RETIREMENT: D.RETIREMENT,
});

function paycheckPage(cfg) {
  const stateRate = cfg.stateRatePct || 0;
  const lockState = cfg.lockState === true;
  const noTax = lockState && stateRate === 0;

  const faq = cfg.faq.concat([
    ["How much is taken out of my paycheck in taxes?",
     "For most people it is federal income tax plus 7.65% in FICA — 6.2% Social Security on the first " + money(D.FICA.socialSecurityWageBase) + " of wages and 1.45% Medicare on everything. " + (noTax ? "There is no state income tax to add here." : "State income tax comes on top of that.") + " A single filer on $52,000 keeps roughly 84% of gross before any state tax."],
    ["Why is my bonus taxed so heavily?",
     "It usually is not — it just looks that way. Employers commonly withhold bonuses at a flat 22% supplemental rate, and payroll systems that annualise a large cheque assume you earn that much every period. The extra comes back when you file. Your real tax is settled on the return, not on the payslip."],
    ["Does a 401(k) contribution lower my taxes?",
     "It lowers your federal and state income tax, because the money comes out before those are calculated. It does not lower Social Security or Medicare — FICA is taken on your full wages regardless. That is why a 10% 401(k) contribution does not cut your total deductions by anything like 10%."],
  ]);

  return {
    path: cfg.path,
    title: cfg.title,
    description: cfg.description,
    crumbs: cfg.h1,
    lastmod: "2026-09-22",
    schema: [
      {
        "@context": "https://schema.org", "@type": "WebApplication",
        name: cfg.h1, url: SITE.url + cfg.path,
        applicationCategory: "FinanceApplication", operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      },
      {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
      {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: cfg.h1, item: SITE.url + cfg.path },
        ],
      },
    ],
    scripts: `<script>window.RS_TAX=${TAX_JSON};
Object.keys(window.RS_TAX.FEDERAL_BRACKETS).forEach(function(k){var b=window.RS_TAX.FEDERAL_BRACKETS[k];b[b.length-1][0]=Infinity;});
</script>
<script src="/assets/paycheck.js?v=VERSION" defer></script>`,
    body: `
<h1>${cfg.h1}</h1>
<p class="lede">${cfg.lede}</p>

<form class="calc" id="paycheck-form" novalidate>
  <div class="calc-inputs">
    <div class="field">
      <label class="label" for="f-gross">Gross pay <span class="hint">(per pay period, before anything is taken out)</span></label>
      <div class="unit"><input id="f-gross" type="number" inputmode="decimal" min="0" max="1000000000" step="any" name="gross" value="" required><em>$</em></div>
    </div>

    <div class="field">
      <label class="label" for="f-periods">Pay frequency</label>
      <div class="select"><select id="f-periods" name="periodsPerYear">
        ${D.PAY_PERIODS.map(([id, label, n]) => `<option value="${n}"${id === "biweekly" ? " selected" : ""}>${label}</option>`).join("\n        ")}
      </select></div>
    </div>

    <fieldset class="tabs">
      <legend>Filing status</legend>
      <label><input type="radio" name="status" value="single" checked><span>Single</span></label>
      <label><input type="radio" name="status" value="married"><span>Married, jointly</span></label>
      <label><input type="radio" name="status" value="head"><span>Head of household</span></label>
    </fieldset>

    <details class="calc-options">
    <summary>Pre-tax deductions &amp; state rate</summary>
    <div class="options-body row3">
      <div class="field">
        <label class="label" for="f-401k">401(k)</label>
        <div class="unit"><input id="f-401k" type="number" inputmode="decimal" min="0" max="100" step="any" name="pretax401kPct" value=""><em>%</em></div>
      </div>
      <div class="field">
        <label class="label" for="f-other">Health etc.</label>
        <div class="unit"><input id="f-other" type="number" inputmode="decimal" min="0" step="any" name="pretaxOtherPerPeriod" value=""><em>$</em></div>
      </div>
      <div class="field">
        <label class="label" for="f-state">State tax rate${lockState ? "" : ' <span class="hint">(rough estimate)</span>'}</label>
        <div class="unit"><input id="f-state" type="number" inputmode="decimal" min="0" max="100" step="any" name="stateRatePct" value="${stateRate}"${lockState ? " readonly" : ""}><em>%</em></div>
      </div>
    </div>
    </details>
    <p class="note">${cfg.inputNote}</p>
    <p class="note">Federal withholding assumes one job and no dependents, credits, extra income or W-4 adjustments.</p>
    <button type="submit" class="btn-calc">Calculate</button>
  </div>

  <div class="calc-results" aria-live="polite">
    <p class="empty-state" id="r-empty">Enter your pay above and press <b>Calculate</b>.</p>
    <div id="r-out" hidden>
    <p class="big">Take-home pay<strong id="r-net">$0.00</strong></p>
    <p class="big-alt"><span id="r-net-annual">$0</span> a year</p>
    <ul class="results-list">
      <li><span>Gross, annual</span><b id="r-gross-annual">—</b></li>
      <li><span>Federal income tax</span><b id="r-federal">—</b></li>
      <li><span>${cfg.stateLabel}</span><b id="r-state">—</b></li>
      <li><span>Social Security <span class="sub">(6.2%)</span></span><b id="r-ss">—</b></li>
      <li><span>Medicare <span class="sub">(1.45%)</span></span><b id="r-medicare">—</b></li>
      <li><span>401(k), pre-tax</span><b id="r-401k">—</b></li>
      <li><span>Total tax</span><b id="r-total-tax">—</b></li>
      <li><span>Effective tax rate</span><b id="r-effective">—</b></li>
      <li><span>Top federal bracket</span><b id="r-marginal">—</b></li>
      <li><span>You keep</span><b id="r-takehome">—</b></li>
    </ul>
    <p class="tip">An estimate for the 2026 tax year. It does not replace your employer's payroll system or advice from a tax professional.</p>
    </div>
  </div>
</form>

<div class="prose">
<h2>How to work out your take-home pay</h2>
<p>${cfg.intro}</p>
<ol>
  <li><strong>Start from annual gross.</strong> Multiply your gross per pay period by the number of periods — 26 if you are paid every two weeks, 24 if twice a month. Those two are not the same, and mixing them up is the most common mistake.</li>
  <li><strong>Take out pre-tax deductions.</strong> A traditional 401(k) and Section 125 health premiums come off before income tax is figured.</li>
  <li><strong>Apply the standard deduction.</strong> For 2026 that is ${money(D.STANDARD_DEDUCTION.single)} single, ${money(D.STANDARD_DEDUCTION.married)} married filing jointly, ${money(D.STANDARD_DEDUCTION.head)} head of household. What is left is your taxable income.</li>
  <li><strong>Run it through the brackets.</strong> Only the income inside each band is taxed at that band's rate — a raise into the 22% bracket does not tax your whole salary at 22%.</li>
  <li><strong>Add FICA.</strong> 6.2% Social Security on wages up to ${money(D.FICA.socialSecurityWageBase)}, plus 1.45% Medicare with no ceiling.</li>
</ol>

<h3>Worked example: ${cfg.example.label}</h3>
<p>${cfg.example.text}</p>

<h2>2026 federal income tax brackets</h2>
<p>These are the rates the calculator uses, applied to income after the standard deduction.</p>
<h3>Single filers</h3>
${bracketTable("single")}
<h3>Married filing jointly</h3>
${bracketTable("married")}
<h3>Head of household</h3>
${bracketTable("head")}
<p class="note">Standard deduction for 2026: ${money(D.STANDARD_DEDUCTION.single)} single, ${money(D.STANDARD_DEDUCTION.married)} married filing jointly, ${money(D.STANDARD_DEDUCTION.head)} head of household.</p>

<h2>Social Security and Medicare</h2>
<p>FICA is the flat part of your payroll tax, and it comes out of the first dollar — there is no deduction or threshold to clear first.</p>
${table(["Tax", "Rate", "Applies to"], [
  ["Social Security", "6.2%", "Wages up to " + money(D.FICA.socialSecurityWageBase) + " for 2026"],
  ["Medicare", "1.45%", "All wages, no ceiling"],
  ["Additional Medicare", "0.9%", "Payroll withholds it after one employee reaches $200,000"],
])}
<p>Your employer pays a matching 6.2% and 1.45% that never appears on your payslip. If you are self-employed you pay both halves, which is what the 15.3% self-employment tax is.</p>
<p>Once your wages pass ${money(D.FICA.socialSecurityWageBase)} in a year, Social Security stops coming out and your cheques get noticeably bigger for the rest of the year. It restarts every January. Additional Medicare withholding begins after one employer pays you $200,000; your final liability can differ when you file jointly.</p>

<h2>What pre-tax deductions actually save you</h2>
<p>This is where most paycheck estimates go wrong, because the two kinds of deduction behave differently:</p>
<ul>
  <li><strong>Traditional 401(k):</strong> reduces federal and state income tax. Does <em>not</em> reduce Social Security or Medicare. FICA is calculated on your full wages.</li>
  <li><strong>Section 125 health, dental and vision premiums:</strong> reduce income tax <em>and</em> FICA. That makes a dollar of health premium worth slightly more than a dollar of 401(k) in immediate tax saved.</li>
  <li><strong>Roth 401(k):</strong> reduces nothing today. It comes out after tax, so your take-home drops by the full contribution.</li>
</ul>
<p>Put 10% into a traditional 401(k) on a $52,000 salary and you shelter $5,200 from income tax — but you still pay Social Security and Medicare on the whole $52,000. The calculator caps regular employee contributions at the 2026 limit of ${money(D.RETIREMENT.employee401kLimit)}; age-based catch-up contributions are not included.</p>

<h2>Why your payslip and your tax return disagree</h2>
<p>Withholding is a forecast, not a bill. Payroll assumes every cheque is typical and annualises it. Anything that breaks that assumption — a bonus, overtime, a mid-year raise, starting a job in June — makes the forecast wrong, and the return settles up.</p>
<p>Bonuses are the clearest case. Many employers withhold supplemental pay at a flat 22%, regardless of your actual bracket. If your marginal rate is 12%, too much came out and you get it back. If it is 32%, too little came out and you owe.</p>

${cfg.stateSection}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join("\n")}

<h2>Related calculators</h2>
<div class="grid">
  ${cfg.related.map(([href, label]) => `<a class="card" href="${href}"><b>${label}</b></a>`).join("\n  ")}
</div>

<h2>References</h2>
<ul class="refs">
  <li>Federal brackets and standard deduction: <a href="https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill">IRS 2026 inflation adjustments</a>.</li>
  <li>Federal paycheck withholding method: <a href="https://www.irs.gov/publications/p15t">IRS Publication 15-T (2026)</a>.</li>
  <li>Social Security wage base and rates: <a href="https://www.ssa.gov/oact/COLA/cbb.html">Social Security Administration 2026 figures</a>.</li>
  <li>401(k) limit: <a href="https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500">IRS 2026 retirement-plan limits</a>.</li>
  <li>This calculator estimates withholding. It is not tax advice, and it does not model every credit, local tax or W-4 adjustment. Check anything that matters with a tax professional.</li>
</ul>
</div>
`,
  };
}

module.exports = { paycheckPage };
