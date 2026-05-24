"use client";

import { useState } from "react";
import { createInscripcionAction } from "@/app/actions/inscritosActions";
import { Loader2, GraduationCap, X } from "lucide-react";

export function EnrollmentModal({ 
  idLead, 
  onClose,
  onSuccess 
}: { 
  idLead: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("idLead", idLead);

    const res = await createInscripcionAction(formData);

    if (res.success) {
      setLoading(false);
      onSuccess();
    } else {
      setError(res.error || "Error al inscribir al alumno");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-green-500 p-6 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-green-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Inscribir Alumno</h2>
          <p className="text-green-100 text-sm mt-1">Completa los datos de inscripción y validación de pago.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Folio de Pago *</label>
            <input 
              type="text" 
              name="folioPago" 
              required 
              placeholder="Ej. FOL-00123"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Papelería ($) *</label>
              <input 
                type="number" 
                name="montoPagadoPapeleria" 
                required 
                min="0"
                step="0.01"
                placeholder="Ej. 500"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Inscripción ($)</label>
              <input 
                type="number" 
                name="montoPagadoInscripcion" 
                min="0"
                step="0.01"
                defaultValue="0"
                placeholder="Ej. 1500"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">El pago de papelería debe ser mayor a cero para aplicar comisión.</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asignar Turno Final *</label>
            <select 
              name="turno" 
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white outline-none"
            >
              <option value="" className="text-slate-900">Selecciona el turno...</option>
              <option value="Matutino" className="text-slate-900">Matutino</option>
              <option value="Vespertino" className="text-slate-900">Vespertino</option>
              <option value="Nocturno" className="text-slate-900">Nocturno</option>
              <option value="Sabatino" className="text-slate-900">Sabatino</option>
              <option value="Dominical" className="text-slate-900">Dominical</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Inscribiendo...</>
              ) : (
                <><GraduationCap className="w-5 h-5 mr-2" /> Confirmar Inscripción</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
