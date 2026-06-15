import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Pill, RefreshCw, Package, CreditCard, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';

export default function CaregiverAlertsPage() {
  const { caregiverUpdates } = useData();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'dose': return <Pill className="w-5 h-5 text-emerald-500" />;
      case 'refill': return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case 'pickup': return <Package className="w-5 h-5 text-purple-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-amber-500" />;
      case 'note': return <FileText className="w-5 h-5 text-slate-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getActionBg = (type: string) => {
    switch (type) {
      case 'dose': return 'bg-emerald-100 border-emerald-200';
      case 'refill': return 'bg-blue-100 border-blue-200';
      case 'pickup': return 'bg-purple-100 border-purple-200';
      case 'payment': return 'bg-amber-100 border-amber-200';
      case 'note': return 'bg-slate-100 border-slate-200';
      default: return 'bg-blue-100 border-blue-200';
    }
  };

  const filteredUpdates = filterType === 'all'
    ? caregiverUpdates
    : caregiverUpdates.filter(update => update.actionType === filterType);

  return (
    <div className="p-8 pb-16 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Caregiver Alerts</h1>
          <p className="text-slate-500 mt-1">Activity timeline from your care team</p>
        </div>
        <Button 
          variant="outline" 
          className="bg-white hover:bg-slate-50 text-slate-700 gap-2 shrink-0"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="w-4 h-4" />
          Filter Timeline ({filterType === 'all' ? 'All' : filterType})
        </Button>
      </div>

      <div className="glass-card rounded-3xl p-8 relative">
        {/* Continuous timeline line */}
        <div className="absolute left-[59px] top-12 bottom-12 w-0.5 bg-linear-to-b from-blue-100 via-slate-200 to-transparent z-0" />

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 relative z-10">
          {filteredUpdates.map((update) => (
            <motion.div key={update.id} variants={itemVariants} className="flex gap-6 group">
              {/* Avatar Column */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full p-1 bg-white shadow-sm ring-1 ring-slate-100 z-10 relative group-hover:ring-blue-200 transition-all">
                  <img 
                    src={update.caregiverAvatar} 
                    alt={update.caregiverName}
                    className="w-full h-full rounded-full object-cover bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${update.caregiverName}&background=0D8ABC&color=fff`;
                    }}
                  />
                  {/* Action Type Icon Badge overlay */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${getActionBg(update.actionType)}`}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {React.cloneElement(getActionIcon(update.actionType) as any, { className: 'w-3 h-3' })}
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 pt-2">
                <div className="bg-white/60 hover:bg-white/90 border border-slate-100 hover:border-blue-100 rounded-2xl p-5 shadow-sm transition-colors">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <p className="text-slate-800">
                      <span className="font-bold text-lg mr-1">{update.caregiverName}</span>
                      <span className="text-slate-600">{update.action}</span>
                    </p>
                    <span className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">
                      {update.timestamp}
                    </span>
                  </div>
                  
                  {update.medication && (
                    <Badge variant="outline" className="mt-2 bg-blue-50/50 text-blue-700 border-blue-100 gap-1.5 py-1 px-3">
                      <Pill className="w-3 h-3" />
                      {update.medication}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Filter Activity Timeline</DialogTitle>
            <DialogDescription className="text-slate-500">
              Select update types to display in the feed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {[
              { value: 'all', label: 'All Updates' },
              { value: 'dose', label: 'Dose Reminders' },
              { value: 'refill', label: 'Refills & Renewals' },
              { value: 'pickup', label: 'Pharmacy Shipments' },
              { value: 'payment', label: 'Co-pay & Bills' },
              { value: 'note', label: 'Care Circle Notes' }
            ].map(f => (
              <Button
                key={f.value}
                variant={filterType === f.value ? 'default' : 'outline'}
                onClick={() => { setFilterType(f.value); setIsFilterOpen(false); }}
                className="w-full justify-start text-left bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
