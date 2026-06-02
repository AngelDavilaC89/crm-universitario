"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface DashboardFiltersProps {
  campuses: string[];
  years: string[];
  periods: string[];
}

export function DashboardFilters({ campuses, years, periods }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializar estado con los valores de la URL o vacíos por defecto
  const [selectedCampus, setSelectedCampus] = useState(searchParams.get("campus") || "");
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get("period") || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (selectedCampus) params.set("campus", selectedCampus);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedPeriod) params.set("period", selectedPeriod);

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <select
        value={selectedCampus}
        onChange={(e) => setSelectedCampus(e.target.value)}
        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
      >
        <option value="">Todos los Campus</option>
        {campuses.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
      >
        <option value="">Todos los Años</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
      >
        <option value="">Todos los Periodos</option>
        {periods.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <button
        onClick={handleFilter}
        className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow font-medium transition-colors"
      >
        Filtrar
      </button>
    </div>
  );
}
