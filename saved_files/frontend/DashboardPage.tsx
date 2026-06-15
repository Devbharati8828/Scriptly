import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill, Calendar, ShieldCheck, Bell, ChevronDown, Package, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { getStatusColor, getInitials } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function DashboardPage() {
  const { medications, reminders, priorAuths, pharmacyOrders, caregiverUpdates, currentUser } = useData();
  const navigate = useNavigate();
  const [isTakeDoseOpen, setIsTakeDoseOpen] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const activeReminders = reminders.filter(r => r.status === 'due' || r.status === 'upcoming');
  const upcomingRefills = medications.filter(m => m.daysLeft <= 14).sort((a, b) => a.daysLeft - b.daysLeft);
  const activeOrder = pharmacyOrders.find(o => o.status !== 'delivered' && o.status !== 'picked-up');
  
  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Good Morning, {currentUser?.name || 'User'}</h1>
        <p className="text-slate-500 mt-1">Here is your medication overview for today.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            variants={itemVariants} 
            onClick={() => navigate('/medications')}
            className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Auto Refills</h3>
              <p className="text-sm font-medium text-emerald-600">3 Scheduled</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            onClick={() => navigate('/pharmacy-orders')}
            className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Next Delivery</h3>
              <p className="text-sm font-medium text-blue-600">Arriving Friday</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            onClick={() => navigate('/prior-authorizations')}
            className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Prior Auths</h3>
              <p className="text-sm font-medium text-indigo-600">2 In Progress</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            onClick={() => navigate('/caregiver-alerts')}
            className="glass-card rounded-2xl p-5 flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Caregiver Alerts</h3>
              <p className="text-sm font-medium text-amber-600">1 New Alert</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Today's Reminders Widget */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Today's Reminders
              </h2>
              
              {activeReminders.length > 0 ? (
                <div className="bg-white/60 rounded-xl p-5 border border-white flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5 w-full">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl animate-bounce">
                      {activeReminders[0].icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Time to Take Your Pills</h3>
                      <p className="text-slate-500 font-medium">{activeReminders[0].medicationName} • Take {activeReminders[0].pillCount} Pill(s)</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-11 px-8 shadow-lg shadow-blue-200"
                      onClick={() => {
                        setSelectedMed(medications.find(m => m.brandName === activeReminders[0].medicationName) || activeReminders[0]);
                        setIsTakeDoseOpen(true);
                      }}
                    >
                      TAKE DOSE
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-slate-700 h-8">
                          Snooze <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem onClick={() => alert('Snoozed for 15 Minutes')}>15 Minutes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Snoozed for 1 Hour')}>1 Hour</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">All caught up for now!</p>
              )}
            </motion.div>

            {/* Upcoming Refills Widget */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Upcoming Refills</h2>
              <div className="space-y-4">
                {upcomingRefills.slice(0, 3).map((med) => (
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
                            <span>Refill Scheduled for {med.nextRefillDate.split('-').slice(1).join('/')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={med.daysLeft <= 7 ? "default" : "outline"}
                      className={med.daysLeft <= 7 ? "bg-green-500 hover:bg-green-600 text-white font-bold tracking-wide shadow-md shadow-green-100" : "bg-white text-slate-600 border-slate-200 uppercase text-xs font-bold"}
                      size="sm"
                      onClick={() => {
                        setSelectedMed(med);
                        if (med.daysLeft <= 7) {
                          setIsRefillOpen(true);
                        } else {
                          navigate('/medications');
                        }
                      }}
                    >
                      {med.daysLeft <= 7 ? 'REFILL EARLY' : 'EDIT'}
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Caregiver Updates Widget */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Caregiver Updates</h2>
                <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50" onClick={() => navigate('/caregiver-alerts')}>View All</Button>
              </div>
              <div className="space-y-4">
                {caregiverUpdates.slice(0, 2).map((update) => (
                  <div key={update.id} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden border border-blue-200 shrink-0">
                      {update.caregiverAvatar.startsWith('/') ? (
                        getInitials(update.caregiverName)
                      ) : (
                        <img src={update.caregiverAvatar} alt={update.caregiverName} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">
                        <span className="font-bold">{update.caregiverName}</span> {update.action}
                      </p>
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

          {/* Right Column (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Prior Authorizations Widget */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 bg-gradient-to-br from-white to-blue-50/30">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Prior Authorizations
              </h2>
              <div className="space-y-3">
                {priorAuths.slice(0, 2).map((pa) => (
                  <div key={pa.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 truncate pr-2 max-w-[180px]">{pa.medicationName.split(' ')[0]} Renewal</h4>
                        <p className="text-xs text-slate-500 mt-1">{pa.statusLabel}</p>
                      </div>
                      <Badge className={getStatusColor(pa.status)}>
                        {pa.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full mt-2 text-blue-600 border-blue-100 hover:bg-blue-50 font-semibold" size="sm" onClick={() => navigate('/prior-authorizations')}>
                      VIEW STATUS
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pharmacy Order Tracking Widget */}
            {activeOrder && (
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-500" />
                  Pharmacy Order Tracking
                </h2>
                
                <div className="bg-white rounded-xl p-5 border border-slate-100 mb-4 shadow-sm">
                  <p className="font-bold text-slate-700 mb-5">{activeOrder.pharmacy}</p>
                  
                  {/* Mini Stepper */}
                  <div className="relative flex justify-between items-center px-2 mb-6 mt-2">
                    <div className="absolute left-0 right-0 top-1.5 h-1 bg-slate-100 z-0"></div>
                    <div 
                      className="absolute left-0 top-1.5 h-1 bg-emerald-500 z-0 transition-all" 
                      style={{ width: `${(activeOrder.trackingSteps.filter(s => s.completed).length - 1) / (activeOrder.trackingSteps.length - 1) * 100}%` }}
                    ></div>
                    
                    {activeOrder.trackingSteps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 bg-white ${step.completed ? 'border-emerald-500' : step.current ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]' : 'border-slate-200'}`}>
                           {step.current && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>}
                        </div>
                        <p className={`absolute top-6 w-20 text-center -ml-8 text-[10px] font-bold leading-tight ${step.current ? 'text-blue-700' : 'text-slate-500'}`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Expected:</span>
                    <span className="font-bold text-slate-800">{activeOrder.expectedDate}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 group"
                  onClick={() => navigate('/pharmacy-orders')}
                >
                  TRACK PACKAGE <ChevronDown className="w-4 h-4 ml-2 group-hover:-rotate-90 transition-transform" />
                </Button>
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>

      {/* Take Dose Confirmation Dialog */}
      <Dialog open={isTakeDoseOpen} onOpenChange={setIsTakeDoseOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Confirm Dose Intake</DialogTitle>
            <DialogDescription className="text-slate-500">
              Confirm that you have taken your dose of {selectedMed?.brandName || 'your medication'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600">
            <p>This will log the intake and notify your caregiver circle that you are on track with your schedule today.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsTakeDoseOpen(false)} className="w-full">Cancel</Button>
            <Button 
              onClick={() => {
                alert('Dose logged successfully! Caregivers have been notified.');
                setIsTakeDoseOpen(false);
              }} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refill Dialog */}
      <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Request Refill</DialogTitle>
            <DialogDescription className="text-slate-500">
              Confirm early refill request for {selectedMed?.brandName || 'your medication'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600">
            <p>We will submit the refill request to your pharmacy. Once approved, you will see a new tracking card under Pharmacy Orders.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRefillOpen(false)} className="w-full">Cancel</Button>
            <Button 
              onClick={() => {
                alert('Refill requested successfully!');
                setIsRefillOpen(false);
              }} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Confirm Refill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
