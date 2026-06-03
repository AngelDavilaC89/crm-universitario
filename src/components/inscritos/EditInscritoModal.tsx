"use client";

import { useState } from "react";
import { updateInscritoAction } from "@/app/actions/inscritoActions";
import { Loader2, Edit3, X } from "lucide-react";

export function EditInscritoModal({ 
  inscrito, 
  campusOptions,
  carrerasOptions,
  modalidadesOptions
}: { 
  inscrito: any;
  campusOptions: string[];
  carrerasOptions: string[];
  modalidadesOptions: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    prospecto: inscrito.prospecto || "",
    campus: inscrito.campus && !inscrito.campus.includes("?") ? inscrito.campus : (campusOptions[0] || ""),
    carrera: inscrito.carrera && !inscrito.carrera.includes("?") ? inscrito.carrera : (carrerasOptions[0] || ""),
    modalidad: inscrito.modalidad && !inscrito.modalidad.includes("?") ? inscrito.modalidad : (modalidadesOptions[0] || ""),
    turno: inscrito.turno && !inscrito.turno.includes("?") ? inscrito.turno : "Matutino",
    periodo: inscrito.periodo && !inscrito.periodo.includes("?") ? inscrito.periodo : "Mayo-Agosto",
    año: inscrito.año && !inscrito.año.includes("?") ? inscrito.año : new Date().getFullYear().toString(),
    montoPagadoPapeleria: inscrito.montoPagadoPapeleria || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await updateInscritoAction(inscrito.idInscrito, formData);

    if (result.success) {
      setIsOpen(false);
    } else {
      setError(result.error || "Ocurrió un error al actualizar");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-2"
        title="Editar datos del alumno"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden mt-10 mb-10">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Editar Inscripción</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {/* Notice sobre campos protegidos */}
              <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                Puedes editar los datos de asignación del grupo y el monto de papelería. Otros datos financieros están protegidos.
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Alumno</label>
                <input 
                  type="text" 
                  name="prospecto"
                  required
                  value={formData.prospecto}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Campus</label>
                  <select 
                    name="campus" 
                    required
                    value={formData.campus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    {campusOptions.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Carrera</label>
                  <select 
                    name="carrera" 
                    required
                    value={formData.carrera}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    {carrerasOptions.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Modalidad</label>
                  <select 
                    name="modalidad" 
                    required
                    value={formData.modalidad}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    {modalidadesOptions.map((m, i) => (
                      <option key={i} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Turno</label>
                  <select 
                    name="turno" 
                    required
                    value={formData.turno}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="Matutino">Matutino</option>
                    <option value="Nocturno">Nocturno</option>
                    <option value="Sabatino">Sabatino</option>
                    <option value="Dominical">Dominical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Año</label>
                  <select 
                    name="año" 
                    required
                    value={formData.año}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Periodo</label>
                  <select 
                    name="periodo" 
                    required
                    value={formData.periodo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="Enero-Abril">Enero-Abril</option>
                    <option value="Mayo-Agosto">Mayo-Agosto</option>
                    <option value="Septiembre-Diciembre">Septiembre-Diciembre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Monto de Manejo de Papelería</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-500">$</span>
                  <input 
                    type="number" 
                    name="montoPagadoPapeleria"
                    value={formData.montoPagadoPapeleria}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
