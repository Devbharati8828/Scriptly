import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, FileText, UploadCloud, PhoneCall, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { getStatusColor } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function PriorAuthPage() {
  const { priorAuths, refetch } = useData();
  const { authHeaders } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [selectedPa, setSelectedPa] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const renderAuthsList = (auths) => {
    if (auths.length === 0) {
      return (
        <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-slate-700 font-bold text-lg">No prior authorizations yet</p>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">When your prescriptions require insurance pre-approval, they will appear here automatically.</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {auths.map((pa, idx) => (
          <motion.div
            key={pa.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{pa.medicationName}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>{pa.insurer}</span>
                    <span>•</span>
                    <span>{pa.planName}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(pa.status)}>
                  {pa.statusLabel}
                </Badge>
                <span className="text-xs text-slate-400">
                  Submitted: {pa.submittedDate}
                </span>
              </div>
            </div>

            {/* Grid: Timeline + Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Timeline */}
              <div className="col-span-2">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Approval Progress</h4>
                <div className="space-y-0 relative">
                  {/* Connecting Line background */}
                  <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-slate-100 z-0" />
                  
                  {pa.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex gap-4 pb-6 relative z-10">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                          step.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : step.current 
                              ? 'bg-white border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' 
                              : 'bg-white border-slate-200'
                        }`}>
                          {step.completed && <CheckCircle2 className="w-4 h-4" />}
                          {step.current && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                        </div>
                        {/* Active connection line */}
                        {sIdx < pa.steps.length - 1 && step.completed && (
                          <div className="w-0.5 h-full bg-emerald-500 absolute top-7 left-3.5" />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-medium ${step.completed || step.current ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        {step.date && <p className="text-xs text-slate-400 mt-0.5">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Side Panel */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 h-fit">
                {pa.expectedResolution && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Decision</p>
                    <p className="font-medium text-slate-800">{pa.expectedResolution}</p>
                  </div>
                )}
                {pa.notes && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{pa.notes}</p>
                  </div>
                )}

                <div className="space-y-2 mt-auto">
                  {(pa.status === 'under-review' || pa.status === 'pending') && (
                    <Button 
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200" 
                      variant="outline"
                      onClick={() => { setSelectedPa(pa); setUploadFiles([]); setIsUploadOpen(true); }}
                    >
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Button>
                  )}
                  {(pa.status === 'denied' || pa.status === 'under-review') && (
                    <Button 
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                      variant="ghost"
                      onClick={() => { setSelectedPa(pa); setIsContactOpen(true); }}
                    >
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Contact Insurer
                    </Button>
                  )}
                  {pa.status === 'approved' && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => { setSelectedPa(pa); setIsPharmacyOpen(true); }}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View Pharmacy Options
                    </Button>
                  )}
                </div>
              </div>
              
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 pb-16 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Prior Authorizations</h1>
        <p className="text-slate-500 mt-1">Track insurance approvals and ePA status</p>
      </div>

      {/* Feature Callout */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Instant Prior Auth Clearance</h3>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Scriptly automatically validates common ePA cases and issues a provisional clearance token to your pharmacy, enabling same-day fulfillment for many medications.
            </p>
          </div>
        </div>
        <Dialog open={isLearnOpen} onOpenChange={setIsLearnOpen}>
          <DialogTrigger render={
            <Button variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 whitespace-nowrap shrink-0">
              Learn How It Works
            </Button>
          }/>
          <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">How Instant ePA Clearance Works</DialogTitle>
              <DialogDescription className="text-slate-500">
                Understand our automated clearance system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm leading-relaxed text-slate-600">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">1</div>
                <p><strong>Refill Request Initiated:</strong> Your doctor submits a prescription that requires prior auth validation.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">2</div>
                <p><strong>Scriptly ePA Bridge:</strong> We parse clinical guidelines and instantly construct standard ePA requests.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">3</div>
                <p><strong>Provisional Clearance:</strong> When criteria match, Scriptly issues a clearance token to skip insurer delays.</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsLearnOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-white/50 border border-slate-200">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied / Action Needed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {renderAuthsList(priorAuths)}
        </TabsContent>
        <TabsContent value="pending" className="space-y-6">
          {renderAuthsList(priorAuths.filter(pa => pa.status === 'pending-submission' || pa.status === 'submitted' || pa.status === 'under-review'))}
        </TabsContent>
        <TabsContent value="approved" className="space-y-6">
          {renderAuthsList(priorAuths.filter(pa => pa.status === 'approved'))}
        </TabsContent>
        <TabsContent value="denied" className="space-y-6">
          {renderAuthsList(priorAuths.filter(pa => pa.status === 'denied'))}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={(open) => { setIsUploadOpen(open); if (!open) setUploadFiles([]); }}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Upload Documents for {selectedPa?.medicationName}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Upload your prescription PDF to auto-verify and approve your prior authorization.
            </DialogDescription>
          </DialogHeader>
          <label className="py-6 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors w-full">
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setUploadFiles(Array.from(e.target.files));
                  toast.success(`${e.target.files.length} file(s) selected`);
                }
              }}
            />
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Click to select files or drag & drop</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
          </label>
          {uploadFiles.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Selected Files</p>
              {uploadFiles.map((f, i) => (
                <p key={i} className="text-sm text-slate-700 truncate">📎 {f.name}</p>
              ))}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)} className="w-full" disabled={isUploading}>Cancel</Button>
            <Button
              disabled={uploadFiles.length === 0 || isUploading}
              onClick={async () => {
                if (!selectedPa || uploadFiles.length === 0) return;
                setIsUploading(true);
                try {
                  const formData = new FormData();
                  formData.append('document', uploadFiles[0]); // Send first file
                  
                  const headers = authHeaders();
                  delete headers['Content-Type']; // Let browser set boundary for multipart/form-data

                  const res = await fetch(`${API_URL}/api/prior-auths/${selectedPa.id}/upload`, {
                    method: 'POST',
                    headers,
                    body: formData,
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Upload failed');
                  toast.success('Documents uploaded — Prior authorization approved! Your pharmacy order has been placed. 🎉');
                  setIsUploadOpen(false);
                  setUploadFiles([]);
                  refetch();
                } catch (err) {
                  toast.error(err.message);
                } finally {
                  setIsUploading(false);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</span>
              ) : 'Upload & Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Insurer Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Contact {selectedPa?.insurer}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Reach out directly to speed up resolution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2">
              <p><strong>Insurer Name:</strong> {selectedPa?.insurer}</p>
              <p><strong>Plan Name:</strong> {selectedPa?.planName}</p>
              <p><strong>Member ID:</strong> <span className="font-mono">#MEM-8940294-A</span></p>
              <p><strong>Prior Auth Reference:</strong> <span className="font-mono">#PA-772910</span></p>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800">
              <PhoneCall className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold">Prior Auth Help Desk</p>
                <p className="font-mono text-base">1-800-555-0199</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsContactOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pharmacy Options Dialog */}
      <Dialog open={isPharmacyOpen} onOpenChange={setIsPharmacyOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Select Pharmacy for {selectedPa?.medicationName}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Prior auth approved. Select a pharmacy to transfer and fill.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between items-center p-3 border border-blue-200 bg-blue-50/50 rounded-xl">
              <div>
                <p className="font-bold text-slate-800">Apollo Pharmacy</p>
                <p className="text-xs text-slate-500">MG Road — 0.4 km away</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">₹85 Co-pay</p>
                <p className="text-xs text-slate-400">Ready in 2 hours</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:border-blue-100 transition-colors">
              <div>
                <p className="font-bold text-slate-800">MedPlus Pharmacy</p>
                <p className="text-xs text-slate-500">Koramangala — 1.2 km away</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">₹120 Co-pay</p>
                <p className="text-xs text-slate-400">Ready in 3 hours</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPharmacyOpen(false)} className="w-full">Cancel</Button>
            <Button onClick={() => { toast.success('Transfer request submitted to pharmacy!'); setIsPharmacyOpen(false); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Confirm Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
