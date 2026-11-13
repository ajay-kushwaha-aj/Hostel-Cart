import { PlatformId } from '../types/order';
import { PLATFORMS } from './constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a product URL against the selected platform's allowed domains.
 * Ensures HTTPS scheme, valid URL parsing, and domain whitelist.
 */
export function validateProductUrl(url: string, platformId: PlatformId): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    // Only HTTPS is permitted
    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Only secure HTTPS links are allowed (https://...)',
      };
    }

    const hostname = parsed.hostname.toLowerCase();
    const platform = PLATFORMS[platformId];

    if (!platform) {
      return { isValid: false, error: 'Unknown platform' };
    }

    // Check hostname against allowlist
    const isAllowed = platform.allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      return {
        isValid: false,
        error: `Link must be from ${platform.name} (${platform.allowedDomains.slice(0, 2).join(', ')})`,
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g. https://blinkit.com/prn/...)',
    };
  }
}

/**
 * Validates item quantity: positive integer between 1 and 100.
 */
export function validateQuantity(quantity: number): ValidationResult {
  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    return { isValid: false, error: 'Quantity must be a whole positive number (e.g. 1, 2, 3)' };
  }
  if (quantity > 100) {
    return { isValid: false, error: 'Maximum quantity per item is 100' };
  }
  return { isValid: true };
}

/**
 * Validates item unit price in Rupees: positive, min ₹1, max ₹50,000.
 */
export function validateUnitPriceRupees(price: number): ValidationResult {
  if (isNaN(price) || price <= 0) {
    return { isValid: false, error: 'Price must be greater than ₹0' };
  }
  if (price > 50000) {
    return { isValid: false, error: 'Price exceeds maximum allowed ₹50,000' };
  }
  return { isValid: true };
}

/**
 * Validates minimum threshold in Rupees for an order.
 */
export function validateThresholdRupees(threshold: number): ValidationResult {
  if (isNaN(threshold) || threshold < 10) {
    return { isValid: false, error: 'Minimum threshold must be at least ₹10' };
  }
  if (threshold > 100000) {
    return { isValid: false, error: 'Threshold cannot exceed ₹1,00,000' };
  }
  return { isValid: true };
}

/**
 * Validates an invite code format.
 */
export function validateInviteCode(code: string): ValidationResult {
  if (!code || typeof code !== 'string') {
    return { isValid: false, error: 'Invite code is required' };
  }
  const clean = code.trim();
  if (clean.length < 4 || clean.length > 24) {
    return { isValid: false, error: 'Invite code must be between 4 and 24 characters' };
  }
  // Alphanumeric + hyphens/underscores
  if (!/^[A-Za-z0-9\-_]+$/.test(clean)) {
    return { isValid: false, error: 'Invite code may only contain letters, numbers, and dashes' };
  }
  return { isValid: true };
}

