import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Loader2, Shield, Heart, User, Check, Phone, ArrowRight, Pill, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEDICINES = [
  { brand: 'Lipitor', generic: 'Atorvastatin', defaultDose: '20mg', frequency: 'Once daily' },
  { brand: 'Metformin', generic: 'Metformin HCl', defaultDose: '500mg', frequency: 'Twice daily' },
  { brand: 'Ozempic', generic: 'Semaglutide', defaultDose: '0.5mg', frequency: 'Once weekly' },
  { brand: 'Advair Inhaler', generic: 'Fluticasone/Salmeterol', defaultDose: '250/50mcg', frequency: 'Twice daily' },
  { brand: 'Zoloft', generic: 'Sertraline', defaultDose: '50mg', frequency: 'Once daily' },
  { brand: 'Lisinopril', generic: 'Lisinopril', defaultDose: '10mg', frequency: 'Once daily' },
  { brand: 'Amlodipine', generic: 'Amlodipine', defaultDose: '5mg', frequency: 'Once daily' },
  { brand: 'Pantoprazole', generic: 'Pantoprazole', defaultDose: '40mg', frequency: 'Once daily' },
  { brand: 'Thyronorm', generic: 'Levothyroxine', defaultDose: '50mcg', frequency: 'Once daily' },
  { brand: 'Crocin', generic: 'Paracetamol', defaultDose: '500mg', frequency: 'As needed' },
];

const PROVIDERS = [
  { name: 'Blue Cross Blue Shield', code: 'BCBS' },
  { name: 'Aetna', code: 'AET' },
  { name: 'Cigna', code: 'CIG' },
  { name: 'UnitedHealthcare', code: 'UHC' },
  { name: 'Star Health', code: 'STAR' },
  { name: 'HDFC ERGO', code: 'HDFC' },
  { name: 'Other', code: 'OTH' }
];

