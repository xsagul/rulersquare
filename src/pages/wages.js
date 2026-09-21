const { wagePage } = require("./wage-calculator");

/* Three views of the same arithmetic, because people search for it from three
 * different directions. Omni's equivalents are among the most valuable pages
 * on their site by traffic value per visit. */

const LINKS = {
  hourly: ["/salary-to-hourly-calculator/", "Salary to Hourly Calculator"],
  annual: ["/annual-income-calculator/", "Annual Income Calculator"],
  rate: ["/pay-rate-calculator/", "Pay Rate Calculator"],
  paycheck: ["/paycheck-calculator/", "Paycheck Calculator"],
  texas: ["/texas-paycheck-calculator/", "Texas Paycheck Calculator"],
};
const rel = (...keys) => keys.map(k => LINKS[k]);

const salaryToHourly = wagePage({
  path: "/salary-to-hourly-calculator/",
  h1: "Salary to Hourly Calculator",
  title: "Salary to Hourly Calculator – Convert Any Salary | Ruler Square",
  description: "Free salary to hourly calculator. Convert an annual salary to an hourly rate, with unpaid leave and part-time hours handled properly.",
  lede: "Convert an annual salary into an hourly rate — and the other way round — with your real hours and unpaid leave taken into account.",
  amountLabel: "Salary",
  defaultPer: "year",
  headline: "Hourly rate",
  headlineId: "r-hourly",
  h2Intro: "How to convert a salary to an hourly rate",
  intro: "Divide the annual salary by the hours you actually work in a year. For a standard full-time job that is 2,080 hours — 40 a week across all 52 weeks — but the moment you work part-time or take unpaid leave, that divisor changes and so does the answer.",
  formula: "Hourly rate = annual salary ÷ (hours per week × paid weeks)<br>Standard full time: salary ÷ 2,080",
  example: {
    label: "$65,000 a year, 40 hours a week",
    text: "Sixty-five thousand divided by 2,080 hours is $31.25 an hour. Weekly that is $1,250, monthly $5,417, and every two weeks $2,500. If two of your weeks off are unpaid, the paid year drops to 2,000 hours and the real rate rises to $32.50 — four percent higher than the simple division suggests.",
  },
  faq: [
    ["What is $60,000 a year per hour?",
     "$28.85 an hour at 40 hours a week and 2,080 hours a year. Weekly that is $1,153.85, and $2,307.69 every two weeks. Those are gross figures — what reaches your account after federal tax and FICA is roughly $48,000 to $50,000 depending on your state and filing status."],
    ["How do I convert an hourly rate to a salary?",
     "Multiply the hourly rate by the hours you work in a week, then by the number of paid weeks. At 40 hours across 52 weeks the shortcut is to multiply by 2,080: $30 an hour is $62,400 a year. Switch the dropdown above to \"per hour\" and the calculator runs it in that direction."],
    ["Is 2,080 the right number for part-time work?",
     "No, and using it is the most common mistake in part-time conversions. At 25 hours a week over 52 weeks the divisor is 1,300. A $32,500 part-time salary on 25 hours is $25 an hour, not the $15.63 you would get by dividing by 2,080."],
  ],
  related: rel("annual", "rate", "paycheck", "texas"),
});

