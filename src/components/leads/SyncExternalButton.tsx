"use client";

import { useState, useRef, useEffect } from "react";
import { RefreshCcw, Check, XCircle, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncExternalButton({ campusId }: { campusId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Diccionario de configuración por campus
  const campusConfigs: Record<string, any> = {
    'EC-Eloy Cavazos': {
      fileId: '1roghd1regvcNS2T06cO31vG_vQ4fUKtt',
      sheetName: '',
      campusId: 'EC-Eloy Cavazos',
      label: 'Eloy Cavazos',
      colMap: {
        prospecto: '1',
        celular: '2',
        correo: '3',
        carrera: '5',
        comentario: '10'
      }
    },
    'MM-Montemorelos': {
      fileId: '1STilwMVlvwvkOTSXPNiB4s1uTCZskgAL',
      sheetName: 'Brenda Caballero',
      campusId: 'MM-Montemorelos',
      label: 'Montemorelos',
      colMap: {
        prospecto: '1',
        celular: '2',
        correo: '3',
        carrera: '5',
        comentario: '11'
      }
    },
    'PM-Padre Mier': {
      fileId: '1Y4I6ranofhzrVTcXfReNVta4_YbuGmQO',
      sheetName: 'KAREN VILLARREAL',
      campusId: 'PM-Padre Mier',
      label: 'Padre Mier',
      colMap: {
        prospecto: '1',
        celular: '2',
        correo: '3',
        carrera: '5',
        comentario: '11'
      }
    }
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerSyncForConfig = async (config: any) => {
    setShowDropdown(false);
    setStatus("loading");
    setMessage(`Sincronizando ${config.label || config.campusId}...`);
    
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

  const handleSyncAll = async () => {
    setShowDropdown(false);
    setStatus("loading");
    setMessage("Sincronizando todos los campus...");
    
    let totalInserted = 0;
    try {
      for (const key of Object.keys(campusConfigs)) {
        const config = campusConfigs[key];
        const response = await fetch('/api/sync-external', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        const data = await response.json();
        if (response.ok && data.success) {
          totalInserted += (data.inserted || 0);
        }
      }
      setStatus("success");
      setMessage(`Sincronización completada. Se importaron ${totalInserted} leads nuevos en total.`);
      setShowModal(true);
      router.refresh();
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Error de red");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const isSpecificCampus = Boolean(campusConfigs[campusId]);

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
      ) : isSpecificCampus ? (
        <button
          onClick={() => triggerSyncForConfig(campusConfigs[campusId])}
          className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm"
          title={`Sincronizar Leads de ${campusConfigs[campusId]?.label}`}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refrescar Leads
        </button>
      ) : (
        /* Selector para usuarios con "Todos" o campus sin archivo fijo */
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm"
            title="Sincronizar Leads de Drive"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refrescar Leads
            <ChevronDown className="w-4 h-4 ml-1.5" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 focus:outline-none z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Seleccionar Campus
                </div>
                {Object.keys(campusConfigs).map(key => (
                  <button
                    key={key}
                    onClick={() => triggerSyncForConfig(campusConfigs[key])}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between"
                  >
                    <span>{campusConfigs[key].label}</span>
                  </button>
                ))}
              </div>
              <div className="py-1">
                <button
                  onClick={handleSyncAll}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  ⚡ Sincronizar Todos
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
