"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useRouter } from "next/navigation";

type ChartData = {
  name: string;
  count: number;
  color: string;
};

export function DashboardPendingCharts({ data, totalPending }: { data: ChartData[], totalPending: number }) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl h-full">
        <p className="text-slate-500">No hay datos de leads pendientes.</p>
      </div>
    );
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700">
          <p className="font-medium text-sm">{payload[0].payload.name}</p>
          <p className="font-bold text-lg">{payload[0].value} prospectos olvidados</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Leads Sin Seguimiento (En Espera)</h3>
          <p className="text-sm text-slate-500">
            Mide a los prospectos que entraron al sistema pero NO han sido contactados aún.
          </p>
        </div>
        
        <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl flex items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Total Olvidados</span>
            <span className="text-xl font-bold text-slate-800 text-center">
              {totalPending}
            </span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            barSize={60}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <Tooltip cursor={{ fill: '#F1F5F9' }} content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[6, 6, 0, 0]}
              onClick={(chartData: any) => {
                const name = chartData.name;
                let pendingParam = "";
                if (name === "< 24 horas") pendingParam = "menos-24-horas";
                else if (name === "1 a 3 días") pendingParam = "1-a-3-dias";
                else if (name === "> 3 días") pendingParam = "mas-3-dias";
                
                if (pendingParam) {
                  router.push(`/leads?pending=${pendingParam}`);
                }
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80 transition-opacity" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
