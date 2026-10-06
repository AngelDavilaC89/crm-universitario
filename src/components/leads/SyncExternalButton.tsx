"use client";

import { useState } from "react";
import { RefreshCcw, Check, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncExternalButton({ campusId }: { campusId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
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
        
        // Lanzar una alerta nativa para que sea súper visible
        window.alert(data.message || `Importados exitosamente`);
        
        // Refrescar la página para ver los nuevos leads
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

  if (status === "loading") {
    return (
      <button disabled className="flex items-center px-4 py-2 bg-slate-100 text-slate-500 font-medium rounded-xl border border-slate-200">
        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
        Sincronizando...
      </button>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 font-medium rounded-xl border border-green-200 text-sm">
        <Check className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center px-4 py-2 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200 text-sm" title={message}>
        <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="truncate max-w-[200px]">Error de sincronización</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleSync}
      className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-colors"
      title="Sincronizar Leads del Drive Externo"
    >
      <RefreshCcw className="w-4 h-4 mr-2" />
      Refrescar Leads
    </button>
  );
}
