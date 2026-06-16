import React, { useState } from 'react';
import { User as UserIcon, Shield, Bell, Settings as GearIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/context/DataContext';

export default function SettingsPage() {
  const { currentUser } = useData();

  // Profile State
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'John Doe',
    email: currentUser?.email || 'john@example.com',
    primaryDoctor: currentUser?.primaryDoctor || 'Dr. Patel',
    primaryPharmacy: currentUser?.primaryPharmacy || 'CVS Pharmacy — Main St',
  });

  // Insurance State
  const [insurance, setInsurance] = useState({
    provider: currentUser?.insuranceProvider || 'Blue Cross Blue Shield',
    plan: currentUser?.insurancePlan || 'PPO Gold',
    memberId: currentUser?.memberId || 'BCBS-88421930',
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    refillClearance: true,
    doseReminder: true,
    caregiverActions: false,
    deliveryShipments: true,
  });

  // App Settings State
  const [appSettings, setAppSettings] = useState({
    autoRefill: true,
    shareRefillStatus: true,
    highContrast: false,
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleInsuranceChange = (e) => {
    const { name, value } = e.target;
    setInsurance(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (section) => {
    alert(`${section} settings saved successfully! (Mock)`);
  };

  return (
    <div className="p-8 pb-16 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account profile, insurance, and notification preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full flex flex-col md:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <TabsList className="flex flex-row md:flex-col bg-white/50 border border-slate-200 p-1 rounded-xl w-full md:w-64 shrink-0 overflow-x-auto md:overflow-x-visible">
          <TabsTrigger value="profile" className="w-full justify-start gap-3 py-3 px-4 text-left font-semibold">
            <UserIcon className="w-4 h-4" />
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="insurance" className="w-full justify-start gap-3 py-3 px-4 text-left font-semibold">
            <Shield className="w-4 h-4" />
            Insurance Plan
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-3 py-3 px-4 text-left font-semibold">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="w-full justify-start gap-3 py-3 px-4 text-left font-semibold">
            <GearIcon className="w-4 h-4" />
            App Preferences
          </TabsTrigger>
        </TabsList>

        {/* Content Panel */}
        <div className="flex-1 w-full">
          {/* Profile Content */}
          <TabsContent value="profile" className="mt-0 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name</Label>
                  <Input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleProfileChange}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={profile.email} 
                    onChange={handleProfileChange}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="primaryDoctor" className="text-slate-700 font-semibold">Primary Care Doctor</Label>
                  <Input 
                    type="text" 
                    id="primaryDoctor" 
                    name="primaryDoctor" 
                    value={profile.primaryDoctor} 
                    onChange={handleProfileChange}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="primaryPharmacy" className="text-slate-700 font-semibold">Preferred Pharmacy</Label>
                  <Input 
                    type="text" 
                    id="primaryPharmacy" 
                    name="primaryPharmacy" 
                    value={profile.primaryPharmacy} 
                    onChange={handleProfileChange}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <Button onClick={() => handleSave('Profile')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-6 shadow-md shadow-blue-200">
                  <Save className="w-4 h-4" />
                  Save Profile
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Insurance Content */}
          <TabsContent value="insurance" className="mt-0 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Insurance details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Inputs */}
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="provider" className="text-slate-700 font-semibold">Insurance Provider</Label>
                    <Input 
                      type="text" 
                      id="provider" 
                      name="provider" 
                      value={insurance.provider} 
                      onChange={handleInsuranceChange}
                      className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="plan" className="text-slate-700 font-semibold">Plan Name</Label>
                    <Input 
                      type="text" 
                      id="plan" 
                      name="plan" 
                      value={insurance.plan} 
                      onChange={handleInsuranceChange}
                      className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="memberId" className="text-slate-700 font-semibold">Member ID</Label>
                    <Input 
                      type="text" 
                      id="memberId" 
                      name="memberId" 
                      value={insurance.memberId} 
                      onChange={handleInsuranceChange}
                      className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                </div>

                {/* Insurance Card Graphic */}
                <div className="bg-linear-to-tr from-blue-600 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between h-56 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-blue-100 font-bold">Health Insurance Card</p>
                      <h4 className="font-extrabold text-lg mt-1 tracking-tight">{insurance.provider}</h4>
                    </div>
                    <Shield className="w-8 h-8 text-blue-200/50" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-blue-200 tracking-wider font-semibold">Plan Type / Name</p>
                    <p className="font-semibold text-sm">{insurance.plan}</p>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] uppercase text-blue-200 tracking-wider font-semibold">Member ID</p>
                      <p className="font-mono text-base font-bold tracking-wider">{insurance.memberId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase text-blue-200 tracking-wider font-semibold">Scriptly ePA Token</p>
                      <p className="font-mono text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">#EPA-ACTIVE</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button onClick={() => handleSave('Insurance')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-6 shadow-md shadow-blue-200">
                  <Save className="w-4 h-4" />
                  Save Insurance Info
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Content */}
          <TabsContent value="notifications" className="mt-0 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Notification Preferences</h2>
              <p className="text-sm text-slate-500 mb-6">Choose how and when you want to receive alerts from Scriptly.</p>
              
              <div className="space-y-4">
                {[
                  {
                    key: 'refillClearance',
                    title: 'Refill Clearance Alerts',
                    description: 'Get notified as soon as automated prior auth clearances are issued.',
                  },
                  {
                    key: 'doseReminder',
                    title: 'Dose Intake Reminders',
                    description: 'Receive push notifications and SMS alerts when it is time to take your pills.',
                  },
                  {
                    key: 'caregiverActions',
                    title: 'Caregiver Activity Alerts',
                    description: 'Get updates when members of your Care Circle log notes or check your schedule.',
                  },
                  {
                    key: 'deliveryShipments',
                    title: 'Pharmacy Shipping & Pickups',
                    description: 'Get real-time tracking updates when orders ship or are ready for pickup.',
                  },
                ].map(item => (
                  <div key={item.key} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={notifications[item.key]}
                      onChange={() => setNotifications(prev => {
                        const k = item.key;
                        return { ...prev, [k]: !prev[k] };
                      })}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Label htmlFor={item.key} className="text-slate-800 font-bold block cursor-pointer">{item.title}</Label>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <Button onClick={() => handleSave('Notification')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-6 shadow-md shadow-blue-200">
                  <Save className="w-4 h-4" />
                  Save Notifications
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Preferences Content */}
          <TabsContent value="preferences" className="mt-0 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Application Preferences</h2>
              <p className="text-sm text-slate-500 mb-6">Customize automation and helper features.</p>
              
              <div className="space-y-4">
                {[
                  {
                    key: 'autoRefill',
                    title: 'Automated Refill Requests',
                    description: 'Scriptly will automatically trigger refill requests 7 days before supply runs low.',
                  },
                  {
                    key: 'shareRefillStatus',
                    title: 'Auto-Share Prior Auth Statuses',
                    description: 'Share approved, pending, and denied clearance status updates with your Care Circle members.',
                  },
                  {
                    key: 'highContrast',
                    title: 'High Contrast Mode',
                    description: 'Increase color contrast for labels and tracking bars to aid readability.',
                  },
                ].map(item => (
                  <div key={item.key} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={appSettings[item.key]}
                      onChange={() => setAppSettings(prev => {
                        const k = item.key;
                        return { ...prev, [k]: !prev[k] };
                      })}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Label htmlFor={item.key} className="text-slate-800 font-bold block cursor-pointer">{item.title}</Label>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <Button onClick={() => handleSave('App Preferences')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-6 shadow-md shadow-blue-200">
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
