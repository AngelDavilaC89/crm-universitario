"use client";

import { useState } from "react";
import { RefreshCcw, Check, XCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncExternalButton({ campusId }: { campusId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Diccionario de configuración por campus
  const campusConfigs: Record<string, any> = {
    'EC-Eloy Cavazos': {
      fileId: '1roghd1regvcNS2T06cO31vG_vQ4fUKtt',
      sheetName: '',
      campusId: 'EC-Eloy Cavazos',
      colMap: {
        prospecto: '1',
        celular: '2',
        correo: '3',
        carrera: '5',
        comentario: '10'
      }
    }
    // Aquí puedes agregar más campus en el futuro
  };

  const handleSync = async () => {
    const config = campusConfigs[campusId];
    if (!config) {
       setStatus("error");
       setMessage(`No hay configuración de Excel para ${campusId}`);
       setTimeout(() => setStatus("idle"), 5000);
       return;
    }

    setStatus("loading");
    setMessage("Sincronizando...");
    
    try {
      const response = await fetch('/api/sync-external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus("success");
        setMessage(data.message || `Importados exitosamente`);
        setShowModal(true);
        router.refresh();
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage(data.error || "Error al sincronizar");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Error de red");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  // Solo mostrar el botón si el campus tiene configuración
  if (!campusConfigs[campusId]) return null;

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">UIN CRM dice:</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-slate-700 text-lg mb-6">{message}</p>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "loading" ? (
        <button disabled className="flex items-center px-4 py-2 bg-slate-100 text-slate-500 font-medium rounded-xl border border-slate-200">
          <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
          Sincronizando...
        </button>
      ) : status === "success" ? (
        <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 font-medium rounded-xl border border-green-200 text-sm">
          <Check className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>¡Actualizado!</span>
        </div>
      ) : status === "error" ? (
        <div className="flex items-center px-4 py-2 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200 text-sm" title={message}>
          <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate max-w-[200px]">Error</span>
        </div>
      ) : (
        <button
          onClick={handleSync}
          className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm"
          title="Sincronizar Leads del Drive Externo"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refrescar Leads
        </button>
      )}
    </>
  );
}
