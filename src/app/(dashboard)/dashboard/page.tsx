import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardPendingCharts } from "@/components/dashboard/DashboardPendingCharts";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { parseSeguimientoDate } from "@/lib/date-utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  
  // Obtener datos
  const [allLeads, seguimientos] = await Promise.all([
    googleSheets.getLeads(),
    googleSheets.getAllSeguimientos()
  ]);

  // 1. Filtrar los leads base según los permisos del usuario y filtros URL
  const userCampus = session?.user?.campus;
  let leads = allLeads;
  
  if (userCampus && userCampus !== "Todos") {
    // Si NO es administrador global ("Todos"), solo puede ver los leads de su campus
    leads = leads.filter(l => l.campusInteres === userCampus);
  } else if (params.campus) {
    // Es administrador global y seleccionó un campus en el filtro
    leads = leads.filter(l => l.campusInteres === params.campus);
  }

  // Filtros de Año y Periodo (aplicables para TODOS los roles)
  if (params.year) leads = leads.filter(l => String(l.año) === String(params.year));
  if (params.period) leads = leads.filter(l => String(l.periodoInteres) === String(params.period));

  // 2. Extraer opciones únicas para los filtros (basado en TODOS los leads, no los filtrados, para que los selects siempre tengan opciones)
  // Opcional: Extraer opciones del allLeads o leads. Como es "Todos", lo extraemos del allLeads
  const uniqueCampuses = Array.from(new Set(allLeads.map(l => l.campusInteres).filter(Boolean))) as string[];
  const uniqueYears = Array.from(new Set(allLeads.map(l => String(l.año)).filter(Boolean))) as string[];
  const uniquePeriods = Array.from(new Set(allLeads.map(l => String(l.periodoInteres)).filter(Boolean))) as string[];

  // Agrupar seguimientos por Lead (encontrar el más antiguo)
  const primerSeguimientoPorLead = new Map<string, Date>();
  
  // Como `getAllSeguimientos` hace un `.reverse()`, los más recientes están al principio.
  // Iteramos de atrás para adelante (o simplemente comparamos fechas) para encontrar el primero.
  seguimientos.forEach(seg => {
    if (!seg.idLead || !seg.fecha) return;
    const fechaSeg = parseSeguimientoDate(seg.fecha);
    if (!fechaSeg) return;

    const existente = primerSeguimientoPorLead.get(seg.idLead);
    if (!existente || fechaSeg < existente) {
      primerSeguimientoPorLead.set(seg.idLead, fechaSeg);
    }
  });

  let totalHoras = 0;
  let conteo = 0;
  
  let menosDe1Hora = 0; // < 1 h
  let de1A4Horas = 0;   // 1 - 4 h
  let de4A24Horas = 0;  // 4 - 24 h
  let masDe1Dia = 0;    // > 24 h

  // Contadores para "Sin Seguimiento"
  let pendientesTotal = 0;
  let pendientesMenos24h = 0;
  let pendientes1a3Dias = 0;
  let pendientesMas3Dias = 0;

  const now = Date.now();

  leads.forEach(lead => {
    if (!lead.idLead) return;
    
    // El ID tiene el formato L-1717381234567
    let timestampRegistro = NaN;
    const parts = lead.idLead.split('-');
    if (parts.length === 2) {
      timestampRegistro = parseInt(parts[1]);
    }
    
    // Fallback retroactivo: Si no hay timestamp válido en el ID (leads viejos), usar la columna 'fecha'
    if (isNaN(timestampRegistro) || timestampRegistro < 1000000000) {
      if (lead.fecha) {
        const dParts = lead.fecha.split('/');
        if (dParts.length === 3) {
          // Asumimos las 09:00 AM del día de registro por defecto
          const fallbackDate = new Date(parseInt(dParts[2]), parseInt(dParts[1]) - 1, parseInt(dParts[0]), 9, 0, 0);
          timestampRegistro = fallbackDate.getTime();
        }
      }
    }

    if (isNaN(timestampRegistro)) return;

    const fechaPrimerContacto = primerSeguimientoPorLead.get(lead.idLead);
    
    // Si NO ha sido contactado, es un prospecto Pendiente
    if (!fechaPrimerContacto) {
      pendientesTotal++;
      const diffMsPending = now - timestampRegistro;
      const diffHorasPending = diffMsPending / (1000 * 60 * 60);
      
      // Puede ser negativo si registraron manual con fecha a futuro, asumimos 0
      const horasValidas = diffHorasPending < 0 ? 0 : diffHorasPending;
      
      if (horasValidas < 24) {
        pendientesMenos24h++;
      } else if (horasValidas <= 24 * 3) {
        pendientes1a3Dias++;
      } else {
        pendientesMas3Dias++;
      }
      return; 
    }

    // SI ha sido contactado, calculamos SLA
    const diffMs = fechaPrimerContacto.getTime() - timestampRegistro;
    
    // Usar valor absoluto en caso de que un asesor haya registrado el seguimiento
    // manualmente con una fecha u hora anterior a la de creación del lead.
    const diffHoras = Math.abs(diffMs) / (1000 * 60 * 60);
    
    // Ignorar datos atípicos mayores a 30 días para no corromper la gráfica ni el promedio
    if (diffHoras > 24 * 30) return;

    totalHoras += diffHoras;
    conteo++;

    if (diffHoras <= 1) {
      menosDe1Hora++;
    } else if (diffHoras <= 4) {
      de1A4Horas++;
    } else if (diffHoras <= 24) {
      de4A24Horas++;
    } else {
      masDe1Dia++;
    }
  });

  const averageHours = conteo > 0 ? totalHoras / conteo : 0;

  const chartData = [
    { name: "< 1 hora", count: menosDe1Hora, color: "#22c55e" }, // green-500
    { name: "1 a 4 horas", count: de1A4Horas, color: "#eab308" }, // yellow-500
    { name: "4 a 24 horas", count: de4A24Horas, color: "#f97316" }, // orange-500
    { name: "> 1 día", count: masDe1Dia, color: "#ef4444" }, // red-500
  ];

  const pendingChartData = [
    { name: "< 24 horas", count: pendientesMenos24h, color: "#eab308" }, // yellow-500
    { name: "1 a 3 días", count: pendientes1a3Dias, color: "#f97316" }, // orange-500
    { name: "> 3 días", count: pendientesMas3Dias, color: "#ef4444" }, // red-500
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <p className="text-slate-600 text-lg mb-6">
            Bienvenido al Panel Operativo, <strong className="text-slate-800">{session?.user?.name}</strong>.
          </p>

          {/* Mostrar filtros. El filtro de campus solo se muestra si tiene permiso "Todos" */}
          <DashboardFilters 
            campuses={uniqueCampuses} 
            years={uniqueYears} 
            periods={uniquePeriods} 
            showCampus={userCampus === "Todos"}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-1">Rol Actual</p>
              <p className="text-2xl font-bold text-slate-800">{session?.user?.role}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-1">Campus Asignado</p>
              <p className="text-2xl font-bold text-slate-800">{session?.user?.campus}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <DashboardCharts data={chartData} averageHours={averageHours} />
        <DashboardPendingCharts data={pendingChartData} totalPending={pendientesTotal} />
      </div>
    </div>
  );
}
