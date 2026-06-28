import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreHorizontal, CheckCircle2, ShoppingCart, ShieldCheck, Download, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { getStatusColor, cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function MedicationsPage() {
  const { medications, addMedication, refetch } = useData();
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [isDiscontinueOpen, setIsDiscontinueOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    dosage: '',
    frequency: 'Once daily',
    pillCount: '30',
    totalPills: '30',
    pharmacyId: 'Apollo Pharmacy — MG Road',
  });
  const [editScheduleTime, setEditScheduleTime] = useState('Daily at 08:00 AM');

  // Two-step modal state
  const [modalStep, setModalStep] = useState('form'); // 'form' | 'choose-path'
  const [savedMedication, setSavedMedication] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [paReferenceId, setPaReferenceId] = useState(null);
  
  // Autocomplete and Onboarding additions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priorAuthRequired, setPriorAuthRequired] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const resetModal = () => {
    setModalStep('form');
    setSavedMedication(null);
    setIsProcessing(false);
    setPdfData(null);
    setPaReferenceId(null);
    setFormData({ brandName: '', genericName: '', dosage: '', frequency: 'Once daily', pillCount: '30', totalPills: '30', pharmacyId: 'Apollo Pharmacy — MG Road' });
    setPriorAuthRequired(false);
    setShowSuggestions(false);
  };

  const handleModalOpenChange = (open) => {
    setIsOpen(open);
    if (!open) resetModal();
  };

  const handleEditSchedule = async () => {
    if (!selectedMed) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/medications/${selectedMed.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ frequency: editScheduleTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update schedule');
      toast.success('Schedule updated successfully!');
      setIsEditScheduleOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscontinue = async () => {
    if (!selectedMed) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/medications/${selectedMed.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete medication');
      toast.success('Medication deleted successfully.');
      setIsDiscontinueOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefillRequest = async () => {
    if (!selectedMed) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/medications/${selectedMed.id}/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request refill');
      toast.success('Refill request submitted successfully!');
      setIsRefillOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const createdMed = await addMedication({
        brandName: formData.brandName,
        genericName: formData.genericName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        pillCount: parseInt(formData.pillCount) || 30,
        totalPills: parseInt(formData.totalPills) || 30,
        pharmacyId: formData.pharmacyId,
      });
      if (createdMed) {
        setSavedMedication(createdMed);
        setModalStep('choose-path');
      }
    } catch (err) {
      toast.error('Failed to add medication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectOrder = async () => {
    if (!savedMedication) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          medicationId: savedMedication.id,
          pharmacyId: savedMedication.pharmacyId || formData.pharmacyId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      toast.success('Order placed successfully! 🎉');
      handleModalOpenChange(false);
      refetch();
      navigate('/pharmacy-orders');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePriorAuth = async () => {
    if (!savedMedication) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/prior-auths`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          medicationId: savedMedication.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create prior authorization');
      setPdfData(data.pdf);
      setPaReferenceId(data.referenceId);
      toast.success('Prior authorization request submitted! 📋');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfData) return;
    const byteCharacters = atob(pdfData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paReferenceId || 'prescription'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePaComplete = () => {
    handleModalOpenChange(false);
    navigate('/prior-authorizations');
  };

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">My Medications</h1>
          <p className="text-slate-500 mt-1">Manage your prescriptions and refills</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search medications..." className="pl-9 bg-white/60 border-blue-100" />
          </div>
          <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
            <DialogTrigger
              render={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-200 shrink-0">
                  <Plus className="h-4 w-4" />
                  Add Medication
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[480px] bg-white p-0 rounded-2xl shadow-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {modalStep === 'form' && (
                  <motion.div
                    key="form-step"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-slate-800">Add New Medication</DialogTitle>
                      <DialogDescription className="text-slate-500">Enter your medication details below to add it to your profile.</DialogDescription>
                    </DialogHeader>

                    {/* Quick-add chips */}
                    <div className="mt-4">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Add</Label>
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
                                pharmacyId: formData.pharmacyId,
                              });
                            }}
                            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1 rounded-full font-semibold transition-all border border-blue-100/50"
                          >
                            + {med.brand}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4 relative">
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
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                        {showSuggestions && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
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
                                    pharmacyId: formData.pharmacyId,
                                  });
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-slate-700 font-medium transition-colors border-b border-slate-100 last:border-0"
                              >
                                <span className="font-bold text-slate-800">{med.brand}</span> <span className="text-xs text-slate-400">({med.generic})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="genericName" className="text-slate-700">Generic Name</Label>
                        <Input id="genericName" placeholder="e.g. Atorvastatin" value={formData.genericName} onChange={(e) => setFormData({ ...formData, genericName: e.target.value })} className="bg-slate-50 border-slate-200 focus:bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="dosage" className="text-slate-700">Dosage</Label>
                          <Input id="dosage" placeholder="e.g. 20mg" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} required className="bg-slate-50 border-slate-200 focus:bg-white" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="frequency" className="text-slate-700">Frequency</Label>
                          <select id="frequency" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} className="w-full h-9 rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 bg-slate-50 border-slate-200 focus:bg-white">
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Three times daily">Three times daily</option>
                            <option value="Four times daily">Four times daily</option>
                            <option value="As needed">As needed</option>
                          </select>
                        </div>
                      </div>

                      {/* Slider and Pill indicator */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="pillCount" className="text-slate-700 font-semibold text-sm">Pill Count (Current: {formData.pillCount})</Label>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full border",
                            parseInt(formData.pillCount) < 18 ? "bg-red-100 text-red-700 border-red-200" :
                            parseInt(formData.pillCount) < 45 ? "bg-amber-100 text-amber-700 border-amber-200" :
                            "bg-green-100 text-green-700 border-green-200"
                          )}>
                            {parseInt(formData.pillCount) < 18 ? 'Low Supply' :
                             parseInt(formData.pillCount) < 45 ? 'Medium' :
                             'Healthy'}
                          </span>
                        </div>
                        <input
                          id="pillCountSlider"
                          type="range"
                          min="1"
                          max="90"
                          value={formData.pillCount}
                          onChange={(e) => setFormData({ ...formData, pillCount: e.target.value, totalPills: Math.max(parseInt(formData.totalPills) || 30, parseInt(e.target.value)).toString() })}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200"
                        />
                      </div>

                      {/* Insurance Toggle */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <Label htmlFor="priorAuthRequired" className="font-semibold text-slate-800 text-sm">Insurance/Prior Auth Required?</Label>
                          <p className="text-[11px] text-slate-500">Enable if insurance pre-approval is required</p>
                        </div>
                        <input
                          id="priorAuthRequired"
                          type="checkbox"
                          checked={priorAuthRequired}
                          onChange={(e) => setPriorAuthRequired(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="pharmacyId" className="text-slate-700">Pharmacy</Label>
                        <select id="pharmacyId" value={formData.pharmacyId} onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })} className="w-full h-9 rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none bg-slate-50 border-slate-200 focus:bg-white">
                          <option value="Apollo Pharmacy — MG Road">Apollo Pharmacy — MG Road</option>
                          <option value="MedPlus — Koramangala">MedPlus — Koramangala</option>
                          <option value="Netmeds Store — Indiranagar">Netmeds Store — Indiranagar</option>
                        </select>
                      </div>
                      <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
                          ) : 'Add Medication'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </motion.div>
                )}

                {modalStep === 'choose-path' && (
                  <motion.div
                    key="choose-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="p-6"
                  >
                    {/* Success Header */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200"
                      >
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-slate-800"
                      >
                        Medication Saved!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 text-sm mt-1"
                      >
                        <span className="font-semibold text-slate-700">{savedMedication?.brandName}</span> has been added. How would you like to proceed?
                      </motion.p>
                    </div>

                    {/* PDF Download Section (shown after Prior Auth is created) */}
                    {pdfData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                      >
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">Prior Authorization Created</p>
                              <p className="text-xs text-slate-500">Reference: <span className="font-mono font-semibold text-indigo-600">{paReferenceId}</span></p>
                            </div>
                          </div>
                          <Button
                            onClick={handleDownloadPdf}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md shadow-indigo-200"
                          >
                            <Download className="w-4 h-4" />
                            Download Prescription PDF
                          </Button>
                          <Button
                            onClick={handlePaComplete}
                            variant="ghost"
                            className="w-full mt-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2"
                          >
                            Go to Prior Authorizations
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Option Cards (hidden once PA is created) */}
                    {!pdfData && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="space-y-3"
                      >
                        {/* Direct Order Card */}
                        <button
                          onClick={handleDirectOrder}
                          disabled={isProcessing}
                          className={cn(
                            "w-full text-left group relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-white",
                            !priorAuthRequired ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-100 hover:border-blue-200"
                          )}
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-start gap-4 relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                              {isProcessing ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              ) : (
                                <ShoppingCart className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                                Direct Order
                                {!priorAuthRequired && (
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] py-0.5">Recommended</Badge>
                                )}
                              </h4>
                              <p className="text-sm text-slate-500 mt-0.5">No insurance approval needed — place a pharmacy order immediately</p>
                              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Place Order</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Prior Authorization Card */}
                        <button
                          onClick={handlePriorAuth}
                          disabled={isProcessing}
                          className={cn(
                            "w-full text-left group relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-white",
                            priorAuthRequired ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-100 hover:border-indigo-200"
                          )}
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-start gap-4 relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                              {isProcessing ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              ) : (
                                <ShieldCheck className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors flex items-center gap-2">
                                Prior Authorization
                                {priorAuthRequired && (
                                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] py-0.5">Required</Badge>
                                )}
                              </h4>
                              <p className="text-sm text-slate-500 mt-0.5">Insurance approval required — generates a prescription PDF for submission</p>
                              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Submit Request</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Direct Confirm Action button for pre-selection */}
                        <Button
                          onClick={priorAuthRequired ? handlePriorAuth : handleDirectOrder}
                          disabled={isProcessing}
                          className={cn(
                            "w-full text-white font-bold h-11 shadow-lg mt-4",
                            priorAuthRequired ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                          )}
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                          ) : (
                            priorAuthRequired ? "Confirm & Generate Prior Auth" : "Confirm & Place Direct Order"
                          )}
                        </Button>

                        <p className="text-xs text-slate-400 text-center pt-2">
                          Not sure? Most medications can be ordered directly. Choose Prior Authorization if your insurance plan requires pre-approval.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((med) => {
          const daysLeftPercent = Math.max(0, Math.min(100, (med.daysLeft / med.totalDays) * 100));
          const isUrgent = med.daysLeft <= 7;
          return (
            <motion.div key={med.id} variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-50 to-cyan-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm border border-slate-100 ${med.color}`}>{med.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight">{med.brandName}</h3>
                    <p className="text-xs text-slate-500 font-medium">({med.genericName})</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedMed(med); setIsDetailsOpen(true); }}>View Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedMed(med); setIsRefillOpen(true); }}>Request Refill</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedMed(med); setEditScheduleTime(med.frequency); setIsEditScheduleOpen(true); }}>Edit Schedule</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedMed(med); setIsDiscontinueOpen(true); }}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-3 mb-6 relative z-10">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Dose</span><span className="font-medium text-slate-700">{med.dose}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Frequency</span><span className="font-medium text-slate-700">{med.frequency}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Pharmacy</span><span className="font-medium text-slate-700 truncate max-w-[140px] text-right" title={med.pharmacy}>{med.pharmacy}</span></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - daysLeftPercent / 100)}
                        className={`transition-all duration-1000 ease-out ${isUrgent ? 'text-red-500' : 'text-blue-500'}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={`text-[10px] font-bold ${isUrgent ? 'text-red-600' : 'text-blue-700'}`}>{med.daysLeft}</span>
                      <span className="text-[8px] text-slate-400 -mt-1 font-medium uppercase">Days</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize font-semibold border ${getStatusColor(med.status)}`}>{med.status?.replace('-', ' ')}</Badge>
                </div>
                <Button size="sm"
                  className={med.status === 'pending-refill' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : isUrgent ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}
                  onClick={() => { if (med.status === 'pending-refill') return; setSelectedMed(med); if (isUrgent) setIsRefillOpen(true); else setIsDetailsOpen(true); }}
                  disabled={med.status === 'pending-refill'}
                >
                  {med.status === 'pending-refill' ? 'Pending' : isUrgent ? 'Refill Now' : 'Details'}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">{selectedMed?.brandName} Details</DialogTitle>
            <DialogDescription className="text-slate-500">Prescription information and history.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-slate-600">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
              <div><p className="text-xs text-slate-400 uppercase font-semibold">Generic Name</p><p className="font-semibold text-slate-800">{selectedMed?.genericName}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-semibold">Dosage</p><p className="font-semibold text-slate-800">{selectedMed?.dose}</p></div>
              <div className="mt-2"><p className="text-xs text-slate-400 uppercase font-semibold">Frequency</p><p className="font-semibold text-slate-800">{selectedMed?.frequency}</p></div>
              <div className="mt-2"><p className="text-xs text-slate-400 uppercase font-semibold">Days Remaining</p><p className="font-semibold text-slate-800">{selectedMed?.daysLeft} Days</p></div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400 uppercase font-semibold">Fulfillment Pharmacy</p>
              <p className="font-medium text-slate-800 mt-0.5">{selectedMed?.pharmacy}</p>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setIsDetailsOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800">Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refill Dialog */}
      <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Confirm Refill Request</DialogTitle>
            <DialogDescription className="text-slate-500">Submit a refill request for {selectedMed?.brandName} to {selectedMed?.pharmacy}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600"><p>Your current refill will be ordered and routed to your pharmacy. Standard co-payments will apply upon pickup or delivery.</p></div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setIsRefillOpen(false)} className="w-full" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleRefillRequest} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Request Refill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Edit Reminder Schedule</DialogTitle>
            <DialogDescription className="text-slate-500">Adjust reminder frequency for {selectedMed?.brandName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-slate-700">Reminder Time</Label>
              <select 
                value={editScheduleTime}
                onChange={(e) => setEditScheduleTime(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:bg-white focus:outline-none"
              >
                <option value="Daily at 08:00 AM">08:00 AM</option>
                <option value="Daily at 12:00 PM">12:00 PM</option>
                <option value="Daily at 08:00 PM">08:00 PM</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setIsEditScheduleOpen(false)} className="w-full" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleEditSchedule} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDiscontinueOpen} onOpenChange={setIsDiscontinueOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Medication?</DialogTitle>
            <DialogDescription className="text-slate-500">Are you sure you want to delete {selectedMed?.brandName}?</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600"><p className="text-red-500 font-medium">Warning: This will stop all automated refill scheduling and caregiver updates for this medication.</p></div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setIsDiscontinueOpen(false)} className="w-full" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleDiscontinue} className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
