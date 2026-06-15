// ─── Medication Types ───────────────────────────────────────────
export type MedicationStatus = 'active' | 'pending-refill' | 'low-supply' | 'discontinued' | 'paused';

export interface Medication {
  id: string;
  brandName: string;
  genericName: string;
  dose: string;
  frequency: string;
  quantity: number;
  refillsLeft: number;
  daysLeft: number;
  totalDays: number;
  nextRefillDate: string;
  pharmacy: string;
  prescriber: string;
  status: MedicationStatus;
  icon: string; // emoji or icon key
  color: string; // tailwind color class
  instructions?: string;
  sideEffects?: string[];
  startDate: string;
}

// ─── Prior Authorization Types ──────────────────────────────────
export type PriorAuthStatus =
  | 'pending-submission'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'denied'
  | 'appealed'
  | 'expired';

export interface PriorAuthStep {
  label: string;
  date: string;
  completed: boolean;
  current?: boolean;
}

export interface PriorAuth {
  id: string;
  medicationId: string;
  medicationName: string;
  insurer: string;
  planName: string;
  status: PriorAuthStatus;
  statusLabel: string;
  submittedDate: string;
  lastUpdated: string;
  expectedResolution?: string;
  steps: PriorAuthStep[];
  notes?: string;
  documents?: string[];
}

// ─── Pharmacy Order Types ───────────────────────────────────────
export type OrderStatus = 'placed' | 'processing' | 'ready' | 'out-for-delivery' | 'delivered' | 'picked-up';

export interface OrderTrackingStep {
  label: string;
  date?: string;
  completed: boolean;
  current?: boolean;
}

export interface PharmacyOrder {
  id: string;
  medications: string[];
  pharmacy: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  status: OrderStatus;
  trackingSteps: OrderTrackingStep[];
  orderDate: string;
  expectedDate: string;
  deliveryType: 'delivery' | 'pickup';
  cost?: number;
  insuranceCovered?: number;
}

// ─── Reminder Types ─────────────────────────────────────────────
export type ReminderStatus = 'upcoming' | 'due' | 'taken' | 'missed' | 'snoozed';

export interface Reminder {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  dose: string;
  pillCount: number;
  status: ReminderStatus;
  icon: string;
}

// ─── Caregiver Types ────────────────────────────────────────────
export type CaregiverPermission = 'view-only' | 'action-enabled' | 'full-access';
export type CaregiverRole = 'family' | 'caregiver' | 'doctor' | 'pharmacist' | 'nurse';

export interface CareCircleMember {
  id: string;
  name: string;
  role: CaregiverRole;
  relationship: string;
  avatar: string;
  permission: CaregiverPermission;
  email: string;
  phone?: string;
  lastActive: string;
}

export interface CaregiverUpdate {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverAvatar: string;
  action: string;
  actionType: 'dose' | 'refill' | 'pickup' | 'payment' | 'note' | 'alert';
  timestamp: string;
  medication?: string;
}

// ─── User Types ─────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  dateOfBirth: string;
  insuranceProvider: string;
  insurancePlan: string;
  memberId: string;
  primaryPharmacy: string;
  primaryDoctor: string;
}

// ─── Report Types ───────────────────────────────────────────────
export interface AdherenceData {
  month: string;
  adherenceRate: number;
  refillsOnTime: number;
  refillsLate: number;
  missedDoses: number;
}

export interface CostData {
  month: string;
  outOfPocket: number;
  insurancePaid: number;
  savings: number;
}

// ─── Pharmacy Types ─────────────────────────────────────────────
export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  deliveryAvailable: boolean;
  hours: string;
  acceptedInsurance: string[];
}

// ─── Notification Types ─────────────────────────────────────────
export type NotificationType = 'refill' | 'prior-auth' | 'delivery' | 'caregiver' | 'reminder' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
