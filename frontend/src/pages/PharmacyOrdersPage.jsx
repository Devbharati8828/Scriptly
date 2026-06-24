import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Store, MapPin, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { getStatusColor } from '@/lib/utils';

export default function PharmacyOrdersPage() {
  const { pharmacyOrders, pharmacies } = useData();
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPharmacyDetailsOpen, setIsPharmacyDetailsOpen] = useState(false);
  const [isDownloadReceiptOpen, setIsDownloadReceiptOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const renderOrdersList = (orders) => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 font-bold text-lg">No orders yet</p>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">When you request a refill or place a pharmacy order, it will appear here for tracking.</p>
        </div>
      );
    }

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        {orders.map((order) => {
          const pharmacyDetails = pharmacies.find(p => p.name === order.pharmacy);
          
          return (
            <motion.div key={order.id} variants={itemVariants} className="glass-card rounded-2xl p-6 md:p-8">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-slate-800">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                    <Badge variant="outline" className={`capitalize font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-slate-600 font-medium">{order.medications.join(', ')}</p>
                </div>
                <div className="flex flex-col md:items-end gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    {order.deliveryType === 'delivery' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                    <span className="capitalize">{order.deliveryType}</span>
                  </div>
                  <div className="font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                    Expected: {order.expectedDate}
                  </div>
                </div>
              </div>

              {/* Horizontal Stepper Tracker */}
              <div className="mb-10 px-2 md:px-8">
                <div className="relative flex justify-between items-center">
                  {/* Background connecting line */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0" />
                  
                  {/* Active connecting line */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-1000"
                    style={{ 
                      width: `${(order.trackingSteps.filter(s => s.completed).length - 1) / (order.trackingSteps.length - 1) * 100}%` 
                    }}
                  />

                  {order.trackingSteps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 bg-white transition-colors duration-500 ${
                        step.completed 
                          ? 'border-emerald-500 text-emerald-500' 
                          : step.current 
                            ? 'border-blue-500 text-blue-500 shadow-[0_0_0_6px_rgba(59,130,246,0.15)]' 
                            : 'border-slate-200 text-slate-300'
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${step.current ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'}`} />}
                      </div>
                      <div className="absolute top-12 md:top-14 text-center w-24 md:w-32 -ml-8 md:-ml-11">
                        <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${step.completed || step.current ? 'text-slate-700' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        {step.date && <p className="text-[10px] text-slate-500 mt-1 font-medium">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100 mt-12 md:mt-16">
                
                {/* Pharmacy Info */}
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
                  <div className="flex items-center gap-3 mb-4 text-blue-800">
                    <Store className="w-5 h-5" />
                    <h4 className="font-bold">Fulfillment Pharmacy</h4>
                  </div>
                  <p className="font-semibold text-slate-800">{order.pharmacy}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                      <span>{order.pharmacyAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{order.pharmacyPhone}</span>
                    </div>
                  </div>
                  {pharmacyDetails && (
                    <Button 
                      variant="link" 
                      className="px-0 mt-2 text-blue-600 h-auto font-semibold group"
                      onClick={() => {
                        setSelectedPharmacy(pharmacyDetails);
                        setIsPharmacyDetailsOpen(true);
                      }}
                    >
                      View Pharmacy Details
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-4">Cost Breakdown</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Insurance Covered</span>
                      <span className="font-medium">${order.insuranceCovered?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-800 font-bold pt-3 border-t border-slate-200">
                      <span>Out of Pocket</span>
                      <span className="text-lg">${order.cost?.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-6 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDownloadReceiptOpen(true);
                    }}
                  >
                    Download Receipt
                  </Button>
                </div>

              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className="p-8 pb-16 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Pharmacy Orders</h1>
        <p className="text-slate-500 mt-1">Track your deliveries and pickups</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 bg-white/50 border border-slate-200">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active Tracking</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {renderOrdersList(pharmacyOrders)}
        </TabsContent>

        <TabsContent value="active" className="space-y-8">
          {renderOrdersList(pharmacyOrders.filter(o => o.status !== 'delivered' && o.status !== 'picked-up'))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-8">
          {renderOrdersList(pharmacyOrders.filter(o => o.status === 'delivered' || o.status === 'picked-up'))}
        </TabsContent>
      </Tabs>

      {/* Pharmacy Details Dialog */}
      <Dialog open={isPharmacyDetailsOpen} onOpenChange={setIsPharmacyDetailsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">{selectedPharmacy?.name}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Fulfillment Partner Details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-slate-600">
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl">
              <p><strong>Address:</strong> {selectedPharmacy?.address || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedPharmacy?.phone || 'N/A'}</p>
              <p><strong>Hours:</strong> Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-6PM</p>
              <p><strong>Refills Supported:</strong> Automated clearance & delivery</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPharmacyDetailsOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Receipt Dialog */}
      <Dialog open={isDownloadReceiptOpen} onOpenChange={setIsDownloadReceiptOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Receipt Details</DialogTitle>
            <DialogDescription className="text-slate-500">
              Receipt summary for Order #{selectedOrder?.id.substring(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-slate-600">
            <div className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50">
              <div className="flex justify-between">
                <span>Medications:</span>
                <span className="font-semibold text-slate-800">{selectedOrder?.medications.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedOrder?.expectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Insurer Covered:</span>
                <span>${selectedOrder?.insuranceCovered?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
                <span>Paid Out-of-Pocket:</span>
                <span>${selectedOrder?.cost?.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">Receipt downloaded successfully (Mock).</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDownloadReceiptOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
