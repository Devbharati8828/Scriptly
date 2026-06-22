import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { getStatusColor } from '@/lib/utils';
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

export default function MedicationsPage() {
  const { medications, addMedication, refetch } = useData();
  const { authHeaders } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [isDiscontinueOpen, setIsDiscontinueOpen] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    dosage: '',
    frequency: 'Once daily',
    pillCount: '30',
    totalPills: '30',
    pharmacyId: 'CVS Pharmacy — Main St',
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const handleRefillRequest = async () => {
    if (!selectedMed) return;
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await addMedication({
      brandName: formData.brandName,
      genericName: formData.genericName,
      dosage: formData.dosage,
      frequency: formData.frequency,
      pillCount: parseInt(formData.pillCount) || 30,
      totalPills: parseInt(formData.totalPills) || 30,
      pharmacyId: formData.pharmacyId,
    });
    if (success) {
      setIsOpen(false);
      setFormData({ brandName: '', genericName: '', dosage: '', frequency: 'Once daily', pillCount: '30', totalPills: '30', pharmacyId: 'CVS Pharmacy — Main St' });
    }
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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-200 shrink-0">
                  <Plus className="h-4 w-4" />
                  Add Medication
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-800">Add New Medication</DialogTitle>
                <DialogDescription className="text-slate-500">Enter your medication details below to add it to your profile.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="brandName" className="text-slate-700">Brand Name</Label>
                  <Input id="brandName" placeholder="e.g. Lipitor" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} required className="bg-slate-50 border-slate-200 focus:bg-white" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="pillCount" className="text-slate-700">Pill Count (Current)</Label>
                    <Input id="pillCount" type="number" placeholder="30" value={formData.pillCount} onChange={(e) => setFormData({ ...formData, pillCount: e.target.value })} required className="bg-slate-50 border-slate-200 focus:bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="totalPills" className="text-slate-700">Total Size (Pack)</Label>
                    <Input id="totalPills" type="number" placeholder="30" value={formData.totalPills} onChange={(e) => setFormData({ ...formData, totalPills: e.target.value })} required className="bg-slate-50 border-slate-200 focus:bg-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pharmacyId" className="text-slate-700">Pharmacy</Label>
                  <select id="pharmacyId" value={formData.pharmacyId} onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })} className="w-full h-9 rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none bg-slate-50 border-slate-200 focus:bg-white">
                    <option value="CVS Pharmacy — Main St">CVS Pharmacy — Main St</option>
                    <option value="Walgreens — Oak Ave">Walgreens — Oak Ave</option>
                  </select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">Add Medication</Button>
                </DialogFooter>
              </form>
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
                    <DropdownMenuItem onClick={() => { setSelectedMed(med); setIsEditScheduleOpen(true); }}>Edit Schedule</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedMed(med); setIsDiscontinueOpen(true); }}>Discontinue</DropdownMenuItem>
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
                  className={isUrgent ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}
                  onClick={() => { setSelectedMed(med); if (isUrgent) setIsRefillOpen(true); else setIsDetailsOpen(true); }}
                >
                  {isUrgent ? 'Refill Now' : 'Details'}
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
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRefillOpen(false)} className="w-full">Cancel</Button>
            <Button onClick={handleRefillRequest} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Request Refill</Button>
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
              <select className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:bg-white focus:outline-none">
                <option value="08:00">08:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="20:00">08:00 PM</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditScheduleOpen(false)} className="w-full">Cancel</Button>
            <Button onClick={() => { toast.success('Schedule updated successfully!'); setIsEditScheduleOpen(false); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discontinue Dialog */}
      <Dialog open={isDiscontinueOpen} onOpenChange={setIsDiscontinueOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Discontinue Medication?</DialogTitle>
            <DialogDescription className="text-slate-500">Are you sure you want to discontinue {selectedMed?.brandName}?</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600"><p className="text-red-500 font-medium">Warning: This will stop all automated refill scheduling and caregiver updates for this medication.</p></div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDiscontinueOpen(false)} className="w-full">Cancel</Button>
            <Button onClick={() => { toast.success('Medication discontinued successfully.'); setIsDiscontinueOpen(false); }} className="w-full bg-red-600 hover:bg-red-700 text-white">Discontinue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
