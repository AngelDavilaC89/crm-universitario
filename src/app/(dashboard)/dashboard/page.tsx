import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

// Helper para parsear la fecha de seguimiento "DD/MM/YYYY HH:MM:SS" a Date
function parseSeguimientoDate(dateStr: string) {
  if (!dateStr) return null;
  const parts = dateStr.split(' ');
  if (parts.length !== 2) return null;
  
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  
  if (dateParts.length !== 3 || timeParts.length < 2) return null;
  
  return new Date(
    parseInt(dateParts[2]), // Año
    parseInt(dateParts[1]) - 1, // Mes (0-11)
    parseInt(dateParts[0]), // Día
    parseInt(timeParts[0]), // Hora
    parseInt(timeParts[1]), // Minuto
    timeParts[2] ? parseInt(timeParts[2]) : 0 // Segundo
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Obtener datos
  const [leads, seguimientos] = await Promise.all([
    googleSheets.getLeads(),
    googleSheets.getAllSeguimientos()
  ]);

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
    
    // Ignorar si la diferencia es negativa (error en fechas o datos manuales viejos)
    if (diffMs < 0) return;

    const diffHoras = diffMs / (1000 * 60 * 60);
    
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
          <p className="text-slate-600 text-lg">
            Bienvenido al Panel Operativo, <strong className="text-slate-800">{session?.user?.name}</strong>.
          </p>
          
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
