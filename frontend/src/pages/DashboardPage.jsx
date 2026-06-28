import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Package, Clock, Sunrise, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { getStatusColor, getInitials } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AutoRefillsIcon, NextDeliveryCalendarIcon, PriorAuthShieldIcon, CaregiverAlertsBellIcon } from '@/components/icons/CustomIcons';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const { medications, reminders, priorAuths, pharmacyOrders, caregiverUpdates, currentUser, refetch, updateMedicationPills, logDose } = useData();
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [isTakeDoseOpen, setIsTakeDoseOpen] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const upcomingRefills = medications.filter(m => m.daysLeft <= 14).sort((a, b) => a.daysLeft - b.daysLeft);
  const activeOrder = pharmacyOrders.find(o => o.status !== 'delivered' && o.status !== 'picked-up');
  
  // Dose Tracker State
  const [takenDoses, setTakenDoses] = useState({});
  const [snoozed, setSnoozed] = useState(() => JSON.parse(localStorage.getItem('snoozedDoses') || '{}'));

  const getDosesForMed = (med) => {
    const f = med.frequency.toLowerCase();
    if (f.includes('twice') || f.includes('2')) return ['morning', 'evening'];
    if (f.includes('three') || f.includes('3')) return ['morning', 'afternoon', 'evening'];
    if (f.includes('evening') || f.includes('night') || f.includes('bed')) return ['evening'];
    return ['morning'];
  };

  const allExpectedDoses = medications.flatMap(m => getDosesForMed(m).map(time => ({ ...m, time })));
  const totalDosesCount = allExpectedDoses.length;
  const takenCount = Object.keys(takenDoses).length;

  const handleTakeNewDose = async (med, time) => {
    try {
      await logDose(med.id, 1);
      setTakenDoses(prev => ({ ...prev, [`${med.id}_${time}`]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
      toast.success(`Logged ${med.brandName}`);
    } catch (err) {
      toast.error('Failed to log dose');
    }
  };

  const handleSnooze = (med, time) => {
    const newSnoozed = { ...snoozed, [`${med.id}_${time}`]: Date.now() + 30 * 60000 };
    setSnoozed(newSnoozed);
    localStorage.setItem('snoozedDoses', JSON.stringify(newSnoozed));
    toast.success('Snoozed for 30 minutes');
  };

  const handleMarkAllTaken = async () => {
    for (const dose of allExpectedDoses) {
      const key = `${dose.id}_${dose.time}`;
      if (!takenDoses[key] && (!snoozed[key] || snoozed[key] < Date.now())) {
        await handleTakeNewDose(dose, dose.time);
      }
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;

  const handleTakeDose = async () => {
    if (!selectedMed) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/medications/${selectedMed.id || selectedMed.medicationId}/dose-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log dose');
      toast.success('Dose logged successfully! Caregivers have been notified.');
      // Mark the reminder as taken locally so button updates immediately
      setTakenReminderIds(prev => [...prev, selectedMed.id || selectedMed.medicationId]);
      // Decrement the pill count locally via updateMedicationPills
      const medId = selectedMed.id || selectedMed.medicationId;
      const med = medications.find(m => m.id === medId);
      if (med && med.quantity > 0) {
        await updateMedicationPills(medId, med.quantity - 1);
      }
      setIsTakeDoseOpen(false);
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
  
  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Good Morning, {currentUser?.name || 'User'}</h1>
        <p className="text-slate-500 mt-1">Here is your medication overview for today.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} onClick={() => navigate('/medications')} className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer">
            <AutoRefillsIcon className="w-12 h-12 group-hover:scale-110 transition-transform shrink-0" />
            <div><h3 className="font-bold text-slate-800">Auto Refills</h3><p className="text-sm font-semibold text-emerald-600">{medications.length > 0 ? `${medications.length} Scheduled` : 'None Active'}</p></div>
          </motion.div>
          <motion.div variants={itemVariants} onClick={() => navigate('/pharmacy-orders')} className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer">
            <NextDeliveryCalendarIcon className="w-12 h-12 group-hover:scale-110 transition-transform shrink-0" />
            <div><h3 className="font-bold text-slate-800">Next Delivery</h3><p className="text-sm font-semibold text-blue-600">{activeOrder ? (activeOrder.expectedDate || 'In Progress') : 'No Active Order'}</p></div>
          </motion.div>
          <motion.div variants={itemVariants} onClick={() => navigate('/prior-authorizations')} className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer">
            <PriorAuthShieldIcon className="w-12 h-12 group-hover:scale-110 transition-transform shrink-0" />
            <div><h3 className="font-bold text-slate-800">Prior Authorizations</h3><p className="text-sm font-semibold text-indigo-600">{priorAuths.length > 0 ? `${priorAuths.length} In Progress` : 'None Pending'}</p></div>
          </motion.div>
          <motion.div variants={itemVariants} onClick={() => navigate('/caregiver-alerts')} className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer">
            <CaregiverAlertsBellIcon className="w-12 h-12 group-hover:scale-110 transition-transform shrink-0" />
            <div><h3 className="font-bold text-slate-800">Caregiver Alerts</h3><p className="text-sm font-semibold text-amber-600">{caregiverUpdates.length > 0 ? `${caregiverUpdates.length} New Alert${caregiverUpdates.length > 1 ? 's' : ''}` : 'No New Alerts'}</p></div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Dose Tracker */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Today's Dose Tracker
                </h2>
                {totalDosesCount > 0 && takenCount < totalDosesCount && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllTaken} className="text-blue-600 hover:text-blue-700 bg-white">
                    Mark All as Taken
                  </Button>
                )}
              </div>

              {totalDosesCount > 0 ? (
                <div className="space-y-6 relative z-10">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-600">Daily Progress</span>
                      <span className="text-blue-600">{takenCount} / {totalDosesCount} Doses Taken</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(takenCount / totalDosesCount) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {takenCount === totalDosesCount ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-50 rounded-xl p-6 text-center border border-emerald-100"
                    >
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-emerald-700">All doses taken today 🎉</h3>
                      <p className="text-emerald-600 text-sm mt-1">Great job staying on track!</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {['morning', 'afternoon', 'evening'].map(time => {
                        const timeDoses = allExpectedDoses.filter(d => d.time === time);
                        if (timeDoses.length === 0) return null;

                        const Icon = time === 'morning' ? Sunrise : time === 'afternoon' ? Sun : Moon;
                        const colors = time === 'morning' ? 'text-amber-500 bg-amber-50 border-amber-100' : 
                                      time === 'afternoon' ? 'text-orange-500 bg-orange-50 border-orange-100' : 
                                      'text-indigo-500 bg-indigo-50 border-indigo-100';

                        return (
                          <div key={time} className="space-y-3">
                            <h3 className={`flex items-center gap-2 font-semibold text-sm uppercase tracking-wider ${colors.split(' ')[0]}`}>
                              <Icon className="w-4 h-4" /> {time}
                            </h3>
                            {timeDoses.map(dose => {
                              const key = `${dose.id}_${time}`;
                              const isTaken = takenDoses[key];
                              const isSnoozed = snoozed[key] && snoozed[key] > Date.now();

                              return (
                                <div key={key} className={`flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border transition-all ${isTaken ? 'bg-slate-50 border-slate-100 opacity-75' : `bg-white ${colors.split(' ')[2]}`}`}>
                                  <div>
                                    <h4 className="font-bold text-slate-800">{dose.brandName}</h4>
                                    <p className="text-sm text-slate-500">Take 1 Pill • {dose.dosage}</p>
                                  </div>
                                  <div className="shrink-0 w-full md:w-auto flex gap-2">
                                    {isTaken ? (
                                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium text-sm w-full md:w-auto justify-center">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Taken at {takenDoses[key]}
                                      </div>
                                    ) : isSnoozed ? (
                                      <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-4 py-2 rounded-lg font-medium text-sm w-full md:w-auto justify-center">
                                        <Clock className="w-4 h-4" />
                                        Snoozed
                                      </div>
                                    ) : (
                                      <>
                                        <Button 
                                          className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                                          onClick={() => handleTakeNewDose(dose, time)}
                                        >
                                          TAKE DOSE
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          className="flex-none px-3"
                                          onClick={() => handleSnooze(dose, time)}
                                          title="Snooze for 30m"
                                        >
                                          <Clock className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No medications scheduled for today.</p>
              )}
            </motion.div>

            {/* Upcoming Refills */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Upcoming Refills</h2>
              <div className="space-y-4">
                {upcomingRefills.length === 0 ? (
                  <div className="text-center py-8 bg-white/50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 font-medium">No upcoming refills</p>
                    <p className="text-slate-400 text-sm mt-1">Add medications to see your refill schedule here.</p>
                  </div>
                ) : (
                  upcomingRefills.slice(0, 3).map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm ${med.color}`}>
                          {med.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{med.brandName} <span className="text-sm font-normal text-slate-500">({med.genericName})</span></h4>
                          <p className="text-sm text-slate-500">
                            {med.daysLeft <= 7 ? (
                              <span className="text-red-500 font-medium">Refill in {med.daysLeft} Days</span>
                            ) : (
                              <span>Refill Scheduled for {med.nextRefillDate?.split('-').slice(1).join('/')}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={med.status === 'pending-refill' ? "outline" : med.daysLeft <= 7 ? "default" : "outline"}
                        className={med.status === 'pending-refill' ? "bg-slate-100 text-slate-500 cursor-not-allowed uppercase text-xs font-bold" : med.daysLeft <= 7 ? "bg-green-500 hover:bg-green-600 text-white font-bold tracking-wide shadow-md shadow-green-100" : "bg-white text-slate-600 border-slate-200 uppercase text-xs font-bold"}
                        size="sm"
                        onClick={() => {
                          if (med.status === 'pending-refill') return;
                          setSelectedMed(med);
                          if (med.daysLeft <= 7) setIsRefillOpen(true);
                          else navigate('/medications');
                        }}
                        disabled={med.status === 'pending-refill'}
                      >
                        {med.status === 'pending-refill' ? 'PENDING' : med.daysLeft <= 7 ? 'REFILL EARLY' : 'EDIT'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Caregiver Updates */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Caregiver Updates</h2>
                <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50" onClick={() => navigate('/caregiver-alerts')}>View All</Button>
              </div>
              <div className="space-y-4">
                {caregiverUpdates.slice(0, 2).map((update) => (
                  <div key={update.id} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden border border-blue-200 shrink-0">
                      {update.caregiverAvatar?.startsWith('/') ? getInitials(update.caregiverName) : (
                        <img src={update.caregiverAvatar} alt={update.caregiverName} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate"><span className="font-bold">{update.caregiverName}</span> {update.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{update.timestamp}</p>
                    </div>
                    <Button variant="secondary" size="sm" className="bg-white hover:bg-slate-100 text-blue-700 text-xs font-bold shrink-0 shadow-sm border border-slate-200" onClick={() => navigate('/caregiver-alerts')}>
                      VIEW LOG
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Prior Authorizations */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 bg-linear-to-br from-white to-blue-50/30">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PriorAuthShieldIcon className="w-6 h-6 shrink-0" />
                Prior Authorizations
              </h2>
              <div className="space-y-3">
                {priorAuths.length === 0 ? (
                  <div className="text-center py-8 bg-white/50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 font-medium">No prior authorizations</p>
                    <p className="text-slate-400 text-sm mt-1">Your insurance pre-approvals will appear here once medications are added.</p>
                  </div>
                ) : (
                  priorAuths.slice(0, 2).map((pa) => (
                    <div key={pa.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-slate-800 truncate pr-2 max-w-[180px]">{pa.medicationName?.split(' ')[0]} Renewal</h4>
                          <p className="text-xs text-slate-500 mt-1">{pa.statusLabel}</p>
                        </div>
                        <Badge className={getStatusColor(pa.status)}>{pa.status?.replace('-', ' ')}</Badge>
                      </div>
                      <Button variant="outline" className="w-full mt-2 text-blue-600 border-blue-100 hover:bg-blue-50 font-semibold" size="sm" onClick={() => navigate('/prior-authorizations')}>
                        VIEW STATUS
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Pharmacy Order Tracking */}
            {activeOrder && (
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-500" />
                  Pharmacy Order Tracking
                </h2>
                <div className="bg-white rounded-xl p-5 border border-slate-100 mb-4 shadow-sm">
                  <p className="font-bold text-slate-700 mb-5">{activeOrder.pharmacy}</p>
                  <div className="relative flex justify-between items-center px-2 mb-6 mt-2">
                    <div className="absolute left-0 right-0 top-1.5 h-1 bg-slate-100 z-0" />
                    <div 
                      className="absolute left-0 top-1.5 h-1 bg-emerald-500 z-0 transition-all" 
                      style={{ width: `${(activeOrder.trackingSteps.filter(s => s.completed).length - 1) / (activeOrder.trackingSteps.length - 1) * 100}%` }}
                    />
                    {activeOrder.trackingSteps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 bg-white ${step.completed ? 'border-emerald-500' : step.current ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]' : 'border-slate-200'}`}>
                          {step.current && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                        </div>
                        <p className={`absolute top-6 w-20 text-center -ml-8 text-[10px] font-bold leading-tight ${step.current ? 'text-blue-700' : 'text-slate-500'}`}>{step.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Expected:</span>
                    <span className="font-bold text-slate-800">{activeOrder.expectedDate}</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 group" onClick={() => navigate('/pharmacy-orders')}>
                  TRACK PACKAGE <ChevronDown className="w-4 h-4 ml-2 group-hover:-rotate-90 transition-transform" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Take Dose Dialog */}
      <Dialog open={isTakeDoseOpen} onOpenChange={setIsTakeDoseOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Confirm Dose Intake</DialogTitle>
            <DialogDescription className="text-slate-500">Confirm that you have taken your dose of {selectedMed?.brandName || 'your medication'}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600"><p>This will log the intake and notify your caregiver circle that you are on track with your schedule today.</p></div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setIsTakeDoseOpen(false)} className="w-full" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleTakeDose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Confirming...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refill Dialog */}
      <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Request Refill</DialogTitle>
            <DialogDescription className="text-slate-500">Confirm early refill request for {selectedMed?.brandName || 'your medication'}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600"><p>We will submit the refill request to your pharmacy. Once approved, you will see a new tracking card under Pharmacy Orders.</p></div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setIsRefillOpen(false)} className="w-full" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleRefillRequest} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Confirm Refill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
