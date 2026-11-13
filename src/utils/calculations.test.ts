import { describe, it, expect } from 'vitest';
import {
  calculateItemSubtotalPaise,
  calculateGroupSubtotalPaise,
  calculateParticipantSubtotalPaise,
  calculateRemainingPaise,
  calculateProgressPercentage,
  isThresholdReached,
  allocateCheckoutShares,
} from './calculations';
import { OrderItem } from '../types/order';

describe('Calculation Engine', () => {
  const sampleItems: OrderItem[] = [
    {
      id: 'item-1',
      orderId: 'o1',
      userId: 'u1',
      userName: 'Ajay',
      productName: 'Milk',
      entryType: 'manual',
      quantity: 2,
      unitPricePaise: 3000, // ₹30 each -> ₹60 (6000 paise)
      subtotalPaise: 6000,
      isActive: true,
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'item-2',
      orderId: 'o1',
      userId: 'u2',
      userName: 'Rohan',
      productName: 'Bread',
      entryType: 'manual',
      quantity: 1,
      unitPricePaise: 4500, // ₹45 (4500 paise)
      subtotalPaise: 4500,
      isActive: true,
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'item-3',
      orderId: 'o1',
      userId: 'u1',
      userName: 'Ajay',
      productName: 'Butter',
      entryType: 'manual',
      quantity: 1,
      unitPricePaise: 5500, // ₹55 (5500 paise)
      subtotalPaise: 5500,
      isActive: true,
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'item-4',
      orderId: 'o1',
      userId: 'u3',
      userName: 'Inactive User Item',
      productName: 'Soda',
      entryType: 'manual',
      quantity: 1,
      unitPricePaise: 4000,
      subtotalPaise: 4000,
      isActive: false, // inactive
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'item-5',
      orderId: 'o1',
      userId: 'u2',
      userName: 'Rohan',
      productName: 'Unavailable Item',
      entryType: 'manual',
      quantity: 1,
      unitPricePaise: 2000,
      subtotalPaise: 2000,
      isActive: true,
      isUnavailable: true, // unavailable
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  it('calculates individual item subtotal correctly', () => {
    expect(calculateItemSubtotalPaise(2, 3000)).toBe(6000);
    expect(calculateItemSubtotalPaise(1, 4500)).toBe(4500);
    expect(calculateItemSubtotalPaise(0, 4500)).toBe(0);
    expect(calculateItemSubtotalPaise(2, 0)).toBe(0);
  });

  it('calculates group subtotal only including active and available items', () => {
    // 6000 (u1) + 4500 (u2) + 5500 (u1) = 16000 paise (₹160)
    // ignores inactive item-4 (4000) and unavailable item-5 (2000)
    expect(calculateGroupSubtotalPaise(sampleItems)).toBe(16000);
  });

  it('calculates participant subtotal for specific user', () => {
    // u1: 6000 + 5500 = 11500
    expect(calculateParticipantSubtotalPaise(sampleItems, 'u1')).toBe(11500);
    // u2: 4500
    expect(calculateParticipantSubtotalPaise(sampleItems, 'u2')).toBe(4500);
    // u3: 0 (item is inactive)
    expect(calculateParticipantSubtotalPaise(sampleItems, 'u3')).toBe(0);
  });

  it('calculates remaining amount to threshold correctly', () => {
    const minimumPaise = 19900; // ₹199
    const currentSubtotal = 16000; // ₹160
    expect(calculateRemainingPaise(currentSubtotal, minimumPaise)).toBe(3900); // ₹39 needed

    // If subtotal exceeds threshold, remaining should be 0
    expect(calculateRemainingPaise(21000, minimumPaise)).toBe(0);
  });

  it('calculates progress percentage towards threshold correctly', () => {
    const minimumPaise = 20000; // ₹200
    expect(calculateProgressPercentage(10000, minimumPaise)).toBe(50);
    expect(calculateProgressPercentage(20000, minimumPaise)).toBe(100);
    expect(calculateProgressPercentage(25000, minimumPaise)).toBe(100); // capped at 100
    expect(calculateProgressPercentage(0, minimumPaise)).toBe(0);
  });

  it('determines threshold reached state', () => {
    expect(isThresholdReached(19900, 19900)).toBe(true);
    expect(isThresholdReached(20000, 19900)).toBe(true);
    expect(isThresholdReached(19899, 19900)).toBe(false);
  });

  describe('Proportional Checkout Allocation & Deterministic Rounding', () => {
    it('allocates shared delivery fee proportionally and sums exactly to final total', () => {
      // 3 students:
      // A: ₹85 (8500), B: ₹65 (6500), C: ₹75 (7500) -> total items ₹225 (22500 paise)
      // Shared charges: ₹30 delivery fee (3000 paise)
      // Final total payable = 22500 + 3000 = 25500 paise
      const participants = [
        { userId: 'studentA', itemSubtotalPaise: 8500 },
        { userId: 'studentB', itemSubtotalPaise: 6500 },
        { userId: 'studentC', itemSubtotalPaise: 7500 },
      ];

      const sharedCharges = 3000;
      const finalPayable = 25500;

      const results = allocateCheckoutShares(participants, sharedCharges, finalPayable);

      // Verify each participant got their allocation
      expect(results).toHaveLength(3);

      // Verify the sum of totalPayablePaise sums EXACTLY to finalPayable
      const totalAllocated = results.reduce((sum, r) => sum + r.totalPayablePaise, 0);
      expect(totalAllocated).toBe(finalPayable);

      // Verify each share includes original items + allocated fee
      results.forEach((r) => {
        expect(r.totalPayablePaise).toBe(r.itemSubtotalPaise + r.allocatedFeePaise);
      });
    });

    it('handles discounts (negative shared charges) cleanly', () => {
      const participants = [
        { userId: 'p1', itemSubtotalPaise: 10000 }, // ₹100
        { userId: 'p2', itemSubtotalPaise: 10000 }, // ₹100
      ];
      const discountCharges = -2000; // -₹20 discount
      const finalPayable = 18000; // ₹180

      const results = allocateCheckoutShares(participants, discountCharges, finalPayable);
      expect(results[0].totalPayablePaise).toBe(9000);
      expect(results[1].totalPayablePaise).toBe(9000);
      const total = results.reduce((sum, r) => sum + r.totalPayablePaise, 0);
      expect(total).toBe(finalPayable);
    });
  });
});
