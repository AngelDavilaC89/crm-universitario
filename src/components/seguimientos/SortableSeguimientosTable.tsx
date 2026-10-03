"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, MessageSquareText, User, Mail, ArrowUpDown } from 'lucide-react';

export interface SeguimientoRow {
  idLead: string;
  nombreLead: string;
  campusLead: string;
  carreraLead: string;
  tipoContacto: string;
  fechaInteraccion: string;
  fechaInteraccionRaw: number; // for sorting
  comentario: string;
  proximaAccion: string;
  fechaProxima: string;
  fechaProximaRaw: number; // for sorting
  semaforoColor: string | null;
  count: number;
}

export function SortableSeguimientosTable({ data }: { data: SeguimientoRow[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof SeguimientoRow];
        let bVal = b[sortConfig.key as keyof SeguimientoRow];
        
        // Tratar valores vacíos, 0, o NaN (como fechas inválidas o sin asignar)
        const aIsEmpty = aVal === null || aVal === undefined || aVal === "" || aVal === 0 || Number.isNaN(aVal);
        const bIsEmpty = bVal === null || bVal === undefined || bVal === "" || bVal === 0 || Number.isNaN(bVal);

        // Siempre mandar los vacíos al final (bottom) sin importar si es asc o desc
        if (aIsEmpty && !bIsEmpty) return 1;
        if (!aIsEmpty && bIsEmpty) return -1;

        if (!aIsEmpty && !bIsEmpty) {
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        }

        // Si son iguales (o ambos son vacíos), desempatar por otra columna
        if (sortConfig.key === 'fechaProximaRaw') {
          const aStr = a.proximaAccion || "";
          const bStr = b.proximaAccion || "";
          // Para strings, vacíos también al final
          if (!aStr && bStr) return 1;
          if (aStr && !bStr) return -1;
          if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        }

        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => {
    const isActive = sortConfig?.key === sortKey;
    const isAsc = isActive && sortConfig.direction === 'asc';
    return (
      <th 
        className="py-4 px-6 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors group select-none"
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          <span className={isActive ? "text-blue-600 font-bold" : ""}>{label}</span>
          <ArrowUpDown className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
          {isActive && (
            <span className="text-[10px] text-blue-600 ml-1">
              {isAsc ? '(ASC)' : '(DESC)'}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 font-bold bg-slate-50">
              <SortableHeader label="Prospecto" sortKey="nombreLead" />
              <SortableHeader label="Última Interacción" sortKey="fechaInteraccionRaw" />
              <th className="py-4 px-6">Comentario</th>
              <SortableHeader label="Próxima Acción" sortKey="fechaProximaRaw" />
              <th className="py-4 px-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row) => {
              const initial = row.nombreLead.charAt(0).toUpperCase();
              
              const isLlamada = row.tipoContacto === 'Llamada';
              const isWhatsApp = row.tipoContacto === 'WhatsApp';
              const isCita = row.tipoContacto === 'Cita';
              
              const iconBg = isLlamada ? 'bg-blue-100 text-blue-600' : 
                            isWhatsApp ? 'bg-green-100 text-green-600' : 
                            isCita ? 'bg-purple-100 text-purple-600' : 
                            'bg-slate-100 text-slate-600';

              const Icon = isLlamada ? Phone : 
                          isWhatsApp ? MessageSquareText : 
                          isCita ? User : Mail;
                          
              const semColor = row.semaforoColor;

              return (
                <tr key={row.idLead} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {initial}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 line-clamp-1" title={row.nombreLead}>{row.nombreLead}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{row.campusLead} • {row.carreraLead}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${iconBg} shadow-sm shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{row.fechaInteraccion}</span>
                    </div>
                    {row.count > 1 && <div className="text-xs text-slate-400 mt-1 pl-8">+ {row.count - 1} más</div>}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-600 line-clamp-2 max-w-sm italic" title={row.comentario}>"{row.comentario}"</p>
                  </td>
                  <td className="py-4 px-6">
                    {row.proximaAccion ? (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <div className={`w-2 h-2 rounded-full ${
                          semColor === 'rojo' ? 'bg-red-500' :
                          semColor === 'amarillo' ? 'bg-amber-500' :
                          semColor === 'verde' ? 'bg-emerald-500' :
                          'bg-slate-400'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{row.proximaAccion}</div>
                          <div className="text-xs text-slate-500">{row.fechaProxima}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Sin agendar</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link 
                      href={`/leads/${row.idLead}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 font-medium text-sm transition-colors whitespace-nowrap shadow-sm"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
