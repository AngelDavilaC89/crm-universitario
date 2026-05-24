"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLeadAction } from "@/app/actions/leadActions";
import { Loader2, Save } from "lucide-react";

export function NewLeadForm({
  campus,
  carreras,
  modalidades,
  medios
}: {
  campus: string[];
  carreras: string[];
  modalidades: string[];
  medios: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createLeadAction(formData);

    if (res.success) {
      router.push("/leads");
      router.refresh();
    } else {
      setError(res.error || "Ocurrió un error al guardar el lead.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo del Prospecto *</label>
          <input type="text" name="prospecto" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / Celular *</label>
          <input type="tel" name="celular" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
          <input type="email" name="correo" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Campus de Interés *</label>
          <select name="campusInteres" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900">
            <option value="" className="text-slate-900">Selecciona un campus...</option>
            {campus.map((c, i) => <option key={i} value={c} className="text-slate-900">{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Carrera *</label>
          <select name="carrera" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900">
            <option value="" className="text-slate-900">Selecciona una carrera...</option>
            {carreras.map((c, i) => <option key={i} value={c} className="text-slate-900">{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Modalidad *</label>
          <select name="modalidad" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900">
            <option value="" className="text-slate-900">Selecciona modalidad...</option>
            {modalidades.map((c, i) => <option key={i} value={c} className="text-slate-900">{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Turno *</label>
          <select name="turno" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900">
            <option value="" className="text-slate-900">Selecciona turno...</option>
            <option value="Matutino" className="text-slate-900">Matutino</option>
            <option value="Vespertino" className="text-slate-900">Vespertino</option>
            <option value="Nocturno" className="text-slate-900">Nocturno</option>
            <option value="Sabatino" className="text-slate-900">Sabatino</option>
            <option value="Dominical" className="text-slate-900">Dominical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Año de Ingreso *</label>
          <select name="año" required defaultValue={new Date().getFullYear().toString()} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900">
            <option value="2024" className="text-slate-900">2024</option>
            <option value="2025" className="text-slate-900">2025</option>
            <option value="2026" className="text-slate-900">2026</option>
            <option value="2027" className="text-slate-900">2027</option>
            <option value="2028" className="text-slate-900">2028</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Periodo de Interés *</label>
          <select name="periodoInteres" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900">
            <option value="" className="text-slate-900">Selecciona periodo...</option>
            <option value="Enero-Abril" className="text-slate-900">Enero-Abril</option>
            <option value="Mayo-Agosto" className="text-slate-900">Mayo-Agosto</option>
            <option value="Septiembre-Diciembre" className="text-slate-900">Septiembre-Diciembre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Medio de Captación *</label>
          <select name="medio" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900">
            <option value="" className="text-slate-900">Selecciona medio...</option>
            {medios.map((c, i) => <option key={i} value={c} className="text-slate-900">{c}</option>)}
          </select>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Comentario Inicial</label>
          <textarea name="comentario" rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"></textarea>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Guardar Lead</>
          )}
        </button>
      </div>
    </form>
  );
}
