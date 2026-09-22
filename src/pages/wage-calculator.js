const { SITE } = require("../layout");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const PER_OPTIONS = [
  ["hour", "per hour"],
  ["day", "per day"],
  ["week", "per week"],
  ["biweek", "every two weeks"],
  ["semimonth", "twice a month"],
  ["month", "per month"],
  ["year", "per year"],
];

function wagePage(cfg) {
  const faq = cfg.faq.concat([
    ["How many work hours are in a year?",
     "2,080 at 40 hours a week for 52 weeks. For hourly or daily pay, unpaid weeks reduce the annual total here. For a weekly, monthly or annual salary, the entered pay is kept fixed; fewer work weeks raise its hourly equivalent. Enter the salary you actually expect to earn after any unpaid leave."],
    ["Does 2,080 hours include holidays and vacation?",
     "The usual 2,080-hour conversion includes paid holidays and vacation. Use weeks off only for weeks you want excluded from the hours calculation. For salaried pay, the annual total stays as entered; the calculator does not deduct leave from a salary."],
    ["Why is biweekly pay not the same as twice a month?",
     "Every two weeks gives 26 cheques a year; twice a month gives 24. The annual total is the same, so the twice-monthly cheque is larger. Two months each year contain three biweekly cheques, which is where the feeling of a bonus month comes from."],
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
    scripts: `<script src="/assets/wage.js?v=VERSION" defer></script>`,
    body: `
<h1>${cfg.h1}</h1>
<p class="lede">${cfg.lede}</p>

<form class="calc" id="wage-form" novalidate>
  <div class="calc-inputs">
    <div class="field">
      <label class="label" for="f-amount">${cfg.amountLabel}</label>
      <div class="combo">
        <input id="f-amount" type="number" inputmode="decimal" min="0" max="1000000000" step="any" name="amount" value="" required>
        <select name="per" aria-label="Pay period">
          ${PER_OPTIONS.map(([v, t]) => `<option value="${v}"${v === cfg.defaultPer ? " selected" : ""}>${t}</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="field">
      <label class="label" for="f-hpw">Hours a week</label>
      <div class="unit"><input id="f-hpw" type="number" inputmode="decimal" min="0.001" max="168" step="any" name="hoursPerWeek" value="40" required><em>hrs</em></div>
    </div>

    <details class="calc-options">
    <summary>Days a week, time off &amp; overtime</summary>
    <div class="options-body">
    <div class="field">
      <label class="label" for="f-dpw">Days a week</label>
      <div class="unit"><input id="f-dpw" type="number" inputmode="decimal" min="0.001" max="7" step="any" name="daysPerWeek" value="5" required><em>days</em></div>
    </div>

    <div class="field">
      <label class="label" for="f-unpaid">Weeks off <span class="hint">(0 for the usual 52-week conversion)</span></label>
      <div class="unit"><input id="f-unpaid" type="number" inputmode="decimal" min="0" max="51" step="any" name="unpaidWeeks" value="0"><em>wks</em></div>
    </div>

    <div class="row2" id="ot-row"${cfg.defaultPer === "hour" ? "" : " hidden"}>
      <div class="field">
        <label class="label" for="f-ot">Overtime a week</label>
        <div class="unit"><input id="f-ot" type="number" inputmode="decimal" min="0" step="any" name="overtimeHours" value=""><em>hrs</em></div>
      </div>
      <div class="field">
        <label class="label" for="f-otm">Overtime rate</label>
        <div class="unit"><input id="f-otm" type="number" inputmode="decimal" min="1" step="any" name="overtimeMult" value="1.5"><em>&times;</em></div>
      </div>
    </div>

    <p class="field-help">Hourly and daily pay: weeks off reduce annual earnings. Salary: enter your expected pay after unpaid leave; weeks off only change its hourly equivalent.</p>
    </div>
    </details>
    <button type="submit" class="btn-calc">Calculate</button>
  </div>

  <div class="calc-results" aria-live="polite">
    <p class="empty-state" id="r-empty">Enter your pay above and press <b>Calculate</b>.</p>
    <div id="r-out" hidden>
    <p class="big">${cfg.headline}<strong id="${cfg.headlineId}-headline">$0</strong></p>
    <ul class="results-list">
      <li><span>Hourly</span><b id="r-hourly">—</b></li>
      <li><span>Daily</span><b id="r-daily">—</b></li>
      <li><span>Weekly</span><b id="r-weekly">—</b></li>
      <li><span>Every two weeks</span><b id="r-biweekly">—</b></li>
      <li><span>Twice a month</span><b id="r-semimonthly">—</b></li>
      <li><span>Monthly</span><b id="r-monthly">—</b></li>
      <li><span>Annual</span><b id="r-annual">—</b></li>
      <li><span>Paid hours a year</span><b id="r-hours">—</b></li>
    </ul>
    <div class="cost" id="r-ot-box" hidden>Overtime, annual: <b id="r-ot"></b></div>
    <p class="tip">Gross pay, before tax. For take-home after withholding, use the <a href="/paycheck-calculator/">paycheck calculator</a>.</p>
    </div>
  </div>
</form>

<div class="prose">
<h2>${cfg.h2Intro}</h2>
<p>${cfg.intro}</p>
<div class="formula">${cfg.formula}</div>

<h3>Worked example: ${cfg.example.label}</h3>
<p>${cfg.example.text}</p>

<h2>Common salaries as an hourly rate</h2>
<p>At 40 hours a week and 52 paid weeks — 2,080 hours a year — these are the equivalents:</p>
${table(["Annual salary", "Hourly", "Weekly", "Monthly"], [
  ["$30,000", "$14.42", "$576.92", "$2,500"],
  ["$40,000", "$19.23", "$769.23", "$3,333"],
  ["$50,000", "$24.04", "$961.54", "$4,167"],
  ["$60,000", "$28.85", "$1,153.85", "$5,000"],
  ["$75,000", "$36.06", "$1,442.31", "$6,250"],
  ["$100,000", "$48.08", "$1,923.08", "$8,333"],
  ["$150,000", "$72.12", "$2,884.62", "$12,500"],
])}
<p class="note">A rough full-time shortcut: double the hourly rate and multiply by 1,000. $25 an hour is about $50,000 a year, or exactly $52,000 at 2,080 paid hours.</p>

<h2>Where the simple conversion goes wrong</h2>
<p>Multiplying by 2,080 is right for most salaried jobs and wrong for several common situations:</p>
<ul>
  <li><strong>Unpaid time off.</strong> A contractor who takes four unpaid weeks works 1,920 hours, not 2,080. The same annual figure means an 8% higher real hourly rate — which matters when you are comparing a contract offer against a salaried one.</li>
  <li><strong>Overtime.</strong> An hourly worker doing ten hours of time-and-a-half every week earns 37.5% more than the base rate suggests. The calculator adds it separately.</li>
  <li><strong>Part-time.</strong> The 2,080 figure assumes 40 hours. At 25 hours a week the divisor is 1,300, and using the wrong one understates the hourly rate by more than half.</li>
  <li><strong>Benefits.</strong> A salaried role with health cover, a 401(k) match and paid leave is worth substantially more than the same headline number as a contractor. None of that shows up in an hourly conversion.</li>
</ul>

<h2>Comparing a contract rate to a salary</h2>
<p>This is where the arithmetic earns its keep. A contractor billing $60 an hour is not earning the equivalent of a $124,800 salary, because the comparison ignores three things.</p>
<p>First, unpaid leave: take four weeks off and you bill 1,920 hours, not 2,080, so the real figure is $115,200. Second, self-employment tax: you pay both halves of Social Security and Medicare, 15.3% instead of 7.65%, which costs roughly another 7.65% of net earnings. Third, benefits you now buy yourself — health insurance alone can run $6,000 to $20,000 a year for a family.</p>
<p>The rule of thumb in most trades is that a contract rate needs to be 25–40% above the salaried equivalent to leave you level. Work out the annual figure here, then check what actually reaches your account with the <a href="/paycheck-calculator/">paycheck calculator</a>.</p>

<h2>Pay schedules and what they mean</h2>
${table(["Schedule", "Cheques a year", "Notes"], [
  ["Weekly", "52", "Common in trades and hourly work."],
  ["Every two weeks", "26", "The most common US schedule. Two months have three cheques."],
  ["Twice a month", "24", "Fixed dates, usually the 15th and the last day."],
  ["Monthly", "12", "Rare in the US, normal in much of Europe."],
])}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join("\n")}

<h2>Related calculators</h2>
<div class="grid">
  ${cfg.related.map(([href, label]) => `<a class="card" href="${href}"><b>${label}</b></a>`).join("\n  ")}
</div>

<h2>References</h2>
<ul class="refs">
  <li>2,080 hours a year is the standard full-time basis: 40 hours × 52 weeks.</li>
  <li>Overtime at 1.5× over 40 hours a week is the federal FLSA minimum for covered, nonexempt workers: <a href="https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay">U.S. Department of Labor Fact Sheet #23</a>.</li>
  <li>These are gross figures before tax. Withholding is handled on the paycheck pages.</li>
</ul>
</div>
`,
  };
}

module.exports = { wagePage };
