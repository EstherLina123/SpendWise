import { useFirebase } from '../components/FirebaseProvider';
import React from 'react';
import { User, Mail, Globe, Lock, Shield, ChevronRight, LogOut, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType } from '../types';

export default function Profile() {
  const { user, profile, logOut, categories, handleFirestoreError } = useFirebase();

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        currency: e.target.value
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category? Transactions using it will remain but without category info.')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'categories');
    }
  };

  return (
    <div className="space-y-12 max-w-3xl mx-auto pb-20">
      <header className="flex flex-col items-center text-center py-10">
        <div className="relative group mb-6">
          <div className="w-24 h-24 rounded-full border border-zinc-800 shadow-2xl overflow-hidden bg-zinc-900 flex items-center justify-center italic font-serif text-3xl text-zinc-600">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : user?.displayName?.[0]}
          </div>
        </div>
        <h2 className="text-3xl font-serif text-white mb-1">{user?.displayName}</h2>
        <p className="label-caps opacity-50">Platinum Portfolio Member</p>
      </header>

      <section className="space-y-6">
        <h3 className="label-caps px-1">Security & Preferences</h3>
        <div className="glass overflow-hidden border-zinc-800 divide-y divide-zinc-900">
          <SettingItem 
            icon={<Globe className="text-zinc-400" size={18} />} 
            label="Denomination" 
            action={
              <select 
                value={profile?.currency || 'USD'} 
                onChange={handleCurrencyChange}
                className="bg-transparent border-none text-[10px] uppercase font-bold tracking-widest text-white py-1 focus:ring-0 cursor-pointer"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            }
          />
          <SettingItem 
            icon={<Lock className="text-zinc-600" size={18} />} 
            label="Biometric Vault" 
            action={<span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Inactive</span>}
          />
          <SettingItem 
            icon={<Shield className="text-zinc-600" size={18} />} 
            label="Legal Disclosures" 
            showChevron
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="label-caps">Sector Classifications</h3>
          <button className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 hover:underline">
             <Plus size={14} /> New Sector
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 glass border-zinc-800 group hover:bg-zinc-900/40 transition-all">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-serif text-white">{cat.name}</span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{cat.type}</span>
                </div>
              </div>
              <button 
                onClick={() => deleteCategory(cat.id)}
                className="p-2 text-zinc-800 hover:text-red-900 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-8">
        <button 
          onClick={logOut}
          className="w-full flex items-center justify-center gap-3 p-4 border border-zinc-800 text-zinc-500 rounded-none text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-900 hover:text-white transition-all shadow-xl"
        >
          <LogOut size={16} />
          Terminate Session
        </button>
      </section>
    </div>
  );
}

function SettingItem({ icon, label, action, showChevron }: { icon: React.ReactNode, label: string, action?: React.ReactNode, showChevron?: boolean }) {
  return (
    <div className="flex items-center justify-between p-5 hover:bg-zinc-900/20 transition-colors cursor-pointer group">
      <div className="flex items-center gap-5">
        <div className="text-zinc-600 group-hover:text-zinc-100 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {action}
        {showChevron && <ChevronRight size={16} className="text-zinc-800" />}
      </div>
    </div>
  );
}
