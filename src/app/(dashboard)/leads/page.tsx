import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import Link from "next/link";
import { UserPlus, Calendar, Phone, Mail, MapPin, Search, Users } from "lucide-react";
import { parseSeguimientoDate } from "@/lib/date-utils";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ año?: string; periodo?: string; q?: string; sla?: string; pending?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role;
  const campus = session.user.campus;
  const email = session.user.email;

  // Await searchParams in Next.js 15
  const resolvedParams = await searchParams;

  // Filtros actuales (por default año actual)
  const currentYear = resolvedParams.año || new Date().getFullYear().toString();
  const currentPeriod = resolvedParams.periodo || "Todos";
  const searchQuery = resolvedParams.q?.toLowerCase() || "";
  const slaFilter = resolvedParams.sla || null;
  const pendingFilter = resolvedParams.pending || null;

  // Obtener leads desde Google Sheets
  const [allLeads, allSeguimientos] = await Promise.all([
    googleSheets.getLeads(),
    googleSheets.getAllSeguimientos()
  ]);

  // Si hay filtro de SLA o Pending, pre-calcular el primer seguimiento de cada lead
  const primerSeguimientoPorLead = new Map<string, Date>();
  if (slaFilter || pendingFilter) {
    allSeguimientos.forEach(seg => {
      if (!seg.idLead || !seg.fecha) return;
      const fechaSeg = parseSeguimientoDate(seg.fecha);
      if (!fechaSeg) return;
      
      const existente = primerSeguimientoPorLead.get(seg.idLead);
      if (!existente || fechaSeg < existente) {
        primerSeguimientoPorLead.set(seg.idLead, fechaSeg);
      }
    });
  }

  // Filtrar leads según el rol, año, periodo y SLA
  const filteredLeads = allLeads.filter((lead: any) => {
    // Filtro por rol
    let roleMatch = false;
    if (role === "Dirección" || role === "Marketing") roleMatch = true;
    else if (role === "Campus" || role === "Asesor") roleMatch = lead.campusInteres === campus;
    
    if (!roleMatch) return false;

    // Filtro por Año y Periodo
    // Si la hoja no tiene la columna "Año" aún, asumimos que son del 2026
    const leadYear = lead.año || "2026";
    const añoMatch = currentYear === "Todos" || leadYear == currentYear;
    const periodoMatch = currentPeriod === "Todos" || lead.periodoInteres === currentPeriod;

    // Filtro por búsqueda de texto (Nombre, ID, o Correo)
    let searchMatch = true;
    if (searchQuery) {
      // Búsqueda profunda en todos los campos
      const valores = Object.values(lead).map(v => String(v).toLowerCase());
      searchMatch = valores.some(v => v.includes(searchQuery));
    }
    
    // Filtro por SLA
    let slaMatch = true;
    if (slaFilter || pendingFilter) {
      slaMatch = false; // Por defecto no coincide si hay filtro
      
      let timestampRegistro = NaN;
      if (lead.idLead) {
        const parts = lead.idLead.split('-');
        if (parts.length === 2) timestampRegistro = parseInt(parts[1]);
        
        if (isNaN(timestampRegistro) || timestampRegistro < 1000000000) {
          if (lead.fecha) {
            const dParts = lead.fecha.split('/');
            if (dParts.length === 3) {
              const fallbackDate = new Date(parseInt(dParts[2]), parseInt(dParts[1]) - 1, parseInt(dParts[0]), 9, 0, 0);
              timestampRegistro = fallbackDate.getTime();
            }
          }
        }
        
        if (!isNaN(timestampRegistro)) {
          const fechaPrimerContacto = primerSeguimientoPorLead.get(lead.idLead);
          
          if (slaFilter && fechaPrimerContacto) {
            const diffMs = fechaPrimerContacto.getTime() - timestampRegistro;
            const diffHoras = Math.abs(diffMs) / (1000 * 60 * 60);
            
            // Ignorar los datos atípicos mayores a 30 días para que no rompan el dashboard
            if (diffHoras <= 24 * 30) {
              if (slaFilter === "menos-1-hora" && diffHoras <= 1) slaMatch = true;
              else if (slaFilter === "1-a-4-horas" && diffHoras > 1 && diffHoras <= 4) slaMatch = true;
              else if (slaFilter === "4-a-24-horas" && diffHoras > 4 && diffHoras <= 24) slaMatch = true;
              else if (slaFilter === "mas-1-dia" && diffHoras > 24) slaMatch = true;
            }
          } else if (pendingFilter && !fechaPrimerContacto) {
            const now = Date.now();
            const diffMsPending = now - timestampRegistro;
            const diffHorasPending = diffMsPending / (1000 * 60 * 60);
            const horasValidas = diffHorasPending < 0 ? 0 : diffHorasPending;
            
            if (pendingFilter === "menos-24-horas" && horasValidas < 24) slaMatch = true;
            else if (pendingFilter === "1-a-3-dias" && horasValidas >= 24 && horasValidas <= 24 * 3) slaMatch = true;
            else if (pendingFilter === "mas-3-dias" && horasValidas > 24 * 3) slaMatch = true;
          }
        }
      }
    }

    return añoMatch && periodoMatch && searchMatch && slaMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Buscar en todo el lead..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm text-slate-900"
            />
          </div>
          
          <select name="año" defaultValue={currentYear} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900">
            <option value="Todos">Todos los Años</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>

          <select name="periodo" defaultValue={currentPeriod} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900">
            <option value="Todos">Todos los Periodos</option>
            <option value="Enero-Abril">Enero-Abril</option>
            <option value="Mayo-Agosto">Mayo-Agosto</option>
            <option value="Septiembre-Diciembre">Septiembre-Diciembre</option>
          </select>

          <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl shadow-sm hover:bg-slate-700 transition-colors">
            Filtrar
          </button>
        </form>

        {["Dirección", "Marketing", "Campus", "Asesor"].includes(role) && (
          <Link
            href="/leads/nuevo"
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-colors justify-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Lead
          </Link>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Prospecto</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold">Interés</th>
                <th className="px-6 py-4 font-semibold">Estatus</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{lead.prospecto}</div>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {lead.fecha}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <span className="flex items-center"><Phone className="w-3 h-3 mr-2" /> {lead.celular}</span>
                        <span className="flex items-center text-xs"><Mail className="w-3 h-3 mr-2" /> {lead.correo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">{lead.carrera}</div>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {lead.campusInteres}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${lead.statusLead === 'Nuevo lead' || !lead.statusLead ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                        ${lead.statusLead === 'En seguimiento' ? 'bg-orange-50 text-orange-700 border border-orange-200' : ''}
                        ${lead.statusLead === 'Inscrito' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                        ${lead.statusLead === 'Descartado' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                      `}>
                        {lead.statusLead || 'Nuevo lead'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lead.idLead ? (
                        <Link 
                          href={`/leads/${lead.idLead}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          Ver detalles
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium cursor-not-allowed" title="Este registro antiguo no tiene ID Lead asignado en Google Sheets.">
                          Falta ID
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Users className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-600">No se encontraron leads</p>
                      <p className="text-sm mt-1">No hay registros con ese nombre o con los filtros seleccionados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
