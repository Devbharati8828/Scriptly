import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Settings2, MoreHorizontal, ShieldAlert, Zap, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/context/DataContext';
import { getInitials } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function CareCirclePage() {
  const { careCircleMembers } = useData();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [activeMember, setActiveMember] = useState(null);
  const [relayMed, setRelayMed] = useState('Atorvastatin 20mg');
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    relationship: 'Family Member',
    permission: 'view-only',
  });

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    toast.success(`Invitation sent to ${inviteForm.name} (${inviteForm.email})!`);
    setIsInviteOpen(false);
    setInviteForm({
      name: '',
      email: '',
      relationship: 'Family Member',
      permission: 'view-only',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const getPermissionBadge = (permission) => {
    switch (permission) {
      case 'full-access':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Full Access</Badge>;
      case 'action-enabled':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Action Enabled</Badge>;
      case 'view-only':
        return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">View Only</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Care Circle</h1>
          <p className="text-slate-500 mt-1">Manage who has access to your medication profile</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger render={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-200 shrink-0">
              <Users className="h-4 w-4" />
              Invite Member
            </Button>
          }/>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Invite Care Circle Member</DialogTitle>
              <DialogDescription className="text-slate-500">
                Invite a caregiver, doctor, or family member to help manage your health.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit} className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="memberName" className="text-slate-700">Full Name</Label>
                <Input
                  id="memberName"
                  placeholder="e.g. Jane Doe"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="memberEmail" className="text-slate-700">Email Address</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  placeholder="e.g. jane@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="memberRelationship" className="text-slate-700">Relationship</Label>
                  <select
                    id="memberRelationship"
                    value={inviteForm.relationship}
                    onChange={(e) => setInviteForm({ ...inviteForm, relationship: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:bg-white focus:outline-none"
                  >
                    <option value="Family Member">Family Member</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Primary Care Physician">Primary Care Physician</option>
                    <option value="Specialist Doctor">Specialist Doctor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="memberPermission" className="text-slate-700">Permissions</Label>
                  <select
                    id="memberPermission"
                    value={inviteForm.permission}
                    onChange={(e) => setInviteForm({ ...inviteForm, permission: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:bg-white focus:outline-none"
                  >
                    <option value="view-only">View Only</option>
                    <option value="action-enabled">Action Enabled</option>
                    <option value="full-access">Full Access</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Refill Relay Feature Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-linear-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-purple-900/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Zap className="w-8 h-8 text-white fill-white/20" />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              Refill Relay
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none font-bold text-[10px] uppercase tracking-wider">New</Badge>
            </h3>
            <p className="text-indigo-50 text-sm mt-1 max-w-2xl">
              Need someone to pick up your prescription? Use a one-click shareable link to send a refill request to a family member or neighbor who can pick up and pay on your behalf.
            </p>
          </div>
        </div>
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogTrigger render={
            <Button variant="secondary" className="bg-white text-purple-700 hover:bg-indigo-50 whitespace-nowrap shrink-0 shadow-xl shadow-purple-900/30 gap-2 relative z-10">
              <Share2 className="w-4 h-4" />
              Share a Refill Link
            </Button>
          }/>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Generate Refill Relay Link</DialogTitle>
              <DialogDescription className="text-slate-500">
                Create a secure, one-time link that allows a trusted person to pick up your prescription.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-slate-800">
              <div className="space-y-1">
                <Label className="text-slate-700">Select Medication</Label>
                <select
                  value={relayMed}
                  onChange={(e) => setRelayMed(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:bg-white focus:outline-none"
                >
                  <option value="Atorvastatin 20mg">Atorvastatin 20mg</option>
                  <option value="Lisinopril 10mg">Lisinopril 10mg</option>
                  <option value="Zoloft 50mg">Zoloft 50mg</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-700">Refill Relay Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`https://scripty.health/relay/share-${relayMed.toLowerCase().replace(/ /g, '-')}`}
                    className="bg-slate-50 border-slate-200 font-mono text-xs select-all"
                  />
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://scripty.health/relay/share-${relayMed.toLowerCase().replace(/ /g, '-')}`);
                      toast.success('Copied relay link to clipboard!');                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsShareOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800">
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {careCircleMembers.map((member) => (
          <motion.div key={member.id} variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-blue-500/30 ring-4 ring-white">
                  {getInitials(member.name)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.relationship}</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    Edit Permissions
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-red-600">
                    <ShieldAlert className="w-4 h-4" />
                    Revoke Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                {member.email}
              </div>
              {member.phone && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {member.phone}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {getPermissionBadge(member.permission)}
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => {
                  setActiveMember(member);
                  setIsMessageOpen(true);
                }}
              >
                Message
              </Button>
            </div>

          </motion.div>
        ))}
      </motion.div>

      {/* Message Modal */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-2xl shadow-xl text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Send Message to {activeMember?.name}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Send a secure health update or question.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Message sent securely!'); setIsMessageOpen(false); }} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-slate-700">Message Body</Label>
              <textarea
                placeholder="Type your message here..."
                required
                className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
