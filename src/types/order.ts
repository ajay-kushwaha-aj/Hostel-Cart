export type PlatformId = 'blinkit' | 'zepto' | 'instamart';

export type OrderStatus =
  | 'OPEN'
  | 'THRESHOLD_REACHED'
  | 'LOCKED'
  | 'PAYMENT_PENDING'
  | 'READY_FOR_CHECKOUT'
  | 'PLACED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID_REPORTED'
  | 'WAIVED'
  | 'REFUNDED'
  | 'DISPUTED';

export type AdjustmentType =
  | 'DELIVERY_CHARGE'
  | 'HANDLING_CHARGE'
  | 'PLATFORM_FEE'
  | 'TAX'
  | 'DISCOUNT'
  | 'REFUND'
  | 'SUBSTITUTION'
  | 'OTHER';

export interface GroupOrder {
  id: string;
  title: string;
  platform: PlatformId;
  organizerId: string;
  organizerName: string;
  hostelId: string;
  minimumAmountPaise: number;
  groupItemSubtotalPaise: number;
  participantCount: number;
  status: OrderStatus;
  inviteCode: string;
  expiresAt: number; // ms timestamp
  createdAt: number;
  updatedAt: number;
  lockedAt?: number | null;
  placedAt?: number | null;
  completedAt?: number | null;
  description?: string;
  pickupNote?: string;
  participantLimit?: number | null;
  actualCheckoutTotalPaise?: number | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  productName: string;
  productURL?: string | null;
  entryType: 'manual' | 'url';
  quantity: number;
  unitPricePaise: number;
  subtotalPaise: number;
  note?: string | null;
  isActive: boolean;
  isUnavailable?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Participant {
  userId: string;
  displayName: string;
  subtotalPaise: number;
  allocatedTotalPaise?: number;
  paymentStatus: PaymentStatus;
  joinedAt: number;
  leftAt?: number | null;
  isActive: boolean;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  amountPaise: number;
  status: PaymentStatus;
  paymentMethod: 'UPI_EXTERNAL' | 'CASH';
  reference?: string | null;
  reportedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface AdjustmentRecord {
  id: string;
  orderId: string;
  type: AdjustmentType;
  description: string;
  amountPaise: number; // Positive for additional fee, negative for discount
  allocationMethod: 'PROPORTIONAL' | 'EQUAL' | 'CUSTOM';
  createdBy: string;
  createdAt: number;
}
