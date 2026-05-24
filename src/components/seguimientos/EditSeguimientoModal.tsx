"use client";

import { useState } from "react";
import { updateSeguimientoAction } from "@/app/actions/seguimientoActions";
import { Loader2, Edit3, X } from "lucide-react";

export function EditSeguimientoModal({ 
  seguimiento, 
  onClose,
  onSuccess 
}: { 
  seguimiento: any;
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
    formData.append("idSeguimiento", seguimiento.idSeguimiento);
    formData.append("idLead", seguimiento.idLead);

    const res = await updateSeguimientoAction(formData);

    if (res.success) {
      setLoading(false);
      onSuccess();
    } else {
      setError(res.error || "Error al actualizar el seguimiento");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-600 p-5 text-center relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Edit3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Editar Seguimiento</h2>
          <p className="text-blue-100 text-sm mt-1">Realizado el {seguimiento.fecha} por {seguimiento.asesor}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Contacto *</label>
              <select name="tipoContacto" defaultValue={seguimiento.tipoContacto} required className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none">
                <option value="Llamada">Llamada</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Correo">Correo Electrónico</option>
                <option value="Cita">Cita Presencial</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resultado de la acción *</label>
              <select name="resultado" defaultValue={seguimiento.resultado} required className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none">
                <option value="Interesado - Agendó cita">Interesado - Agendó cita</option>
                <option value="Interesado - Pagará inscripción">Interesado - Pagará inscripción</option>
                <option value="Pidió información - Dar seguimiento">Pidió información - Dar seguimiento</option>
                <option value="No contestó">No contestó</option>
                <option value="Equivocado / Fuera de servicio">Equivocado / Fuera de servicio</option>
                <option value="Ya no le interesa">Ya no le interesa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comentario *</label>
            <textarea 
              name="comentario" 
              required 
              defaultValue={seguimiento.comentario}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Próxima Acción (Opcional)</label>
              <select name="proximaAccion" defaultValue={seguimiento.proximaAccion} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none text-sm">
                <option value="">Ninguna</option>
                <option value="Llamar de nuevo">Llamar de nuevo</option>
                <option value="Enviar WhatsApp">Enviar WhatsApp</option>
                <option value="Recibir en Campus">Recibir en Campus</option>
                <option value="Verificar pago">Verificar pago</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Próxima Acción</label>
              <input 
                type="date" 
                name="fechaProxima"
                defaultValue={seguimiento.fechaProxima}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100">
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
              className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Edit3 className="w-5 h-5 mr-2" /> Guardar Cambios</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
