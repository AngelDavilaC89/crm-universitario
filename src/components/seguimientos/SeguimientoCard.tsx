"use client";

import { useState } from "react";
import { Phone, MessageCircle, User, Mail, Edit3, Calendar } from "lucide-react";
import { EditSeguimientoModal } from "./EditSeguimientoModal";

export function SeguimientoCard({ 
  seg, 
  isLast 
}: { 
  seg: any; 
  isLast: boolean; 
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex gap-4 relative group">
      {/* Línea conectora */}
      {!isLast && (
        <div className="absolute top-10 left-5 w-px h-full bg-slate-200 -ml-px"></div>
      )}
      
      {/* Icono de tipo de contacto */}
      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0
        ${seg.tipoContacto === 'Llamada' ? 'bg-blue-100 text-blue-600' : ''}
        ${seg.tipoContacto === 'WhatsApp' ? 'bg-green-100 text-green-600' : ''}
        ${seg.tipoContacto === 'Cita' ? 'bg-purple-100 text-purple-600' : ''}
        ${!['Llamada', 'WhatsApp', 'Cita'].includes(seg.tipoContacto) ? 'bg-slate-100 text-slate-600' : ''}
      `}>
        {seg.tipoContacto === 'Llamada' ? <Phone className="w-4 h-4" /> : 
         seg.tipoContacto === 'WhatsApp' ? <MessageCircle className="w-4 h-4" /> : 
         seg.tipoContacto === 'Cita' ? <User className="w-4 h-4" /> : 
         <Mail className="w-4 h-4" />}
      </div>

      {/* Contenido del seguimiento */}
      <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
        
        {/* Botón de editar (solo aparece en hover en escritorio, o siempre en móviles) */}
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-md shadow-sm border border-slate-200"
          title="Editar este seguimiento"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <div className="flex justify-between items-start mb-2 pr-10">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{seg.tipoContacto || "Seguimiento"}</span>
            <span className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
              por {seg.asesor} 
              <span className="text-slate-300">•</span> 
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {seg.fecha || "Fecha no registrada"}
            </span>
          </div>
        </div>
        
        <p className="text-slate-700 text-sm mb-3 whitespace-pre-wrap">{seg.comentario}</p>
        
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600">
            <span className="text-slate-400 mr-1">Resultado:</span> {seg.resultado}
          </span>
          {seg.proximaAccion && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 border border-orange-200 text-orange-700">
              <span className="opacity-70 mr-1">Acción:</span> {seg.proximaAccion} ({seg.fechaProxima})
            </span>
          )}
        </div>
      </div>

      {/* Renderizar Modal */}
      {isEditing && (
        <EditSeguimientoModal 
          seguimiento={seg}
          onClose={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
