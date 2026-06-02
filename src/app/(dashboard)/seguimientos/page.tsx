import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { MessageSquareText, Phone, Calendar, ArrowRight, User, Mail, Activity, CheckCircle2, AlertCircle, Search } from "lucide-react";
import Link from "next/link";

export default async function GlobalSeguimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role;
  const email = session.user.email;

  // Obtener todos los seguimientos y leads al mismo tiempo
  const [todosSeguimientos, todosLeads] = await Promise.all([
    googleSheets.getAllSeguimientos(),
    googleSheets.getLeads()
  ]);

  const leadsMap = new Map(todosLeads.map(l => [l.idLead, l]));

  // Await searchParams
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q?.toLowerCase() || "";

  // Filtrar si es asesor o campus
  let seguimientos = todosSeguimientos;
  
  if (role === "Campus" || role === "Asesor") {
    const userCampus = session.user.campus;
    seguimientos = todosSeguimientos.filter(s => {
      const leadInfo = leadsMap.get(s.idLead);
      return leadInfo?.campusInteres === userCampus;
    });
  }

  // Filtrar por búsqueda profunda
  if (searchQuery) {
    seguimientos = seguimientos.filter(seg => {
      const leadInfo = leadsMap.get(seg.idLead);
      const valores = [
        ...Object.values(seg),
        leadInfo?.prospecto || "",
        leadInfo?.campusInteres || "",
        leadInfo?.carrera || "",
        leadInfo?.turno || ""
      ].map(v => String(v).toLowerCase());
      
      return valores.some(v => v.includes(searchQuery));
    });
  }

  // Estadísticas rápidas
  const totalLlamadas = seguimientos.filter(s => s.tipoContacto === 'Llamada').length;
  const totalWhatsApp = seguimientos.filter(s => s.tipoContacto === 'WhatsApp').length;
  const totalCitas = seguimientos.filter(s => s.tipoContacto === 'Cita').length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bitácora de Actividad</h1>
          </div>
          <p className="text-slate-300 max-w-2xl text-lg">
            Monitorea todas las interacciones, llamadas y mensajes con los prospectos en tiempo real.
          </p>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-slate-300 text-sm font-medium mb-1">Total Registros</div>
            <div className="text-3xl font-bold text-white">{seguimientos.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-blue-200 text-sm font-medium mb-1 flex items-center gap-1"><Phone className="w-4 h-4"/> Llamadas</div>
            <div className="text-3xl font-bold text-blue-100">{totalLlamadas}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-green-200 text-sm font-medium mb-1 flex items-center gap-1"><MessageSquareText className="w-4 h-4"/> WhatsApp</div>
            <div className="text-3xl font-bold text-green-100">{totalWhatsApp}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-purple-200 text-sm font-medium mb-1 flex items-center gap-1"><User className="w-4 h-4"/> Citas</div>
            <div className="text-3xl font-bold text-purple-100">{totalCitas}</div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <form className="flex w-full md:w-auto relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Buscar en seguimientos..."
            className="w-full sm:w-80 pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm text-slate-900"
          />
        </form>
      </div>

      {/* Grid de Seguimientos */}
      {seguimientos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {seguimientos.map((seg, idx) => {
            // Determinar colores por tipo de contacto
            const isLlamada = seg.tipoContacto === 'Llamada';
            const isWhatsApp = seg.tipoContacto === 'WhatsApp';
            const isCita = seg.tipoContacto === 'Cita';
            
            const iconBg = isLlamada ? 'bg-blue-100 text-blue-600' : 
                           isWhatsApp ? 'bg-green-100 text-green-600' : 
                           isCita ? 'bg-purple-100 text-purple-600' : 
                           'bg-slate-100 text-slate-600';

            const Icon = isLlamada ? Phone : 
                         isWhatsApp ? MessageSquareText : 
                         isCita ? User : Mail;

            // Insignia de resultado
            const isPositivo = seg.resultado?.toLowerCase().includes('interesado') || seg.resultado?.toLowerCase().includes('cita');
            
            const leadInfo = leadsMap.get(seg.idLead);
            const nombreLead = leadInfo?.prospecto || "Lead Desconocido";
            const campusLead = leadInfo?.campusInteres || "Sin campus";
            const carreraLead = leadInfo?.carrera || "Sin carrera";
            const turnoLead = leadInfo?.turno || "Sin turno";
            
            return (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group flex flex-col h-full">
                
                {/* Header de la Tarjeta (Info del Lead) */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${iconBg} shadow-sm shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1" title={nombreLead}>
                        {nombreLead}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{campusLead}</span>
                        <span>•</span>
                        <span>{carreraLead}</span>
                        <span>•</span>
                        <span>{turnoLead}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/leads/${seg.idLead}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 ml-2"
                    title="Ver detalle del prospecto"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                
                {/* Metadatos de la Interacción */}
                <div className="flex items-center gap-2 mb-3 px-1 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{seg.tipoContacto || "Interacción"}</span>
                  <span>el</span>
                  <span>{seg.fecha || "Fecha desconocida"}</span>
                </div>

                {/* Comentario */}
                <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mb-4">
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    "{seg.comentario}"
                  </p>
                </div>

                {/* Footer de la tarjeta con Badges */}
                <div className="mt-auto space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {/* Badge Resultado */}
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      isPositivo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {isPositivo ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <AlertCircle className="w-3.5 h-3.5 mr-1.5" />}
                      {seg.resultado || "Sin resultado"}
                    </span>
                    
                    {/* Badge Asesor (Si es Admin) */}
                    {role !== "Asesor" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        {seg.asesor?.split('@')[0]}
                      </span>
                    )}
                  </div>

                  {/* Próxima Acción */}
                  {seg.proximaAccion && (
                    <div className="flex items-center justify-between bg-orange-50/80 border border-orange-100 rounded-xl p-3">
                      <div className="flex items-center text-orange-800 text-sm font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                        {seg.proximaAccion}
                      </div>
                      <span className="text-xs font-bold text-orange-600 bg-white px-2 py-1 rounded-lg shadow-sm">
                        {seg.fechaProxima}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquareText className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aún no hay actividad</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No se han registrado llamadas, mensajes ni citas. Cuando comiences a contactar prospectos, todo el historial aparecerá aquí con un diseño espectacular.
          </p>
        </div>
      )}
    </div>
  );
}
