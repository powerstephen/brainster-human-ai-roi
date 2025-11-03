// lib/model.ts
// Minimal shim so any older pages that import these don't break the build.

export function decodeInputs(_q?: string) {
  // Safe defaults for report pages that expect decoded inputs
  return {
    currency: 'EUR',
    employees: 100,
    hoursSavedPerWeek: 3,
    avgSalary: 52000,
  };
}

export function calc(inputs: any = {}) {
  const {
    avgSalary = 52000,
    hoursSavedPerWeek = 3,
    employees = 100,
  } = inputs;

  const hourly = avgSalary / (52 * 40);
  const util = 0.7;
  const annual = hourly * util * hoursSavedPerWeek * 52 * employees;
  const monthly = annual / 12;

  return { annual, monthly };
}

export function symbol(c: string) {
  return c === 'USD' ? '$' : c === 'GBP' ? '£' : '€';
}
