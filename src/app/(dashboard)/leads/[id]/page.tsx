import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { notFound } from "next/navigation";
import { User, Phone, Mail, MapPin, Calendar, Clock, BookOpen, MessageCircle } from "lucide-react";
import { NewSeguimientoForm } from "@/components/seguimientos/NewSeguimientoForm";
import { SeguimientoCard } from "@/components/seguimientos/SeguimientoCard";
import { EditPreInscripcionModal } from "@/components/leads/EditPreInscripcionModal";
import Link from "next/link";

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // En Next.js 15, params es una promesa que debe ser esperada
  const resolvedParams = await params;
  const idLead = resolvedParams.id;

  // Fetching de datos en paralelo
  const [lead, seguimientos] = await Promise.all([
    googleSheets.getLeadById(idLead),
    googleSheets.getSeguimientos(idLead)
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      
      {/* Columna Izquierda: Información del Lead */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              {(lead.prospecto || "U").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{lead.prospecto || "Lead Sin Nombre"}</h2>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${lead.statusLead === 'Inscrito' ? 'bg-green-500' : lead.statusLead === 'Descartado' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
              {lead.statusLead || 'Nuevo Lead'}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Datos de Contacto</h3>
            
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">{lead.celular}</p>
                <p className="text-xs text-slate-500">Teléfono Móvil</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-800 truncate">{lead.correo || 'No proporcionado'}</p>
                <p className="text-xs text-slate-500">Correo Electrónico</p>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-4"></div>
            
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interés Académico</h3>

            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">{lead.carrera}</p>
                <p className="text-xs text-slate-500">{lead.modalidad}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">{lead.campusInteres}</p>
                <p className="text-xs text-slate-500">Campus de Interés</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">{lead.periodoInteres} {lead.año}</p>
                <p className="text-xs text-slate-500">Periodo de Ingreso</p>
              </div>
            </div>
          </div>
          
          {lead.comentario && (
            <div className="p-6 bg-yellow-50 border-t border-yellow-100">
              <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-2">Comentario Inicial</h3>
              <p className="text-sm text-yellow-900">{lead.comentario}</p>
            </div>
          )}

          {/* Botón para abrir Pre-inscripción */}
          <div className="px-6 pb-6 pt-4 border-t border-slate-100">
            {(!lead.statusLead || lead.statusLead.toLowerCase() === 'nuevo lead' || lead.statusLead.toLowerCase() === 'en seguimiento') ? (
              <Link
                href={`/leads/${idLead}/pre-inscribir`}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-sm transition-all text-sm"
              >
                Pre-inscribir Prospecto
              </Link>
            ) : lead.statusLead.toLowerCase() === 'pre-inscrito' ? (
              <div className="w-full text-center py-3 bg-slate-50 text-slate-500 rounded-xl font-medium text-sm border border-slate-200 mb-3">
                Prospecto Pre-inscrito. Para completar inscripción ve a Grupos.
              </div>
            ) : null}
            
            {/* Si está pre-inscrito, permitir editar esos datos directamente desde aquí */}
            {lead.statusLead && lead.statusLead.toLowerCase() === 'pre-inscrito' && (
              <EditPreInscripcionModal lead={lead} />
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Historial y Formulario */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Formulario de Nuevo Seguimiento */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Registrar Seguimiento</h2>
          <NewSeguimientoForm idLead={idLead} />
        </div>

        {/* Historial de Seguimientos (Timeline) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Historial de Actividad
          </h2>

          {seguimientos.length > 0 ? (
            <div className="space-y-6">
              {seguimientos.map((seg, idx) => (
                <SeguimientoCard 
                  key={idx} 
                  seg={seg} 
                  isLast={idx === seguimientos.length - 1} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No hay seguimientos registrados</p>
              <p className="text-sm text-slate-400 mt-1">Sé el primero en contactar a este prospecto.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
