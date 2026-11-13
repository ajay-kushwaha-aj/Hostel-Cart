import { describe, it, expect } from 'vitest';
import { rupeesToPaise, paiseToRupees, formatINR, parseRupeesToPaise } from './money';

describe('Money Utilities (Integer Paise Representation)', () => {
  it('converts rupees to paise correctly avoiding float issues', () => {
    expect(rupeesToPaise(199)).toBe(19900);
    expect(rupeesToPaise(85)).toBe(8500);
    expect(rupeesToPaise(49.50)).toBe(4950);
    expect(rupeesToPaise(0)).toBe(0);
    expect(rupeesToPaise(-10)).toBe(-1000);
  });

  it('converts paise to rupees correctly', () => {
    expect(paiseToRupees(19900)).toBe(199);
    expect(paiseToRupees(8500)).toBe(85);
    expect(paiseToRupees(4950)).toBe(49.5);
    expect(paiseToRupees(0)).toBe(0);
  });

  it('formats paise as INR currency', () => {
    expect(formatINR(19900)).toContain('199');
    expect(formatINR(8500)).toContain('85');
    // Non-zero fraction should show decimals
    expect(formatINR(4950)).toContain('49.50');
  });

  it('parses user rupees input string safely', () => {
    expect(parseRupeesToPaise('199')).toBe(19900);
    expect(parseRupeesToPaise('₹ 199.50')).toBe(19950);
    expect(parseRupeesToPaise('invalid')).toBe(0);
    expect(parseRupeesToPaise('')).toBe(0);
    expect(parseRupeesToPaise('-50')).toBe(0);
  });
});

