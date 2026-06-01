"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type ChartData = {
  name: string;
  count: number;
  color: string;
};

export function DashboardCharts({ data, averageHours }: { data: ChartData[], averageHours: number }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl">
        <p className="text-slate-500">No hay suficientes datos de seguimiento para calcular los tiempos.</p>
      </div>
    );
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700">
          <p className="font-medium text-sm">{payload[0].payload.name}</p>
          <p className="font-bold text-lg">{payload[0].value} prospectos</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Tiempos de Primer Contacto (SLA)</h3>
          <p className="text-sm text-slate-500">
            Mide qué tan rápido se contacta a un Lead desde que entra al sistema.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Promedio Global</span>
            <span className="text-xl font-bold text-slate-800">
              {averageHours < 1 
                ? `${Math.round(averageHours * 60)} min` 
                : `${averageHours.toFixed(1)} hrs`}
            </span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-4">
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
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
