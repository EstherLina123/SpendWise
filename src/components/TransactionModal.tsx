import { useState, useEffect } from 'react';
import React from 'react';
import { X, Calendar as CalendarIcon, Tag, AlignLeft, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from './FirebaseProvider';
import { addDoc, collection, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType } from '../types';

export default function TransactionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { categories, user, profile, handleFirestoreError } = useFirebase();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && categories.length > 0) {
      const filtered = categories.filter(c => c.type === type || c.type === 'both');
      if (filtered.length > 0 && !categoryId) {
        setCategoryId(filtered[0].id);
      }
    }
  }, [isOpen, type, categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId) return;

    setLoading(true);
    try {
      const path = 'transactions';
      await addDoc(collection(db, path), {
        userId: user.uid,
        type,
        amount: parseFloat(amount),
        categoryId,
        note,
        date: new Date(date),
        createdAt: new Date()
      });
      onClose();
      // Reset form
      setAmount('');
      setNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto h-fit w-full max-w-lg glass bg-[#0A0A0A] border-zinc-800 shadow-2xl p-8 z-50 overflow-hidden rounded-none"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="label-caps !text-white tracking-[0.3em]">New Log Entry</h2>
              <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex bg-zinc-900/50 p-1 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    type === 'expense' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  Liability
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    type === 'income' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  Inflow
                </button>
              </div>

              <div className="space-y-2">
                <label className="label-caps opacity-50 block ml-1">Capital Amount</label>
                <div className="relative">
                   <input 
                    autoFocus
                    type="number" 
                    required
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-white py-6 text-5xl font-serif text-white outline-none transition-all placeholder:text-zinc-900"
                  />
                  <span className="absolute right-0 bottom-6 text-2xl font-serif text-zinc-600">
                    {profile?.currency}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-caps opacity-50 block ml-1">Classification</label>
                  <select 
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none rounded-none"
                  >
                    <option value="">Select Sector</option>
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-caps opacity-50 block ml-1">Log Date</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-caps opacity-50 block ml-1">Memorandum</label>
                <textarea 
                  placeholder="Details of transaction..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none h-24 resize-none rounded-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-2xl"
              >
                {loading ? 'Archiving...' : 'Confirm Entry'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
