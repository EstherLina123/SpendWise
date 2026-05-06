import { useState } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { useFirebase } from '../components/FirebaseProvider';
import { UserPlus, ArrowLeft, Mail, Lock, User } from 'lucide-react';

export default function SignUp({ onBack, onGoToSignIn }: { onBack: () => void, onGoToSignIn: () => void }) {
  const { signUpEmail } = useFirebase();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUpEmail(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8 overflow-hidden">
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onBack}
        className="fixed top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors label-caps"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center mx-auto mb-8">
            <div className="w-6 h-6 bg-black rounded-xs" />
          </div>
          <h1 className="text-4xl font-serif text-white tracking-tight mb-2">Request Access.</h1>
          <p className="label-caps opacity-50">Join the equity management system</p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 text-xs font-bold uppercase tracking-wider mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="label-caps text-[9px] opacity-40 ml-1">Full Legal Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 outline-none transition-all text-white rounded-none text-sm placeholder:text-zinc-700"
                placeholder="Julian D. Equity"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-caps text-[9px] opacity-40 ml-1">Identity (Email)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 outline-none transition-all text-white rounded-none text-sm placeholder:text-zinc-700"
                placeholder="julian.d@equity.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-caps text-[9px] opacity-40 ml-1">Credential (Password)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 outline-none transition-all text-white rounded-none text-sm placeholder:text-zinc-700"
                placeholder="Min. 8 characters"
                minLength={8}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Request'}
          </button>
        </form>

        <p className="mt-12 text-center text-zinc-500 text-[10px] uppercase tracking-widest">
          Already a member?{' '}
          <button 
            onClick={onGoToSignIn}
            className="text-white hover:underline font-bold"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
