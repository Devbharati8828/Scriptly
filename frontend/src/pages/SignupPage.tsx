import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CapsuleLogoIcon, PriorAuthShieldIcon } from '@/components/icons/CustomIcons';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock signup: just navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex selection:bg-blue-200">
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-linear-to-br from-[#0a2e6c] via-[#0d3b8f] to-[#1e40af] overflow-hidden items-center justify-center p-12">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_70%_30%,white_0%,transparent_60%)]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500 rounded-full blur-[100px] opacity-30" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-400 rounded-full blur-[100px] opacity-20" />
        
        {/* Floating elements */}
        <motion.div 
          animate={{ y: [10, -10, 10] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 right-16 backdrop-blur-md p-4 rounded-2xl bg-white/10 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center gap-3 text-white">
             <PriorAuthShieldIcon className="w-10 h-10 drop-shadow-md" />
             <div>
               <p className="text-sm font-bold">Prior Auth Approved</p>
               <p className="text-xs text-blue-200">Ready for pickup</p>
             </div>
          </div>
        </motion.div>

        <div className="relative z-10 text-white max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
            <CapsuleLogoIcon className="w-14 h-14 drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">Join Scriptly</h1>
          <p className="text-xl text-blue-100 font-medium leading-relaxed">
            Take control of your health with automated refills and seamless care coordination.
          </p>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 relative">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <CapsuleLogoIcon className="w-6 h-6 drop-shadow-sm" />
          <span className="text-xl font-bold text-slate-800">Scriptly</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 my-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create an account</h2>
            <p className="text-slate-500">Get started with effortless medication management</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start pt-0.5">
                  <input type="checkbox" className="peer sr-only" required />
                  <div className="w-5 h-5 rounded border border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                  <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm text-slate-600 leading-tight">
                  I agree to the <a href="#" className="text-blue-600 font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>.
                </span>
              </Label>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl group mt-4">
              Create Account
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">Or sign up with</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 bg-white border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12 bg-white border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.33-.78 3.73-.78 1.6 0 2.8.69 3.54 1.76-2.92 1.76-2.42 5.68.42 6.84-.71 1.83-1.64 3.44-2.77 4.35zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
