import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper para parsear la fecha de seguimiento "DD/MM/YYYY HH:MM:SS" o "DD/MM/YYYY HH:MM:SS a.m."
function parseSeguimientoDate(dateStr: string) {
  if (!dateStr) return null;
  
  const normalized = dateStr.trim().toUpperCase();
  const parts = normalized.split(/\s+/); // Puede ser ["1/6/2026", "11:22:32", "P.M."]
  if (parts.length < 2) return null;
  
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  
  if (dateParts.length !== 3 || timeParts.length < 2) return null;
  
  let hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
  
  // Ajuste por A.M. / P.M.
  if (parts.length > 2) {
    const ampm = parts[2];
    if (ampm.includes('P') && hours < 12) {
      hours += 12;
    } else if (ampm.includes('A') && hours === 12) {
      hours = 0;
    }
  }
  
  return new Date(
    parseInt(dateParts[2]), // Año
    parseInt(dateParts[1]) - 1, // Mes (0-11)
    parseInt(dateParts[0]), // Día
    hours,
    minutes,
    seconds
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  
  // Obtener datos
  const [allLeads, seguimientos] = await Promise.all([
    googleSheets.getLeads(),
    googleSheets.getAllSeguimientos()
  ]);

  // 1. Filtrar los leads base según los permisos del usuario
  const userCampus = session?.user?.campus;
  let leads = allLeads;
  
  if (userCampus && userCampus !== "Todos") {
    // Si NO es administrador global ("Todos"), solo puede ver los leads de su campus
    leads = leads.filter(l => l.campusInteres === userCampus);
  } else {
    // Es administrador global ("Todos"), aplicamos los filtros de la URL (DashboardFilters)
    if (params.campus) leads = leads.filter(l => l.campusInteres === params.campus);
    if (params.year) leads = leads.filter(l => String(l.año) === String(params.year));
    if (params.period) leads = leads.filter(l => String(l.periodoInteres) === String(params.period));
  }

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
    if (!fechaPrimerContacto) return; // Aún no ha sido contactado

    const diffMs = fechaPrimerContacto.getTime() - timestampRegistro;
    
    // Usar valor absoluto en caso de que un asesor haya registrado el seguimiento
    // manualmente con una fecha u hora anterior a la de creación del lead.
    const diffHoras = Math.abs(diffMs) / (1000 * 60 * 60);
    
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

  return (
    <div className="space-y-6">
      <div className="max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <p className="text-slate-600 text-lg mb-6">
            Bienvenido al Panel Operativo, <strong className="text-slate-800">{session?.user?.name}</strong>.
          </p>

          {/* Mostrar filtros solo si tiene permiso "Todos" */}
          {userCampus === "Todos" && (
            <DashboardFilters 
              campuses={uniqueCampuses} 
              years={uniqueYears} 
              periods={uniquePeriods} 
            />
          )}
          
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

      <div className="max-w-4xl">
        <DashboardCharts data={chartData} averageHours={averageHours} />
      </div>
    </div>
  );
}
