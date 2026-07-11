'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function SupplierSalesChart({ data }: { data: any[] }) {
  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="text-4xl mb-3">📊</div>
      <p className="text-sm">გაყიდვები ჯერ არ არის</p>
      <p className="text-xs mt-1">გრაფიკი შეივსება პირველი გაყიდვის შემდეგ</p>
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{fontSize:11}}/>
        <YAxis tick={{fontSize:11}}/>
        <Tooltip formatter={(v:any)=>[v+'₾','გაყიდვა']}/>
        <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#colorAmount)" strokeWidth={2}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}
