const { paycheckPage } = require("./paycheck-calculator");

/* The national page plus the two highest-volume no-income-tax states. Those
 * two need no state rate table, so they are accurate on day one; states with
 * brackets wait until their rates are verified rather than guessed. */

const LINKS = {
  paycheck: ["/paycheck-calculator/", "Paycheck Calculator"],
  texas: ["/texas-paycheck-calculator/", "Texas Paycheck Calculator"],
  florida: ["/florida-paycheck-calculator/", "Florida Paycheck Calculator"],
  concrete: ["/concrete-calculator/", "Concrete Calculator"],
  gravel: ["/gravel-calculator/", "Gravel Calculator"],
};
const rel = (...keys) => keys.map(k => LINKS[k]);

const national = paycheckPage({
  path: "/paycheck-calculator/",
  h1: "Paycheck Calculator",
  title: "Paycheck Calculator – 2026 Take-Home Pay After Taxes | Ruler Square",
  description: "Free 2026 paycheck calculator. Work out take-home pay after federal tax, Social Security, Medicare, state tax and 401(k), with the brackets shown.",
  lede: "Enter your gross pay to see what actually lands in your account after federal tax, FICA, state tax and pre-tax deductions.",
  stateRatePct: 0,
  stateLabel: "State income tax",
  inputNote: "Enter a rough effective state rate, not your highest bracket. Nine states do not tax wages — Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington and Wyoming — so leave it at 0 there.",
  intro: "Gross pay is what you negotiated. Take-home pay is what survives federal income tax, Social Security, Medicare, state tax and whatever comes out for retirement and health cover. The gap is usually 20–30% and it surprises people every January.",
  example: {
    label: "$52,000 a year, single, paid every two weeks, no state tax",
    text: "Annual gross is $52,000. The 2026 standard deduction of $16,100 leaves $35,900 taxable. The first $12,400 is taxed at 10% ($1,240) and the remaining $23,500 at 12% ($2,820), so federal income tax is $4,060. Social Security takes 6.2% of the full $52,000 ($3,224) and Medicare 1.45% ($754). Total tax is $8,038, leaving $43,962 a year — $1,690.85 every two weeks, and an effective rate of 15.5%.",
  },
  stateSection: `<h2>Which states take no income tax</h2>
<p>Nine states levy no income tax on wages in 2026: <strong>Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington and Wyoming</strong>. New Hampshire finished repealing its tax on interest and dividends on 1 January 2025, and Washington taxes capital gains but not wages.</p>
<p>No income tax does not mean no tax. Those states raise revenue somewhere else — Texas and New Hampshire lean hard on property tax, Washington and Nevada on sales tax, Tennessee on both. Comparing two job offers on income tax alone will mislead you if the property tax bill doubles.</p>`,
  faq: [
    ["How do I calculate my take-home pay from my salary?",
     "Divide your annual salary by the number of pay periods to get gross per cheque, then subtract pre-tax deductions, federal income tax on what remains after the standard deduction, 6.2% Social Security, 1.45% Medicare and any state tax. The calculator above does all of it, but the order matters: pre-tax deductions come out before income tax, not after."],
    ["What is the difference between effective and marginal tax rate?",
     "Your marginal rate is the rate on your next dollar earned — the bracket you are sitting in. Your effective rate is total tax divided by total income, and it is always lower, because the earlier brackets tax your first dollars at lower rates. Someone in the 22% bracket typically has an effective federal rate nearer 12%."],
    ["Why do 26 and 24 pay periods give different cheques?",
     "Paid every two weeks you get 26 cheques a year; paid twice a month you get 24. The annual total is identical, so the twice-a-month cheque is larger. Two months a year have three biweekly cheques, which is where the feeling of a bonus month comes from."],
  ],
  related: rel("texas", "florida", "concrete", "gravel"),
});

