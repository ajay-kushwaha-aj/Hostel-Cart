/**
 * Money utilities for HostelCart
 * All internal calculations use integer paise to avoid IEEE-754 floating point issues.
 */

/**
 * Converts Indian Rupees (e.g. 199.50) to integer Paise (e.g. 19950).
 */
export function rupeesToPaise(rupees: number): number {
  if (isNaN(rupees) || !isFinite(rupees)) {
    return 0;
  }
  return Math.round(rupees * 100);
}

/**
 * Converts integer Paise (e.g. 19950) to Rupees (e.g. 199.5).
 */
export function paiseToRupees(paise: number): number {
  if (isNaN(paise) || !isFinite(paise)) {
    return 0;
  }
  return paise / 100;
}

/**
 * Formats integer Paise as standard INR currency string.
 * Example: 19900 -> "₹199" or "₹199.00" depending on auto-decimal rule.
 */
export function formatINR(paise: number, forceDecimals: boolean = false): string {
  if (isNaN(paise) || !isFinite(paise)) {
    return '₹0';
  }

  const rupees = paise / 100;
  const hasFraction = paise % 100 !== 0;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: forceDecimals || hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(rupees);
}

/**
 * Safely parses a user-entered rupees string into integer paise.
 * Returns 0 if invalid or negative.
 */
export function parseRupeesToPaise(input: string): number {
  if (!input || typeof input !== 'string') {
    return 0;
  }
  // Remove whitespace and currency symbols
  const clean = input.replace(/[₹,\s]/g, '');
  const val = parseFloat(clean);
  if (isNaN(val) || val < 0) {
    return 0;
  }
  return rupeesToPaise(val);
}
