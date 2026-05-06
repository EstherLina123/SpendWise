import { useFirebase } from '../components/FirebaseProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function Analytics() {
  const { transactions, categories, profile } = useFirebase();

  // 1. Spending by Category
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const expenseByCategory = categories
    .filter(c => c.type === 'expense' || c.type === 'both')
    .map(c => {
      const total = expenseTransactions
        .filter(t => t.categoryId === c.id)
        .reduce((acc, t) => acc + t.amount, 0);
      return { name: c.name, value: total, color: c.color };
    })
    .filter(item => item.value > 0);

  // 2. Monthly Trends (Last 6 months)
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = subMonths(new Date(), 5 - i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    
    const monthTransactions = transactions.filter(t => t.date >= start && t.date <= end);
    const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    return {
      name: format(monthDate, 'MMM'),
      income,
      expense
    };
  });

  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-12">
      <header>
        <h2 className="label-caps mb-2">Economics</h2>
        <h1 className="text-4xl font-serif text-white tracking-tight">Market Analytics</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Breakdown */}
        <div className="glass p-8 space-y-8">
          <h3 className="label-caps">Allocation by Sector</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  innerRadius={70}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#fff' : `rgba(255,255,255,${0.6 - (index * 0.1)})`} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', border: '1px solid #27272a', fontSize: '10px' }}
                  formatter={(value: number) => [`${profile?.currency}${value.toLocaleString()}`, 'Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            {expenseByCategory.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">{item.name}</span>
                  <span className="text-[10px] text-zinc-500 font-bold">{((item.value / (totalExpense || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-[1px] bg-zinc-900">
                  <div className="h-full bg-zinc-500" style={{ width: `${(item.value / (totalExpense || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass p-8 space-y-8">
          <h3 className="label-caps">Liquidity Flux</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', border: '1px solid #27272a', fontSize: '10px' }}
                />
                <Bar dataKey="income" fill="#fff" radius={[2, 2, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="#27272a" radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="label-caps !text-[9px]">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-zinc-800 rounded-full" />
              <span className="label-caps !text-[9px]">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryItem label="Max Inbound" value={Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0)} currency={profile?.currency} />
        <SummaryItem label="Avg Outbound" value={totalExpense / (expenseTransactions.length || 1)} currency={profile?.currency} />
        <SummaryItem 
          label="Efficiency" 
          value={transactions.filter(t => t.type === 'income').length > 0 ? 
            ((transactions.filter(t => t.type === 'income').reduce((a,b)=>a+b.amount,0) - totalExpense) / transactions.filter(t => t.type === 'income').reduce((a,b)=>a+b.amount,0)) * 100 : 
            0
          } 
          isPercent 
        />
      </div>
    </div>
  );
}

function SummaryItem({ label, value, currency, isPercent }: { label: string, value: number, currency?: string, isPercent?: boolean }) {
  return (
    <div className="glass p-8 border-zinc-800">
       <p className="label-caps mb-4">{label}</p>
       <p className="text-3xl font-serif text-white">
         {isPercent ? `${value.toFixed(1)}%` : `${currency}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
       </p>
    </div>
  );
}