export default function OnboardingPage() {
  const { currentUser, refetch, addMedication } = useData();
  const { authHeaders } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Personal Profile
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');

  // Step 2: Insurance Details
  const [selectedProvider, setSelectedProvider] = useState('');
  const [planName, setPlanName] = useState('');
  const [memberId, setMemberId] = useState('');

  // Step 3: Add First Medication
  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    dosage: '',
    frequency: 'Once daily',
    pillCount: '30',
    totalPills: '30',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Redirect if onboarding complete
  if (currentUser?.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return toast.error('Name is required');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Profile confirmed! 👋');
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider.name);
    // Generate simple ID: CODE-XXXXXX
    const randomId = `${provider.code}-${Math.floor(100000 + Math.random() * 900000)}`;
    setMemberId(randomId);
  };

  const handleInsuranceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return toast.error('Please select an insurance provider or skip.');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/insurance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          insuranceProvider: selectedProvider,
          planName: planName || 'Standard Care',
          memberId: memberId || `MEM-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to save insurance details');
      toast.success('Insurance details saved! 💳');
      setStep(3);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brandName.trim()) return toast.error('Medication name is required');

    setLoading(true);
    try {
      // Add first medication
      await addMedication({
        brandName: formData.brandName,
        genericName: formData.genericName,
        dosage: formData.dosage || '10mg',
        frequency: formData.frequency,
        pillCount: parseInt(formData.pillCount) || 30,
        totalPills: parseInt(formData.totalPills) || 30,
        pharmacyId: 'Apollo Pharmacy — MG Road',
      });

      // Complete onboarding
      const completeRes = await fetch(`${API_URL}/api/user/onboarding-complete`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!completeRes.ok) throw new Error('Failed to complete onboarding');

      toast.success('Welcome to Scriptly! 🎉');
      await refetch();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-tr from-blue-50/50 via-slate-50 to-indigo-50/50">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome to Scriptly</h1>
          <p className="text-slate-500 mt-2">Let's set up your account in 3 simple steps.</p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-white/60 border border-white/40 shadow-sm rounded-full p-1.5 mb-6 flex justify-between items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              onClick={() => { if (s < step) setStep(s); }}
              className={cn(
                "flex-1 py-1.5 rounded-full text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                step === s ? "bg-blue-600 text-white shadow-md shadow-blue-200" :
                step > s ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {step > s ? <Check className="w-3.5 h-3.5" /> : <span>{s}</span>}
              <span className="hidden sm:inline">
                {s === 1 ? 'Profile' : s === 2 ? 'Insurance' : 'Medication'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50 bg-white/70 backdrop-blur-md relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 font-sans">Step 1: Confirm Profile</h2>
                    <p className="text-slate-500 text-sm">Please check your details to get started.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your Name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="bg-white/70 border-slate-200 h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-slate-700">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        placeholder="e.g. +1 (555) 019-2834"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="bg-white/70 border-slate-200 pl-10 h-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-200 mt-6 gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next: Insurance <ArrowRight className="w-4 h-4" /></>}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 font-sans">Step 2: Insurance</h2>
                    <p className="text-slate-500 text-sm">Add details to pre-approve prior authorizations.</p>
                  </div>
                </div>

                {/* Live Card Preview */}
                {selectedProvider && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden font-mono"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                    <div className="flex justify-between items-start mb-6">
                      <span className="font-bold text-xs uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Health Plan Card</span>
                      <Shield className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-white/60 uppercase">Provider</p>
                        <p className="text-sm font-bold tracking-wide">{selectedProvider}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-white/60 uppercase">Member ID</p>
                          <p className="text-sm font-bold tracking-widest">{memberId || 'BCBS-123456'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/60 uppercase">Plan</p>
                          <p className="text-sm font-bold tracking-wide">{planName || 'Standard Care'}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleInsuranceSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-slate-700">Insurance Provider</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-white/50 border rounded-xl">
                      {PROVIDERS.map((prov) => (
                        <button
                          key={prov.name}
                          type="button"
                          onClick={() => handleProviderSelect(prov)}
                          className={cn(
                            "text-xs px-3 py-2 rounded-lg font-medium text-left border transition-all truncate",
                            selectedProvider === prov.name
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {prov.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="planName" className="text-slate-700">Plan Name</Label>
                    <Input
                      id="planName"
                      placeholder="e.g. PPO Gold"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="bg-white/70 border-slate-200 h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="memberId" className="text-slate-700">Member ID</Label>
                    <Input
                      id="memberId"
                      placeholder="e.g. BCBS-88421930"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className="bg-white/70 border-slate-200 h-10 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(3)}
                      className="flex-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-11 rounded-xl"
                    >
                      Skip for Now
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-200 gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next: Medication <ArrowRight className="w-4 h-4" /></>}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 font-sans">Step 3: First Medication</h2>
                    <p className="text-slate-500 text-sm">Add your first medicine to set up your dose tracker.</p>
                  </div>
                </div>

                {/* Quick-add chips */}
                <div className="mb-4">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Add Chips</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {MEDICINES.slice(0, 5).map((med) => (
                      <button
                        key={med.brand}
                        type="button"
                        onClick={() => {
                          setFormData({
                            brandName: med.brand,
                            genericName: med.generic,
                            dosage: med.defaultDose,
                            frequency: med.frequency,
                            pillCount: '30',
                            totalPills: '30',
                          });
                        }}
                        className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 px-3 py-1 rounded-full font-semibold transition-all border border-emerald-100/50"
                      >
                        + {med.brand}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleMedicationSubmit} className="space-y-3 relative">
                  <div className="space-y-1 relative">
                    <Label htmlFor="brandName" className="text-slate-700">Brand Name</Label>
                    <Input
                      id="brandName"
                      placeholder="e.g. Lipitor"
                      value={formData.brandName}
                      onChange={(e) => {
                        setFormData({ ...formData, brandName: e.target.value });
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      required
                      className="bg-white/75 border-slate-200 h-10 rounded-xl"
                    />
                    {showSuggestions && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50">
                        {MEDICINES.filter((m) =>
                          m.brand.toLowerCase().includes(formData.brandName.toLowerCase())
                        ).map((med) => (
                          <button
                            key={med.brand}
                            type="button"
                            onMouseDown={() => {
                              setFormData({
                                brandName: med.brand,
                                genericName: med.generic,
                                dosage: med.defaultDose,
                                frequency: med.frequency,
                                pillCount: formData.pillCount,
                                totalPills: formData.totalPills,
                              });
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-50 text-slate-700 font-semibold border-b last:border-0 border-slate-100"
                          >
                            {med.brand} ({med.generic})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="genericName" className="text-slate-700">Generic Name</Label>
                    <Input
                      id="genericName"
                      placeholder="e.g. Atorvastatin"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      className="bg-white/75 border-slate-200 h-10 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dosage" className="text-slate-700">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g. 20mg"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        required
                        className="bg-white/75 border-slate-200 h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="frequency" className="text-slate-700">Frequency</Label>
                      <select
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white/75"
                      >
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Once weekly">Once weekly</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-700 text-sm font-semibold">Pills Supply: {formData.pillCount}</Label>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        parseInt(formData.pillCount) < 18 ? "bg-red-100 text-red-700 border-red-200" :
                        parseInt(formData.pillCount) < 45 ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-green-100 text-green-700 border-green-200"
                      )}>
                        {parseInt(formData.pillCount) < 18 ? 'Low' : 'Healthy'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="90"
                      value={formData.pillCount}
                      onChange={(e) => setFormData({ ...formData, pillCount: e.target.value, totalPills: e.target.value })}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 bg-slate-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-200 mt-4 gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup & Enter Dashboard'}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
