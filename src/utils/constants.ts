import { PlatformId, OrderStatus, PaymentStatus } from '../types/order';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  badgeColor: string;
  themeColor: string;
  bgLight: string;
  defaultThresholdRupees: number;
  allowedDomains: string[];
}

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  blinkit: {
    id: 'blinkit',
    name: 'Blinkit',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    themeColor: '#f59e0b',
    bgLight: 'bg-amber-50',
    defaultThresholdRupees: 199,
    allowedDomains: [
      'blinkit.com',
      'www.blinkit.com',
      'blinkitapp.page.link',
      'grofers.com',
      'www.grofers.com',
    ],
  },
  zepto: {
    id: 'zepto',
    name: 'Zepto',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    themeColor: '#9333ea',
    bgLight: 'bg-purple-50',
    defaultThresholdRupees: 149,
    allowedDomains: [
      'zeptonow.com',
      'www.zeptonow.com',
      'zepto.page.link',
    ],
  },
  instamart: {
    id: 'instamart',
    name: 'Swiggy Instamart',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    themeColor: '#ea580c',
    bgLight: 'bg-orange-50',
    defaultThresholdRupees: 199,
    allowedDomains: [
      'swiggy.com',
      'www.swiggy.com',
      'instamart.swiggy.com',
    ],
  },
};

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; description: string }
> = {
  OPEN: {
    label: 'Open',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Accepting items from participants',
  },
  THRESHOLD_REACHED: {
    label: 'Target Reached',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
    description: 'Minimum subtotal reached! Ready to coordinate',
  },
  LOCKED: {
    label: 'Cart Locked',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Cart frozen for checkout coordination',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Organizer collecting external payments',
  },
  READY_FOR_CHECKOUT: {
    label: 'Ready for Checkout',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Payments settled, organizer placing order',
  },
  PLACED: {
    label: 'Order Placed',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Placed on platform, awaiting delivery',
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Items distributed, session closed',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    description: 'Order cancelled by organizer',
  },
  EXPIRED: {
    label: 'Expired',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-300',
    description: 'Order deadline passed',
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: 'Pending',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  PAID_REPORTED: {
    label: 'Paid (Reported)',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  WAIVED: {
    label: 'Waived',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  REFUNDED: {
    label: 'Refunded',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  DISPUTED: {
    label: 'Disputed',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
};

export const EXPIRY_PRESETS = [
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '45 minutes', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
];

export const PILOT_HOSTEL = {
  id: 'HOSTEL_PILOT_01',
  name: 'Pilot Boys Hostel (Hostel 1)',
  university: 'Campus University',
  defaultInviteCode: 'HOSTEL2026',
};
