"use client";

import { useState } from "react";
import { createSeguimientoAction } from "@/app/actions/seguimientoActions";
import { Loader2, Plus } from "lucide-react";

export function NewSeguimientoForm({ idLead }: { idLead: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("idLead", idLead);

    const res = await createSeguimientoAction(formData);

    if (res.success) {
      // Limpiar formulario manual
      const form = e.target as HTMLFormElement;
      form.reset();
      setLoading(false);
    } else {
      setError(res.error || "Error al guardar el seguimiento");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de Contacto *</label>
          <select name="tipoContacto" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white">
            <option value="Llamada">Llamada telefónica</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Correo">Correo Electrónico</option>
            <option value="Cita">Cita en Campus</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Resultado *</label>
          <select name="resultado" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white">
            <option value="Contestó - Interesado">Contestó - Interesado</option>
            <option value="Contestó - No le interesa">Contestó - No le interesa</option>
            <option value="No contestó">No contestó / Buzón</option>
            <option value="Agendó Cita">Agendó Cita</option>
            <option value="Número equivocado">Número equivocado</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Comentarios o Notas *</label>
          <textarea name="comentario" required rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900" placeholder="¿Qué se habló con el prospecto?"></textarea>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Próxima Acción a realizar</label>
          <input type="text" name="proximaAccion" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900" placeholder="Ej: Volver a marcar" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Fecha de próxima acción</label>
          <input type="date" name="fechaProxima" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900" />
        </div>

        <div className="md:col-span-2 mt-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Actualizar Estatus del Lead</label>
          <select name="nuevoEstatus" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-slate-50 font-medium">
            <option value="En seguimiento">Mantener: En seguimiento</option>
            <option value="Descartado">Mover a: Descartado (Perdido)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Plus className="w-4 h-4 mr-2" /> Agregar Seguimiento</>
          )}
        </button>
      </div>
    </form>
  );
}
