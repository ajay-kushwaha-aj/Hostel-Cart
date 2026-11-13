import { describe, it, expect } from 'vitest';
import {
  validateProductUrl,
  validateQuantity,
  validateUnitPriceRupees,
  validateThresholdRupees,
  validateInviteCode,
} from './validators';

describe('Validation Engine', () => {
  describe('Product URL Validation & Domain Whitelisting', () => {
    it('accepts valid https URLs from Blinkit', () => {
      const res = validateProductUrl('https://blinkit.com/prn/amul-milk/prid/1234', 'blinkit');
      expect(res.isValid).toBe(true);
    });

    it('accepts valid https URLs from Zepto', () => {
      const res = validateProductUrl('https://www.zeptonow.com/pn/banana-robusta/pvid/5678', 'zepto');
      expect(res.isValid).toBe(true);
    });

    it('accepts valid https URLs from Swiggy Instamart', () => {
      const res = validateProductUrl('https://www.swiggy.com/instamart/item/9999', 'instamart');
      expect(res.isValid).toBe(true);
    });

    it('rejects cross-platform URLs (e.g. Zepto URL on Blinkit order)', () => {
      const res = validateProductUrl('https://zeptonow.com/product/123', 'blinkit');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Link must be from Blinkit');
    });

    it('rejects unencrypted http URLs', () => {
      const res = validateProductUrl('http://blinkit.com/prn/milk', 'blinkit');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('HTTPS');
    });

    it('rejects malicious schemes like javascript: or data:', () => {
      const res1 = validateProductUrl('javascript:alert(1)', 'blinkit');
      expect(res1.isValid).toBe(false);

      const res2 = validateProductUrl('data:text/html,<script>alert(1)</script>', 'blinkit');
      expect(res2.isValid).toBe(false);
    });

    it('rejects arbitrary unauthorized domains', () => {
      const res = validateProductUrl('https://malicious-site.com/steal', 'blinkit');
      expect(res.isValid).toBe(false);
    });
  });

  describe('Quantity Validation', () => {
    it('accepts positive whole integers', () => {
      expect(validateQuantity(1).isValid).toBe(true);
      expect(validateQuantity(5).isValid).toBe(true);
      expect(validateQuantity(50).isValid).toBe(true);
    });

    it('rejects zero, negative, or decimals', () => {
      expect(validateQuantity(0).isValid).toBe(false);
      expect(validateQuantity(-2).isValid).toBe(false);
      expect(validateQuantity(1.5).isValid).toBe(false);
    });

    it('rejects excessive quantities', () => {
      expect(validateQuantity(101).isValid).toBe(false);
    });
  });

  describe('Unit Price Validation', () => {
    it('accepts reasonable prices in rupees', () => {
      expect(validateUnitPriceRupees(10).isValid).toBe(true);
      expect(validateUnitPriceRupees(199.50).isValid).toBe(true);
      expect(validateUnitPriceRupees(4500).isValid).toBe(true);
    });

    it('rejects zero or negative prices', () => {
      expect(validateUnitPriceRupees(0).isValid).toBe(false);
      expect(validateUnitPriceRupees(-50).isValid).toBe(false);
    });

    it('rejects unrealistic prices exceeding cap', () => {
      expect(validateUnitPriceRupees(60000).isValid).toBe(false);
    });
  });

  describe('Threshold Validation', () => {
    it('accepts valid minimum thresholds', () => {
      expect(validateThresholdRupees(199).isValid).toBe(true);
      expect(validateThresholdRupees(149).isValid).toBe(true);
    });

    it('rejects threshold less than ₹10', () => {
      expect(validateThresholdRupees(5).isValid).toBe(false);
    });
  });

  describe('Invite Code Validation', () => {
    it('accepts valid alphanumeric invite codes', () => {
      expect(validateInviteCode('CART-SNACK').isValid).toBe(true);
      expect(validateInviteCode('ZEPTO2026').isValid).toBe(true);
    });

    it('rejects too short or special characters', () => {
      expect(validateInviteCode('AB').isValid).toBe(false);
      expect(validateInviteCode('CART@SNACK!').isValid).toBe(false);
    });
  });
});
