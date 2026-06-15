import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Activity, Pill, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';

export default function ReportsPage() {
  const { adherenceData, costData, medications } = useData();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Track your adherence and medication costs</p>
        </div>
        <Button 
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm gap-2 shrink-0"
          onClick={() => setIsExportOpen(true)}
        >
          <Download className="w-4 h-4" />
          Export Claims Pack
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
             <div className="flex justify-between items-start mb-4">
               <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                 <Activity className="w-6 h-6" />
               </div>
               <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                 <TrendingUp className="w-3 h-3 mr-1" />
                 +2.4%
               </Badge>
             </div>
             <h3 className="text-slate-500 text-sm font-medium">Avg Adherence Rate</h3>
             <p className="text-3xl font-bold text-slate-800 mt-1">93%</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
             <div className="flex justify-between items-start mb-4">
               <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                 <CheckCircle2 className="w-6 h-6" />
               </div>
             </div>
             <h3 className="text-slate-500 text-sm font-medium">Refills On Time</h3>
             <p className="text-3xl font-bold text-slate-800 mt-1">26/28</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
             <div className="flex justify-between items-start mb-4">
               <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                 <DollarSign className="w-6 h-6" />
               </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                 <TrendingUp className="w-3 h-3 mr-1" />
                 +$14
               </Badge>
             </div>
             <h3 className="text-slate-500 text-sm font-medium">Total Savings (YTD)</h3>
             <p className="text-3xl font-bold text-slate-800 mt-1">$315</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
             <div className="flex justify-between items-start mb-4">
               <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                 <Pill className="w-6 h-6" />
               </div>
             </div>
             <h3 className="text-slate-500 text-sm font-medium">Active Medications</h3>
             <p className="text-3xl font-bold text-slate-800 mt-1">{medications.length}</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Adherence Chart */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Adherence Trend</h3>
              <p className="text-sm text-slate-500">Monthly percentage of doses taken on time</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[80, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="adherenceRate" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAdherence)" 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cost Chart */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
             <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Medication Costs</h3>
              <p className="text-sm text-slate-500">Out-of-pocket vs. Insurance Covered</p>
            </div>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Bar dataKey="outOfPocket" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} name="Out of Pocket" />
                  <Bar dataKey="insurancePaid" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Insurance Paid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Export Claims Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Export Claims Pack</DialogTitle>
            <DialogDescription className="text-slate-500">
              Download structured billing and adherence reports for insurance claims.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Select Date Range</label>
              <select className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:bg-white focus:outline-none">
                <option value="ytd">Year to Date (2026)</option>
                <option value="last3">Last 3 Months</option>
                <option value="last6">Last 6 Months</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Export Format</label>
              <select className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:bg-white focus:outline-none">
                <option value="pdf">PDF Report (Recommended)</option>
                <option value="csv">CSV Spreadsheet</option>
                <option value="json">JSON Format</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsExportOpen(false)} className="w-full">Cancel</Button>
            <Button 
              onClick={() => {
                alert('Claims pack generated and downloaded successfully!');
                setIsExportOpen(false);
              }} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Temporary inline Badge component until we resolve imports later if needed.
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
}
