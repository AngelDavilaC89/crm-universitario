"use client";

import { useState } from "react";
import { Users, AlertCircle, CheckCircle2, X, GraduationCap, Calendar, MapPin, BookOpen } from "lucide-react";

export function GrupoCard({ grupo }: { grupo: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cantidad = grupo.inscritos.length;
  const meta = 8;
  const porcentaje = Math.min((cantidad / meta) * 100, 100);
  const estaAperturado = cantidad >= meta;
  
  // Lógica del semáforo - Usando clases completas de Tailwind para que no sean purgadas
  let statusText = "PENDIENTE";
  let LightIcon = AlertCircle;
  let colors = {
    card: "border-slate-200 ring-slate-50 hover:border-slate-300 hover:ring-slate-100",
    badge: "bg-slate-100 text-slate-700",
    iconContainer: "bg-slate-50 text-slate-600",
    progress: "bg-slate-500",
    missingText: "text-slate-600",
    modalHeader: "bg-slate-50/30",
    modalIcon: "bg-slate-100 text-slate-600",
    totalText: "text-slate-600"
  };
  
  if (cantidad >= 8) {
    statusText = "APERTURADO";
    LightIcon = CheckCircle2;
    colors = {
      card: "border-green-200 ring-green-50 hover:border-green-300 hover:ring-green-100",
      badge: "bg-green-100 text-green-700",
      iconContainer: "bg-green-50 text-green-600",
      progress: "bg-green-500",
      missingText: "text-green-600",
      modalHeader: "bg-green-50/30",
      modalIcon: "bg-green-100 text-green-600",
      totalText: "text-green-600"
    };
  } else if (cantidad >= 4) {
    statusText = "PROBABLE";
    colors = {
      card: "border-amber-200 ring-amber-50 hover:border-amber-300 hover:ring-amber-100",
      badge: "bg-amber-100 text-amber-700",
      iconContainer: "bg-amber-50 text-amber-600",
      progress: "bg-amber-500",
      missingText: "text-amber-600",
      modalHeader: "bg-amber-50/30",
      modalIcon: "bg-amber-100 text-amber-600",
      totalText: "text-amber-600"
    };
  } else {
    statusText = "EN RIESGO";
    colors = {
      card: "border-red-200 ring-red-50 hover:border-red-300 hover:ring-red-100",
      badge: "bg-red-100 text-red-700",
      iconContainer: "bg-red-50 text-red-600",
      progress: "bg-red-500",
      missingText: "text-red-600",
      modalHeader: "bg-red-50/30",
      modalIcon: "bg-red-100 text-red-600",
      totalText: "text-red-600"
    };
  }

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`bg-white rounded-2xl shadow-sm border p-6 relative overflow-hidden transition-all ring-1 hover:shadow-md cursor-pointer ${colors.card}`}
      >
        
        {/* Badge de Estatus Semáforo */}
        <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${colors.badge}`}>
          <LightIcon className="w-3.5 h-3.5" />
          {statusText}
        </div>

        <div className="flex items-center gap-2 mb-4 pr-24">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconContainer}`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{grupo.carrera}</h3>
            <p className="text-xs text-slate-500 font-medium">{grupo.campus}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Periodo</span>
            <span className="font-medium text-slate-700">{grupo.periodo} {grupo.año}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Modalidad</span>
            <span className="font-medium text-slate-700">{grupo.modalidad}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Turno</span>
            <span className="font-medium text-slate-700">{grupo.turno}</span>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inscritos</span>
            <span className={`text-lg font-bold ${estaAperturado ? 'text-green-600' : 'text-slate-700'}`}>
              {cantidad} <span className="text-sm font-medium text-slate-400">/ {meta}</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-1000 ${colors.progress}`}
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
          {!estaAperturado && (
            <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${colors.missingText}`}>
              Faltan {meta - cantidad} alumno(s) para aperturar
            </p>
          )}
        </div>
      </div>

      {/* Modal de Alumnos Inscritos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            {/* Header del modal */}
            <div className={`px-6 py-5 border-b border-slate-100 flex justify-between items-start ${colors.modalHeader}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg ${colors.modalIcon}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Alumnos en este Grupo</h3>
                </div>
                <p className="text-sm text-slate-500 ml-8">{grupo.carrera} • {grupo.modalidad} • {grupo.turno}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                {grupo.inscritos.map((alumno: any, index: number) => (
                  <div key={index} className="flex items-start justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all hover:border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{alumno.prospecto}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                          <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{alumno.campus}</span>
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Inscrito: {alumno.fechaInscripcion || "Fecha N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                        Por: {alumno.asesor?.split('@')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="text-sm text-slate-500 font-medium">
                Total en grupo: <span className={`font-bold ${colors.totalText}`}>{cantidad} alumnos</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
