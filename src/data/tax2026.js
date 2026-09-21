/* US payroll tax data for the 2026 tax year.
 *
 * Federal brackets and the standard deduction come from IRS Revenue Procedure
 * 2025-32, released 9 October 2025. FICA figures are the SSA 2026 announcement.
 * Every number here is checked against a published source before it ships —
 * a wrong figure on a paycheck page is worse than no page at all.
 */

// Taxable income thresholds. Each entry is [upper bound, rate]; Infinity closes it.
const FEDERAL_BRACKETS = {
  single: [
    [12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24],
    [256225, 0.32], [640600, 0.35], [Infinity, 0.37],
  ],
  married: [
    [24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24],
    [512450, 0.32], [768700, 0.35], [Infinity, 0.37],
  ],
  head: [
    [17700, 0.10], [67450, 0.12], [105700, 0.22], [201775, 0.24],
    [256200, 0.32], [640600, 0.35], [Infinity, 0.37],
  ],
};

const STANDARD_DEDUCTION = { single: 16100, married: 32200, head: 24150 };

const FICA = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  // Employers must begin withholding the extra 0.9% above $200,000 from an
  // employee, regardless of filing status. The final joint-return liability
  // can differ and is settled on Form 8959.
  additionalMedicareWithholdingThreshold: 200000,
};

const RETIREMENT = {
  // Base elective-deferral limit. Age-based catch-up contributions are not
  // modeled because the calculator deliberately does not ask for age.
  employee401kLimit: 24500,
};

const PAY_PERIODS = [
  ["weekly", "Weekly", 52],
  ["biweekly", "Every two weeks", 26],
  ["semimonthly", "Twice a month", 24],
  ["monthly", "Monthly", 12],
  ["annual", "Annually", 1],
];

/* States that levy no income tax on wages in 2026. New Hampshire finished
 * repealing its interest-and-dividends tax on 1 January 2025; Washington taxes
 * capital gains but not wages. */
const NO_TAX_STATES = [
  ["alaska", "Alaska"], ["florida", "Florida"], ["nevada", "Nevada"],
  ["new-hampshire", "New Hampshire"], ["south-dakota", "South Dakota"],
  ["tennessee", "Tennessee"], ["texas", "Texas"], ["washington", "Washington"],
  ["wyoming", "Wyoming"],
];

module.exports = { FEDERAL_BRACKETS, STANDARD_DEDUCTION, FICA, RETIREMENT, PAY_PERIODS, NO_TAX_STATES };
