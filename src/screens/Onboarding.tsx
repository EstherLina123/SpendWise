import { LogIn, Wallet, Shield, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

export default function Onboarding({ onSignIn }: { onSignIn: () => Promise<void> }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-2xl mb-12"
      >
        <div className="w-6 h-6 bg-black rounded-sm" />
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-6xl font-serif text-white tracking-tight mb-6"
      >
        Preserve Your Equity.
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="label-caps mb-16 opacity-60"
      >
        Sophisticated financial tracking for the modern individual.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 w-full max-w-3xl">
        <FeatureCard 
          icon={<Shield className="text-zinc-100" size={20} />} 
          title="Encrypted" 
          desc="Vault-grade security for your data." 
          delay={0.4}
        />
        <FeatureCard 
          icon={<Zap className="text-zinc-100" size={20} />} 
          title="Frictionless" 
          desc="Rapid logging for high-velocity lifestyles." 
          delay={0.5}
        />
        <FeatureCard 
          icon={<TrendingUp className="text-zinc-100" size={20} />} 
          title="Insightful" 
          desc="Deep analytics on capital allocation." 
          delay={0.6}
        />
      </div>

      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onSignIn}
        className="bg-white text-black px-12 py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-95"
      >
        Begin Onboarding
      </motion.button>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass p-8 text-left rounded-none border-zinc-800"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="font-serif text-white text-lg mb-2">{title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed font-medium uppercase tracking-tighter">{desc}</p>
    </motion.div>
  );
}
