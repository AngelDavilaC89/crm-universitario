"use client";

import { useState } from "react";
import { syncMeridaLeadsAction } from "@/app/actions/leadActions";
import { RefreshCcw, Check, XCircle } from "lucide-react";

export function SyncMeridaButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setStatus("loading");
    setMessage("Sincronizando Leads de la Feria de Becas...");
    
    const result = await syncMeridaLeadsAction();
    
    if (result.success) {
      setStatus("success");
      setMessage(`Se han importado ${result.count} leads nuevos exitosamente.`);
      setTimeout(() => setStatus("idle"), 5000);
    } else {
      setStatus("error");
      setMessage(result.error || "Ocurrió un error al sincronizar");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

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
      <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 font-medium rounded-xl border border-green-200">
        <Check className="w-4 h-4 mr-2" />
        {message}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center px-4 py-2 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200" title={message}>
        <XCircle className="w-4 h-4 mr-2" />
        Error de sincronización
      </div>
    );
  }

  return (
    <button
      onClick={handleSync}
      className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-colors"
      title="Sincronizar Leads del Excel de Feria de Becas (Mérida)"
    >
      <RefreshCcw className="w-4 h-4 mr-2" />
      Sync Mérida
    </button>
  );
}
