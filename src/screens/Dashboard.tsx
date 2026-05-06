import { Wallet, ArrowDownCircle, ArrowUpCircle, ChevronRight, PlusCircle, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../components/FirebaseProvider';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ onAddClick }: { onAddClick: () => void }) {
  const { transactions, profile, categories } = useFirebase();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Prepare chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = format(d, 'MMM dd');
    const dayTransactions = transactions.filter(t => format(t.date, 'MMM dd') === dateStr);
    const income = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { name: dateStr, income, expense };
  });

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="label-caps mb-4">Available Liquidity</h2>
          <div className="flex items-baseline gap-4">
            <h3 className="text-6xl md:text-7xl font-serif text-white tracking-tight leading-none">
              {profile?.currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-zinc-500 text-sm italic">
              {totalIncome > totalExpense ? '+' : '-'}{((Math.abs(totalIncome - totalExpense) / (totalIncome || 1)) * 100).toFixed(1)}% vs last month
            </span>
          </div>
        </div>
        <div className="hidden md:flex gap-3">
          <button 
            onClick={onAddClick}
            className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
          >
            Add Transaction
          </button>
          <button className="px-4 py-3 border border-zinc-800 hover:border-zinc-700 transition-colors bg-transparent">
            <TrendingUp size={16} className="text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="label-caps">Recent Activity</h2>
          <div className="space-y-1">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((t) => {
                const category = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center justify-between p-5 glass hover:bg-zinc-900/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center text-xl bg-zinc-900 rounded border border-zinc-800">
                        {category?.icon || '💰'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-serif leading-none mb-1">{t.note || category?.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{category?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-serif ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === 'income' ? '+' : '-'}{profile?.currency}{t.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">
                        {format(t.date, 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 glass text-center">
                 <p className="label-caps opacity-30">No activity yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <h2 className="label-caps">Allocated Budgets</h2>
           <div className="space-y-8">
             <BudgetProgress label="Income Goal" used={totalIncome} total={5000} color="zinc-400" />
             <BudgetProgress label="Total Expenses" used={totalExpense} total={4000} color="zinc-600" />
             <div className="pt-4">
               <div className="p-6 glass border-zinc-800">
                 <p className="label-caps mb-4">Financial Insight</p>
                 <p className="font-serif italic text-white text-lg leading-snug">
                   Your liquidity has increased by 12% this month. Consider reallocating some funds to your private vault.
                 </p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Chart Section */}
      <section className="pt-4">
        <h2 className="label-caps mb-8">Performance Metrics</h2>
        <div className="h-64 glass p-6 rounded-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis 
                hide
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', border: '1px solid #27272a', fontSize: '10px' }} 
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#fff" 
                strokeWidth={1}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function BudgetProgress({ label, used, total, color }: { label: string, used: number, total: number, color: string }) {
  const percent = Math.min(Math.round((used / total) * 100), 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-2 font-bold tracking-wider">
        <span className="text-zinc-100 uppercase">{label}</span>
        <span className="text-zinc-500 uppercase">{percent}% Utilized</span>
      </div>
      <div className="w-full h-[1px] bg-zinc-900 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full bg-zinc-400`} 
        />
      </div>
    </div>
  );
}
