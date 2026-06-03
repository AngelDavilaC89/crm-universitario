"use client";

import { useState } from "react";
import { updatePreInscripcionAction } from "@/app/actions/leadActions";
import { Loader2, Edit3, X } from "lucide-react";

export function EditPreInscripcionModal({ 
  lead,
  carrerasOptions
}: { 
  lead: any;
  carrerasOptions: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    montoPapeleria: lead.montoPapeleria || "",
    carreraAsignada: lead.carreraAsignada || lead.carrera || "",
    turnoAsignado: lead.turnoAsignado || lead.turno || "Matutino",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await updatePreInscripcionAction(lead.idLead, formData);

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
        className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl font-medium shadow-sm transition-all text-sm border border-blue-200"
      >
        <Edit3 className="w-4 h-4" />
        Editar Pre-inscripción
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden mt-10 mb-10">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Editar Pre-inscripción</h3>
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

              <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100 mb-4">
                Puedes corregir la carrera y el turno asignado, así como el monto pagado de papelería.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Carrera Asignada</label>
                  <select 
                    name="carreraAsignada"
                    required
                    value={formData.carreraAsignada}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    {carrerasOptions.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Turno Asignado</label>
                  <select 
                    name="turnoAsignado" 
                    required
                    value={formData.turnoAsignado}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="Matutino">Matutino</option>
                    <option value="Nocturno">Nocturno</option>
                    <option value="Sabatino">Sabatino</option>
                    <option value="Dominical">Dominical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Monto de Papelería</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-500">$</span>
                  <input 
                    type="number" 
                    name="montoPapeleria"
                    value={formData.montoPapeleria}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
