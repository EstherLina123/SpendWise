import { Search, Filter, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { format } from 'date-fns';
import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType } from '../types';

export default function History() {
  const { transactions, categories, profile, handleFirestoreError } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => {
    const category = categories.find(c => c.id === t.categoryId);
    const matchesSearch = (t.note || category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'transactions');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="label-caps mb-2">Ledger</h2>
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-serif text-white tracking-tight">Audit History</h1>
          <span className="text-zinc-500 text-sm italic">{transactions.length} records found</span>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input 
            type="text" 
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-none text-zinc-300 placeholder:text-zinc-700 focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all text-sm"
          />
        </div>
        <div className="flex bg-zinc-900 p-1 border border-zinc-800">
          {['all', 'income', 'expense'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                filterType === type ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-black">
                <th className="px-6 py-4 label-caps">Transaction</th>
                <th className="px-6 py-4 label-caps">Category</th>
                <th className="px-6 py-4 label-caps">Date</th>
                <th className="px-6 py-4 label-caps">Amount</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-[#0A0A0A]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => {
                  const category = categories.find(c => c.id === t.categoryId);
                  return (
                    <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-white text-sm font-serif">{t.note || category?.name}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] border border-zinc-800 px-2 py-1">
                          {category?.icon} {category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-zinc-500 font-medium">
                        {format(t.date, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-sm font-serif ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                          {t.type === 'income' ? '+' : '-'}{profile?.currency}{t.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-zinc-700 hover:text-red-900 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center label-caps opacity-30 italic">
                    No matching records discovered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