const annualIncome = wagePage({
  path: "/annual-income-calculator/",
  h1: "Annual Income Calculator",
  title: "Annual Income Calculator – Yearly Pay from Any Rate | Ruler Square",
  description: "Free annual income calculator. Turn an hourly, daily, weekly or monthly rate into a yearly figure, including overtime and unpaid leave.",
  lede: "Turn any pay rate into an annual figure — hourly, daily, weekly, biweekly or monthly, with overtime included.",
  amountLabel: "Pay rate",
  defaultPer: "hour",
  headline: "Annual income",
  headlineId: "r-annual",
  h2Intro: "How to work out your annual income",
  intro: "Annual income is your rate multiplied by how often you are paid. The arithmetic is easy; what trips people up is which multiplier to use, because a biweekly schedule is not the same as twice a month and an hourly rate has to account for the weeks you are actually paid.",
  formula: "From hourly: rate × hours per week × paid weeks<br>From weekly: × 52 &nbsp;•&nbsp; biweekly: × 26 &nbsp;•&nbsp; twice monthly: × 24 &nbsp;•&nbsp; monthly: × 12",
  example: {
    label: "$22 an hour, 40 hours a week, plus 5 hours of overtime",
    text: "The base is $22 × 40 = $880 a week. Five hours at time and a half adds $22 × 1.5 × 5 = $165, so the real week is $1,045. Across 52 paid weeks that is $54,340 a year — against $45,760 for the base hours alone. The overtime is worth $8,580, nearly a fifth of the total.",
  },
  faq: [
    ["What is the difference between gross and net annual income?",
     "Gross is what you earn before anything is taken out. Net is what reaches your account after federal income tax, Social Security, Medicare, state tax and any pre-tax deductions. The gap is usually twenty to thirty percent. This page calculates gross; the paycheck calculator handles the rest."],
    ["How do I calculate annual income with variable hours?",
     "Average your hours across a representative stretch — three months is usually enough to smooth out quiet and busy weeks. Use that average here. If your work is strongly seasonal, run the busy and quiet periods separately and add them, because a single average will overstate a lean year."],
    ["Should I include bonuses in my annual income?",
     "For a loan application or a budget, include them only if they are reliable and you can document a history. Lenders typically want two years of consistent bonus income before they will count it. For a like-for-like comparison of two job offers, compare base salaries first and treat bonuses separately — they are not guaranteed."],
  ],
  related: rel("hourly", "rate", "paycheck", "texas"),
});

const payRate = wagePage({
  path: "/pay-rate-calculator/",
  h1: "Pay Rate Calculator",
  title: "Pay Rate Calculator – Hourly, Weekly, Monthly & Yearly | Ruler Square",
  description: "Free pay rate calculator. Convert between hourly, daily, weekly, biweekly, semi-monthly, monthly and annual pay in one step.",
  lede: "Enter any pay rate and see every other one — hourly, daily, weekly, every two weeks, twice a month, monthly and yearly.",
  amountLabel: "Pay rate",
  defaultPer: "week",
  headline: "Weekly pay",
  headlineId: "r-weekly",
  h2Intro: "Converting between pay periods",
  intro: "Job adverts quote pay in whatever unit suits them: an hourly rate for shift work, a weekly figure in the trades, a monthly one from European employers, an annual salary for office roles. Comparing two offers means getting them into the same unit first, which is all this page does.",
  formula: "Everything routes through the annual figure:<br>annual ÷ 52 = weekly &nbsp;•&nbsp; ÷ 26 = biweekly &nbsp;•&nbsp; ÷ 24 = semi-monthly &nbsp;•&nbsp; ÷ 12 = monthly",
  example: {
    label: "$1,400 a week",
    text: "Fourteen hundred a week across 52 weeks is $72,800 a year. That is $6,067 a month, $2,800 every two weeks, and $3,033 twice a month. At 40 hours a week it works out to $35 an hour. Note how the biweekly and semi-monthly figures differ by more than two hundred dollars despite describing the same salary — 26 cheques against 24.",
  },
  faq: [
    ["Is biweekly better than twice a month?",
     "You receive the same amount either way. Biweekly gives 26 smaller cheques with two three-cheque months a year; semi-monthly gives 24 larger ones on fixed dates. Biweekly suits weekly budgeting and delivers two pleasant surprises a year; semi-monthly lines up better with rent and bills that fall on the same date each month."],
    ["How many weeks are in a month for pay purposes?",
     "Not four. A month averages 4.33 weeks, which is why multiplying a weekly wage by four understates your monthly income by about eight percent. Always route through the annual figure and divide by 12 rather than multiplying weekly by four."],
    ["What is a day rate and how does it convert?",
     "A day rate is common for contractors and covers a working day regardless of exact hours. Multiply by the days you work in a week, then by paid weeks, for the annual figure. A $400 day rate over five days and 48 paid weeks is $96,000 — but check whether the rate assumes eight hours or ten before you compare it to anything."],
  ],
  related: rel("hourly", "annual", "paycheck", "texas"),
});

module.exports = [salaryToHourly, annualIncome, payRate];