const texas = paycheckPage({
  path: "/texas-paycheck-calculator/",
  h1: "Texas Paycheck Calculator",
  title: "Texas Paycheck Calculator – 2026 Take-Home Pay | Ruler Square",
  description: "Free Texas paycheck calculator for 2026. Texas has no state income tax — see your take-home after federal tax, Social Security, Medicare and 401(k).",
  lede: "Texas takes no state income tax, so your deductions are federal only. Enter your gross pay to see what lands in your account.",
  stateRatePct: 0,
  lockState: true,
  stateLabel: "Texas state income tax",
  inputNote: "Texas levies no state income tax on wages, so this stays at 0.",
  intro: "Texas is one of nine states with no income tax on wages, which makes a Texas paycheck simpler than most: federal income tax, Social Security and Medicare, and nothing else at state level. That is worth several thousand dollars a year against a state like California.",
  example: {
    label: "$70,000 a year in Texas, single, paid twice a month",
    text: "Annual gross is $70,000. After the $16,100 standard deduction, $53,900 is taxable: 10% on the first $12,400 ($1,240), 12% on the next $38,000 ($4,560), and 22% on the remaining $3,500 ($770) — $6,570 federal. Social Security takes $4,340 and Medicare $1,015. With no state tax, total deductions are $11,925, leaving $58,075 a year, or about $2,419.79 on each of 24 cheques.",
  },
  stateSection: `<h2>What Texas charges instead</h2>
<p>No income tax does not make Texas a low-tax state across the board. The money comes from elsewhere, and for most households the bill arrives as property tax.</p>
<p>Texas property tax rates are among the highest in the country, typically 1.6–2.2% of assessed value depending on the county and school district. On a $350,000 home that is $5,600–$7,700 a year. Sales tax is 6.25% at state level and up to 8.25% once local rates are added.</p>
<p>If you are comparing a Texas offer against one in a state with income tax, run both numbers: the income tax you save can be swallowed whole by the property tax you pick up, especially if you are buying rather than renting.</p>
<h2>What still comes out of a Texas paycheck</h2>
<ul>
  <li><strong>Federal income tax</strong>, on the same brackets as every other state.</li>
  <li><strong>Social Security</strong>, 6.2% up to the wage base.</li>
  <li><strong>Medicare</strong>, 1.45% with no ceiling, plus 0.9% above $200,000.</li>
  <li><strong>Anything you elected</strong> — 401(k), health premiums, HSA, union dues.</li>
</ul>
<p>There is no state disability or paid family leave deduction in Texas either, which some states add on top.</p>`,
  faq: [
    ["Does Texas have a state income tax?",
     "No. Texas levies no income tax on wages, and the Texas constitution requires a statewide referendum to introduce one, so it is unlikely to change quickly. Your only payroll deductions are federal income tax, Social Security, Medicare and whatever you elected yourself."],
    ["How much is $70,000 a year after taxes in Texas?",
     "About $58,075 a year for a single filer with no pre-tax deductions — roughly $4,840 a month. Federal income tax takes $6,570, Social Security $4,340 and Medicare $1,015. The effective tax rate is about 17%."],
    ["Is take-home pay higher in Texas than in California?",
     "On the same gross salary, yes, usually by several thousand dollars, because California income tax runs from 1% to 13.3% while Texas charges nothing. Whether you are better off overall depends on housing: Texas property tax rates are far higher, so the comparison flips for some buyers."],
  ],
  related: rel("paycheck", "florida", "concrete", "gravel"),
});

const florida = paycheckPage({
  path: "/florida-paycheck-calculator/",
  h1: "Florida Paycheck Calculator",
  title: "Florida Paycheck Calculator – 2026 Take-Home Pay | Ruler Square",
  description: "Free Florida paycheck calculator for 2026. Florida has no state income tax — see take-home pay after federal tax, Social Security, Medicare and 401(k).",
  lede: "Florida takes no state income tax. Enter your gross pay to see your take-home after federal tax and FICA.",
  stateRatePct: 0,
  lockState: true,
  stateLabel: "Florida state income tax",
  inputNote: "Florida levies no state income tax on wages, so this stays at 0.",
  intro: "Florida charges no income tax on wages, so a Florida payslip shows federal income tax, Social Security and Medicare and little else. The state constitution bans a personal income tax outright, which makes this one of the more durable no-tax states.",
  example: {
    label: "$60,000 a year in Florida, married filing jointly, paid every two weeks",
    text: "Annual gross is $60,000. The married standard deduction of $32,200 leaves $27,800 taxable, all inside the 10% and 12% bands: $2,480 at 10% on the first $24,800, then 12% on $3,000 ($360), so $2,840 federal. Social Security takes $3,720 and Medicare $870. With no state tax, take-home is $52,570 a year — about $2,021.92 every two weeks, an effective rate of just 12.4%.",
  },
  stateSection: `<h2>What Florida charges instead</h2>
<p>Florida funds itself through sales tax and tourism rather than income tax. State sales tax is 6%, with county surtaxes taking it to 7–8% in most places, and the visitor economy carries a large share of the load that residents would otherwise pay.</p>
<p>Property tax is nearer the national average than in Texas, typically 0.7–1.1% of assessed value, and the homestead exemption removes up to $50,000 of value for permanent residents. Florida's Save Our Homes cap also limits how fast the assessed value of a homesteaded property can rise, which matters a lot if you stay put for years.</p>
<p>The trade-off Floridians actually feel is insurance, not tax: home insurance premiums in coastal counties can exceed what an income tax would have cost.</p>
<h2>What still comes out of a Florida paycheck</h2>
<ul>
  <li><strong>Federal income tax</strong>, on the national brackets.</li>
  <li><strong>Social Security</strong>, 6.2% up to the wage base.</li>
  <li><strong>Medicare</strong>, 1.45%, plus the 0.9% surtax on high earners.</li>
  <li><strong>Your own elections</strong> — retirement, health, HSA.</li>
</ul>
<p>Florida has no state disability insurance deduction and no local income taxes, so there is nothing between the federal line and your net pay.</p>`,
  faq: [
    ["Does Florida have a state income tax?",
     "No. Florida has never taxed personal income and its constitution prohibits one, so the only deductions on a Florida payslip are federal income tax, Social Security, Medicare and anything you elected yourself."],
    ["How much is $60,000 after taxes in Florida?",
     "About $52,570 a year for a married couple filing jointly with no pre-tax deductions, or roughly $4,381 a month. A single filer on the same salary keeps less — closer to $50,390 — because the standard deduction is half the size."],
    ["Do I pay Florida tax if I work remotely for an out-of-state company?",
     "If you live and work in Florida, you generally owe no state income tax regardless of where your employer is based, because states tax where the work is performed. A handful of states apply a convenience-of-the-employer rule that can pull you back into their system, so check with a tax professional if your employer is in New York, New Jersey, Pennsylvania, Delaware or Nebraska."],
  ],
  related: rel("paycheck", "texas", "concrete", "gravel"),
});

module.exports = [national, texas, florida];
