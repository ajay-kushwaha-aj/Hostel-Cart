import { OrderItem } from '../types/order';

/**
 * Calculates the subtotal in paise for an individual item.
 */
export function calculateItemSubtotalPaise(quantity: number, unitPricePaise: number): number {
  if (quantity <= 0 || unitPricePaise <= 0) {
    return 0;
  }
  return Math.round(quantity * unitPricePaise);
}

/**
 * Calculates the group item subtotal from a list of active items.
 */
export function calculateGroupSubtotalPaise(items: OrderItem[]): number {
  return items
    .filter((item) => item.isActive && !item.isUnavailable)
    .reduce((sum, item) => sum + item.subtotalPaise, 0);
}

/**
 * Calculates the subtotal for a specific participant from active items.
 */
export function calculateParticipantSubtotalPaise(items: OrderItem[], userId: string): number {
  return items
    .filter((item) => item.userId === userId && item.isActive && !item.isUnavailable)
    .reduce((sum, item) => sum + item.subtotalPaise, 0);
}

/**
 * Calculates remaining paise needed to reach the threshold target.
 */
export function calculateRemainingPaise(groupSubtotalPaise: number, minimumAmountPaise: number): number {
  if (minimumAmountPaise <= 0) {
    return 0;
  }
  return Math.max(0, minimumAmountPaise - groupSubtotalPaise);
}

/**
 * Calculates progress percentage toward reaching the threshold.
 * Returns an integer or float between 0 and 100.
 */
export function calculateProgressPercentage(groupSubtotalPaise: number, minimumAmountPaise: number): number {
  if (minimumAmountPaise <= 0) {
    return 100;
  }
  const percentage = (groupSubtotalPaise / minimumAmountPaise) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));
}

/**
 * Determines whether the group subtotal meets or exceeds the minimum threshold.
 */
export function isThresholdReached(groupSubtotalPaise: number, minimumAmountPaise: number): boolean {
  if (minimumAmountPaise <= 0) {
    return true;
  }
  return groupSubtotalPaise >= minimumAmountPaise;
}

export interface ParticipantShareInput {
  userId: string;
  itemSubtotalPaise: number;
}

export interface ParticipantShareResult {
  userId: string;
  itemSubtotalPaise: number;
  allocatedFeePaise: number;
  totalPayablePaise: number;
  roundingAdjustmentPaise: number;
}

/**
 * Allocates shared charges (delivery, taxes, platform fees minus discounts)
 * proportionally across participants based on their item subtotals.
 * Uses a deterministic integer paise algorithm to guarantee the sum of
 * totalPayablePaise equals finalTotalPayablePaise.
 */
export function allocateCheckoutShares(
  participants: ParticipantShareInput[],
  sharedChargesPaise: number, // Can be positive (fees) or negative (discounts)
  finalTotalPayablePaise: number
): ParticipantShareResult[] {
  if (participants.length === 0) {
    return [];
  }

  const totalItemSubtotal = participants.reduce((sum, p) => sum + p.itemSubtotalPaise, 0);

  // If total item subtotal is zero, divide shared fees equally among active participants
  if (totalItemSubtotal === 0) {
    const baseShare = Math.floor(finalTotalPayablePaise / participants.length);
    let remainder = finalTotalPayablePaise - baseShare * participants.length;

    return participants.map((p, idx) => {
      const extra = idx === 0 ? remainder : 0;
      const total = baseShare + extra;
      return {
        userId: p.userId,
        itemSubtotalPaise: 0,
        allocatedFeePaise: total,
        totalPayablePaise: total,
        roundingAdjustmentPaise: extra,
      };
    });
  }

  // Calculate proportional fee for each participant
  let allocatedFeeSum = 0;
  const initialResults = participants.map((p) => {
    const rawRatio = p.itemSubtotalPaise / totalItemSubtotal;
    const allocatedFee = Math.round(rawRatio * sharedChargesPaise);
    allocatedFeeSum += allocatedFee;
    return {
      userId: p.userId,
      itemSubtotalPaise: p.itemSubtotalPaise,
      allocatedFeePaise: allocatedFee,
      totalPayablePaise: p.itemSubtotalPaise + allocatedFee,
      roundingAdjustmentPaise: 0,
    };
  });

  // Calculate discrepancy from the final payable total
  const totalCalculated = initialResults.reduce((sum, r) => sum + r.totalPayablePaise, 0);
  const discrepancy = finalTotalPayablePaise - totalCalculated;

  // Apply deterministic rounding remainder to the first participant (or participant with largest subtotal)
  if (discrepancy !== 0 && initialResults.length > 0) {
    // Sort or choose largest subtotal participant deterministically
    let maxIdx = 0;
    for (let i = 1; i < initialResults.length; i++) {
      if (initialResults[i].itemSubtotalPaise > initialResults[maxIdx].itemSubtotalPaise) {
        maxIdx = i;
      }
    }
    initialResults[maxIdx].totalPayablePaise += discrepancy;
    initialResults[maxIdx].allocatedFeePaise += discrepancy;
    initialResults[maxIdx].roundingAdjustmentPaise = discrepancy;
  }

  return initialResults;
}

