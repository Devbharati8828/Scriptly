import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Pill, ShieldCheck, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CapsuleLogoIcon, PriorAuthShieldIcon } from '@/components/icons/CustomIcons';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginDemo();
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CapsuleLogoIcon className="w-10 h-10 drop-shadow-md" />
            <span className="text-2xl font-black tracking-tight text-slate-800">Scriptly</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="font-semibold text-slate-600 hover:text-blue-600 transition-colors disabled:opacity-60"
            >
              Sign In
            </button>
            <Button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-200 font-bold"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Started'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden bg-linear-to-br from-[#f0f7ff] via-[#e0f0ff] to-[#f8fbff]">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-1/4 hidden lg:flex w-16 h-16 bg-white rounded-2xl shadow-xl shadow-blue-900/5 items-center justify-center border border-blue-100 rotate-12"
        >
          <CapsuleLogoIcon className="w-10 h-10" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-1/4 hidden lg:flex w-20 h-20 bg-white rounded-2xl shadow-xl shadow-emerald-900/5 items-center justify-center border border-emerald-100 -rotate-12"
        >
          <PriorAuthShieldIcon className="w-12 h-12" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight leading-[1.1] mb-8"
          >
            Effortless Medication <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Management</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Automate refills, prior authorizations, pharmacy coordination, and caregiver workflows — all in one premium platform.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-200/50 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-slate-200 text-slate-700 rounded-full hover:bg-slate-50">
                See How It Works
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="text-center px-4"><p className="text-4xl font-black text-slate-800 mb-1">10K+</p><p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Patients</p></div>
            <div className="text-center px-4"><p className="text-4xl font-black text-slate-800 mb-1">500+</p><p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Pharmacies</p></div>
            <div className="text-center px-4"><p className="text-4xl font-black text-slate-800 mb-1">95%</p><p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Refill Rate</p></div>
            <div className="text-center px-4"><p className="text-4xl font-black text-slate-800 mb-1">2min</p><p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Avg PA Time</p></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Scriptly automates the entire medication continuity stack, cutting days of friction into minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -8 }} className="glass-card bg-white p-8 rounded-3xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-6"><Pill className="w-7 h-7 text-blue-600" /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Autopilot Refills</h3>
              <p className="text-slate-600 leading-relaxed">Never miss a refill. Scriptly auto-schedules and submits refill requests to your doctor or pharmacy before you run out.</p>
            </motion.div>
            <motion.div whileHover={{ y: -8 }} className="glass-card bg-white p-8 rounded-3xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-6"><ShieldCheck className="w-7 h-7 text-emerald-600" /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Prior Auth Automation</h3>
              <p className="text-slate-600 leading-relaxed">Auto-populate ePA forms, submit to insurers, and track status — turning a multi-day headache into a frictionless process.</p>
            </motion.div>
            <motion.div whileHover={{ y: -8 }} className="glass-card bg-white p-8 rounded-3xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6"><MapPin className="w-7 h-7 text-purple-600" /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Pharmacy Mesh</h3>
              <p className="text-slate-600 leading-relaxed">Find the best pharmacy based on your insurance, cost, delivery options, and real-time stock. Transfer prescriptions instantly.</p>
            </motion.div>
            <motion.div whileHover={{ y: -8 }} className="glass-card bg-white p-8 rounded-3xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-6"><Users className="w-7 h-7 text-amber-600" /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Care Circle</h3>
              <p className="text-slate-600 leading-relaxed">Securely share medication status with caregivers. Use Refill Relay for one-click pickup and payment sharing.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">How It Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Get started in minutes and let Scriptly handle the rest.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: 1, title: 'Sign Up', desc: 'Create an account and connect your insurance securely.' },
              { n: 2, title: 'Transfer Meds', desc: 'We automatically import and manage your current prescriptions.' },
              { n: 3, title: 'Relax', desc: 'We handle refills, prior auths, and delivery coordination.' },
            ].map(({ n, title, desc }) => (
              <motion.div key={n} whileHover={{ y: -8 }} className="text-center transition-all">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6 text-blue-600 font-bold text-2xl">{n}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-slate-600">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">What Our Users Say</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Join thousands of patients who have simplified their medication management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: 'Patient', quote: '"Scriptly has completely changed how I manage my monthly refills. I no longer have to call the pharmacy or my doctor. It just works!"' },
              { name: 'James T.', role: 'Caregiver', quote: '"Managing my mother\'s medications was a full-time job before Scriptly. The Care Circle feature is a lifesaver."' },
              { name: 'Dr. Emily R.', role: 'Physician', quote: '"The prior auth automation saves my staff hours every week. We recommend Scriptly to all our patients with chronic conditions."' },
            ].map(({ name, role, quote }) => (
              <motion.div key={name} whileHover={{ y: -8 }} className="glass-card bg-white p-8 rounded-3xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div><h4 className="font-bold text-slate-800">{name}</h4><p className="text-sm text-slate-500">{role}</p></div>
                </div>
                <p className="text-slate-600 italic">{quote}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <CapsuleLogoIcon className="w-8 h-8 drop-shadow-md" />
              <span className="text-xl font-black tracking-tight">Scriptly</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-medium">
              {['Features', 'Pricing', 'About', 'Privacy Policy', 'Terms of Service'].map((l) => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-center md:text-left">
            © 2026 Scriptly Health Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
