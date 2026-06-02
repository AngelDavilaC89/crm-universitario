"use client";

import { useState, useTransition } from "react";
import { Users, AlertCircle, CheckCircle2, X, GraduationCap, Calendar, MapPin, BookOpen, Edit2, Loader2, Check, PhoneCall } from "lucide-react";
import { completarInscripcion } from "@/app/actions/completarInscripcion";
import { registrarLlamadaCalidadAction } from "@/app/actions/llamadaCalidadAction";

export function GrupoCard({ grupo }: { grupo: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [qualityCallStudent, setQualityCallStudent] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCompletar = async (formData: FormData) => {
    startTransition(async () => {
      const res = await completarInscripcion(formData);
      if (res.success) {
        setEditingStudent(null);
      } else {
        alert(res.error || "Ocurrió un error");
      }
    });
  };

  const handleLlamadaCalidad = async (formData: FormData) => {
    startTransition(async () => {
      const res = await registrarLlamadaCalidadAction(formData);
      if (res.success) {
        setQualityCallStudent(null);
      } else {
        alert(res.error || "Ocurrió un error");
      }
    });
  };

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
                {grupo.inscritos.map((alumno: any, index: number) => {
                  const isPreInscrito = alumno.statusLead === 'Pre-inscrito';
                  const isInscrito = alumno.statusLead === 'Inscrito';
                  const isEditing = editingStudent === alumno.idLead;
                  const isCalidadPending = isPreInscrito && alumno.llamadaCalidad !== 'Confirmado';
                  const isCalling = qualityCallStudent === alumno.idLead;

                  return (
                    <div key={index} className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all overflow-hidden">
                      <div className="flex items-start justify-between p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${isInscrito ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800">{alumno.prospecto}</h4>
                              {isInscrito && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Inscrito
                                </span>
                              )}
                              {isPreInscrito && !isCalidadPending && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Confirmado
                                </span>
                              )}
                              {isPreInscrito && isCalidadPending && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  Pendiente Calidad
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{alumno.campusInteres || alumno.campus}</span>
                              <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Inscrito: {alumno.fechaInscripcion || alumno.ultimaActualizacion || "Fecha N/A"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                            Por: {(alumno.inscritoPor || alumno.asesor)?.split('@')[0] || 'Sin Asignar'}
                          </span>
                          
                          {/* Mostrar Botón de Llamada de Calidad si está pendiente */}
                          {isCalidadPending && !isCalling && (
                            <button 
                              onClick={() => setQualityCallStudent(alumno.idLead)}
                              className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200"
                            >
                              <PhoneCall className="w-3 h-3" />
                              Llamada de Calidad
                            </button>
                          )}

                          {isCalling && (
                            <button 
                              onClick={() => setQualityCallStudent(null)}
                              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}

                          {/* Mostrar Lápiz de Cobranza SÓLO si ya pasó el filtro de calidad */}
                          {isPreInscrito && !isCalidadPending && !isEditing && (
                            <button 
                              onClick={() => setEditingStudent(alumno.idLead)}
                              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200"
                            >
                              <Edit2 className="w-3 h-3" />
                              Completar Pago
                            </button>
                          )}
                          
                          {isEditing && (
                            <button 
                              onClick={() => setEditingStudent(null)}
                              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Formulario de Llamada de Calidad */}
                      {isCalling && (
                        <div className="p-4 bg-amber-50/50 border-t border-amber-100">
                          <form action={handleLlamadaCalidad} className="space-y-4">
                            <input type="hidden" name="idLead" value={alumno.idLead} />
                            
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-2">Resultado de la Llamada de Calidad</label>
                              <select 
                                required
                                name="decision"
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm text-slate-800 mb-3"
                              >
                                <option value="Confirmado">✅ Confirma Asistencia (Continuar a pago)</option>
                                <option value="Declinó">❌ Decide no continuar</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Motivo / Notas (Opcional si confirmó, Obligatorio si declinó)</label>
                              <input 
                                type="text" 
                                name="motivo"
                                placeholder="Ej. No alcanzó a juntar el dinero..."
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm text-slate-800"
                              />
                            </div>

                            <button 
                              type="submit"
                              disabled={isPending}
                              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-all text-sm"
                            >
                              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Decisión"}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Formulario Desplegable */}
                      {isEditing && (
                        <div className="p-4 bg-blue-50/50 border-t border-blue-100">
                          <form action={handleCompletar} className="space-y-4">
                            <input type="hidden" name="idLead" value={alumno.idLead} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Folio Colegiatura</label>
                                <input 
                                  required
                                  type="text" 
                                  name="folioColegiatura"
                                  placeholder="Ej. FOL-992"
                                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Monto Colegiatura</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                                  <input 
                                    required
                                    type="number" 
                                    name="montoColegiatura"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-7 pr-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Resolución</label>
                              <select 
                                required
                                name="statusColegiatura"
                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800"
                              >
                                <option value="Pago Completado">Pago Completado (Inscrito)</option>
                                <option value="Convenio de Pago Primera colegiatura">Convenio de Pago Primera colegiatura</option>
                                <option value="Decide no continuar el proceso-Pide devolucion de papeleria y pago">Decide no continuar el proceso - Pide devolución</option>
                                <option value="Decide no continuar el proceso">Decide no continuar el proceso</option>
                              </select>
                            </div>

                            <button 
                              type="submit"
                              disabled={isPending}
                              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-all text-sm"
                            >
                              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Completar Inscripción"}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
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
