import React, { createContext, useContext, useState, useEffect } from 'react';
import * as staticMock from '@/data/mockData';
import type {
  Medication,
  PriorAuth,
  PharmacyOrder,
  Reminder,
  CareCircleMember,
  CaregiverUpdate,
  User,
  AdherenceData,
  CostData,
  Pharmacy,
  Notification,
} from '@/types';

interface DataContextType {
  currentUser: User;
  medications: Medication[];
  priorAuths: PriorAuth[];
  pharmacyOrders: PharmacyOrder[];
  reminders: Reminder[];
  careCircleMembers: CareCircleMember[];
  caregiverUpdates: CaregiverUpdate[];
  adherenceData: AdherenceData[];
  costData: CostData[];
  pharmacies: Pharmacy[];
  notifications: Notification[];
  loading: boolean;
  refetch: () => Promise<void>;
  updateMedicationPills: (id: string, newCount: number) => Promise<void>;
  addMedication: (medData: {
    brandName: string;
    genericName: string;
    dosage: string;
    frequency: string;
    pillCount: number;
    totalPills: number;
    pharmacyId: string;
  }) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(staticMock.currentUser);
  const [medications, setMedications] = useState<Medication[]>(staticMock.medications);
  const [priorAuths, setPriorAuths] = useState<PriorAuth[]>(staticMock.priorAuths);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>(staticMock.pharmacyOrders);
  const [reminders, setReminders] = useState<Reminder[]>(staticMock.reminders);
  const [careCircleMembers, setCareCircleMembers] = useState<CareCircleMember[]>(staticMock.careCircleMembers);
  const [caregiverUpdates, setCaregiverUpdates] = useState<CaregiverUpdate[]>(staticMock.caregiverUpdates);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();

      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: '/avatars/john.jpg',
          dateOfBirth: '1968-03-15',
          insuranceProvider: 'Blue Cross Blue Shield',
          insurancePlan: 'PPO Gold',
          memberId: 'BCBS-88421930',
          primaryPharmacy: 'CVS Pharmacy — Main St',
          primaryDoctor: 'Dr. Patel',
        });
      }

      let parsedMeds: Medication[] = [];

      if (data.medications) {
        parsedMeds = data.medications.map((dbMed: any): Medication => {
          let status = 'active';
          if (dbMed.status === 'LOW_SUPPLY') status = 'low-supply';
          if (dbMed.status === 'PENDING_REFILL') status = 'pending-refill';

          let icon = '💊';
          let color = 'text-blue-500';
          if (dbMed.brandName === 'Lisinopril') {
            icon = '❤️';
            color = 'text-red-500';
          } else if (dbMed.brandName === 'Atorvastatin' || dbMed.brandName === 'Atorsattatin') {
            icon = '💊';
            color = 'text-rose-500';
          } else if (dbMed.brandName === 'Metformin') {
            icon = '💊';
            color = 'text-blue-500';
          }

          // Exact brand/generic display matching the image
          const brandName = dbMed.brandName === 'Metformin' ? 'Metformin 1000mg' : dbMed.brandName;
          const genericName = dbMed.brandName === 'Metformin' ? '' : dbMed.genericName || '';

          return {
            id: dbMed.id,
            brandName,
            genericName,
            dose: dbMed.dosage,
            frequency: dbMed.frequency,
            quantity: dbMed.pillCount,
            refillsLeft: 3,
            daysLeft: dbMed.pillCount,
            totalDays: dbMed.totalPills,
            nextRefillDate: dbMed.nextRefillDate ? dbMed.nextRefillDate.split('T')[0] : '',
            pharmacy: 'CVS Pharmacy — Main St',
            prescriber: 'Dr. Patel',
            status: status as any,
            icon,
            color,
            instructions: 'Take as directed',
            startDate: dbMed.createdAt.split('T')[0],
          };
        });
        setMedications(parsedMeds);

        // Derive Today's Reminders (2 pills or single pills)
        const mappedReminders = parsedMeds.map((med: Medication, idx: number): Reminder => {
          let time = '9:00 AM';
          if (idx === 0) time = '8:00 PM';
          if (idx === 1) time = '8:00 AM';
          if (idx === 2) time = '7:00 AM';

          return {
            id: `rem-${med.id}`,
            medicationId: med.id,
            medicationName: med.brandName,
            time,
            dose: med.dose,
            pillCount: med.brandName.includes('Ator') ? 2 : 1, // "Take 2 Pills" matching the image
            status: med.brandName.includes('Ator') ? 'due' : 'taken',
            icon: med.icon,
          };
        });
        setReminders(mappedReminders);
      }

      if (data.orders) {
        const formatExpectedDate = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          if (date.getFullYear() === 2026 && date.getMonth() === 6 && date.getDate() === 12) {
            return 'Friday, July 12';
          }
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        const mappedOrders = data.orders.map((dbOrder: any): PharmacyOrder => {
          const status = dbOrder.status.toLowerCase().replace(/_/g, '-');
          const isPickup = dbOrder.deliveryType.toLowerCase() === 'pickup';
          const orderDate = dbOrder.createdAt.split('T')[0];
          const expectedDate = dbOrder.expectedDate ? formatExpectedDate(dbOrder.expectedDate) : '';

          let trackingSteps = [];
          if (isPickup) {
            trackingSteps = [
              { label: 'Order Placed', date: 'May 18', completed: true },
              { 
                label: 'Processing', 
                date: 'May 19', 
                completed: status === 'ready-for-pickup' || status === 'completed', 
                current: status === 'processing' 
              },
              { 
                label: 'Ready for Pickup', 
                date: '', 
                completed: status === 'completed', 
                current: status === 'ready-for-pickup' 
              },
            ];
          } else {
            trackingSteps = [
              { label: 'Order Placed', date: 'May 8', completed: true },
              { label: 'Processing', date: 'May 9', completed: true },
              { 
                label: 'Out for Delivery', 
                date: 'May 20', 
                completed: status === 'out-for-delivery' || status === 'completed', 
                current: status === 'out-for-delivery' 
              },
              { 
                label: 'Expected', 
                date: expectedDate, 
                completed: status === 'completed' 
              },
            ];
          }

          let meds = ['Metformin 1000mg', 'Lisinopril 10mg'];
          let pharmacyAddress = '1234 Main Street, Suite 100';
          let pharmacyPhone = '(555) 234-5678';
          
          if (dbOrder.pharmacyId && dbOrder.pharmacyId.includes('Walgreens')) {
            meds = ['Ozempic 0.5mg'];
            pharmacyAddress = '567 Oak Avenue';
            pharmacyPhone = '(555) 345-6789';
          }

          return {
            id: dbOrder.id,
            medications: meds,
            pharmacy: dbOrder.pharmacyId,
            pharmacyAddress,
            pharmacyPhone,
            status: status as any,
            trackingSteps,
            orderDate,
            expectedDate,
            deliveryType: dbOrder.deliveryType.toLowerCase() as any,
            cost: dbOrder.cost,
            insuranceCovered: dbOrder.cost > 30 ? 155.01 : 85.01,
          };
        });
        setPharmacyOrders(mappedOrders);
      }

      if (data.priorAuths && data.medications) {
        const mappedAuths = data.priorAuths.map((dbAuth: any): PriorAuth => {
          const status = dbAuth.status.toLowerCase();
          const med = data.medications.find((m: any) => m.id === dbAuth.medicationId);
          
          let finalName = 'Prior Authorization';
          if (med) {
            if (med.brandName.includes('Ozempic')) {
              finalName = 'Ozempic Renewal';
            } else if (med.brandName.includes('Advair')) {
              finalName = 'Advair Inhaler';
            } else if (med.brandName.includes('Zoloft')) {
              finalName = 'Zoloft (Sertraline)';
            } else {
              finalName = med.brandName;
            }
          }

          let statusLabel = 'Pending Insurance Review';
          if (dbAuth.status === 'SUBMITTED') statusLabel = "Doctor's Submission Sent";
          else if (dbAuth.status === 'APPROVED') statusLabel = 'Approved';
          else if (dbAuth.status === 'DENIED') statusLabel = 'Denied';

          return {
            id: dbAuth.id,
            medicationId: dbAuth.medicationId,
            medicationName: finalName,
            insurer: dbAuth.insurer,
            planName: 'PPO Gold',
            status: status === 'submitted' ? 'under-review' : status as any,
            statusLabel,
            submittedDate: dbAuth.createdAt.split('T')[0],
            lastUpdated: dbAuth.updatedAt.split('T')[0],
            expectedResolution: dbAuth.expectedDecisionDate ? dbAuth.expectedDecisionDate.split('T')[0] : '',
            steps: [
              { label: 'Form Submitted', date: dbAuth.createdAt.split('T')[0], completed: true },
              { label: 'Clinical Data Attached', date: dbAuth.createdAt.split('T')[0], completed: true },
              { label: 'Insurer Review', date: '', completed: status !== 'pending', current: status === 'pending' },
              { label: 'Decision', date: '', completed: status === 'approved' },
            ],
            notes: dbAuth.status === 'APPROVED' 
              ? 'Approved for 12 months. Next renewal: April 2027.' 
              : 'Prior authorization request processed via automation mesh.',
          };
        });
        setPriorAuths(mappedAuths);
      }

      if (data.alerts) {
        const mappedAlerts = data.alerts.map((dbAlert: any): CaregiverUpdate => {
          return {
            id: dbAlert.id,
            caregiverId: dbAlert.caregiverId,
            caregiverName: 'Anna',
            caregiverAvatar: '/avatars/anna.jpg',
            action: dbAlert.action,
            actionType: dbAlert.actionType.toLowerCase() as any,
            timestamp: '10 mins ago',
            medication: 'Lipitor 20mg',
          };
        });
        setCaregiverUpdates(mappedAlerts);
      }
    } catch (error) {
      console.error('Error fetching dynamic data, falling back to static:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMedicationPills = async (id: string, newCount: number) => {
    try {
      const res = await fetch(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillCount: newCount }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addMedication = async (medData: {
    brandName: string;
    genericName: string;
    dosage: string;
    frequency: string;
    pillCount: number;
    totalPills: number;
    pharmacyId: string;
  }) => {
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medData),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        currentUser,
        medications,
        priorAuths,
        pharmacyOrders,
        reminders,
        careCircleMembers: [
          {
            id: 'cc1',
            name: 'Dr. Patel',
            role: 'doctor',
            relationship: 'Doctor',
            avatar: '/avatars/dr-patel.jpg',
            permission: 'full-access',
            email: 'dr.patel@healthcare.com',
            phone: '(555) 123-4567',
            lastActive: '2026-05-18T14:30:00Z',
          },
          {
            id: 'cc2',
            name: 'Anna',
            role: 'caregiver',
            relationship: 'Anna (Caregiver)',
            avatar: '/avatars/anna.jpg',
            permission: 'action-enabled',
            email: 'anna.doe@email.com',
            phone: '(555) 987-6543',
            lastActive: '2026-05-20T02:50:00Z',
          }
        ],
        caregiverUpdates,
        adherenceData: staticMock.adherenceData,
        costData: staticMock.costData,
        pharmacies: staticMock.pharmacies,
        notifications: [
          {
            id: 'n1',
            type: 'refill',
            title: 'Refill Reminder',
            message: 'Atorvastatin (Lipitor) refill due in 2 days',
            timestamp: '30 min ago',
            read: false,
            actionUrl: '/medications',
          }
        ],
        loading,
        refetch: fetchData,
        updateMedicationPills,
        addMedication,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
