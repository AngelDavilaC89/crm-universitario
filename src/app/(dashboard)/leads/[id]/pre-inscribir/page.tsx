import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Settings, User } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server action directly in the file
async function handlePreInscribir(formData: FormData) {
  "use server";
  
  const idLead = formData.get("idLead") as string;
  const folioPapeleria = formData.get("folioPapeleria") as string;
  const montoPapeleria = formData.get("montoPapeleria") as string;
  const carreraAsignada = formData.get("carreraAsignada") as string;
  const turnoAsignado = formData.get("turnoAsignado") as string;

  const session = await getServerSession(authOptions);
  if (!session) return;

  const exito = await googleSheets.preInscribirLead(idLead, {
    folioPapeleria,
    montoPapeleria,
    carreraAsignada,
    turnoAsignado,
    inscritoPor: session.user?.email || ""
  });

  if (exito) {
    revalidatePath(`/leads/${idLead}`);
    revalidatePath(`/leads`);
    revalidatePath(`/grupos`);
    redirect(`/leads/${idLead}`);
  }
}

export default async function PreInscribirPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const resolvedParams = await params;
  const idLead = resolvedParams.id;

  const [lead, carreras, turnos] = await Promise.all([
    googleSheets.getLeadById(idLead),
    googleSheets.getCarreras(),
    googleSheets.getTurnos()
  ]);

  if (!lead) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/leads/${idLead}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver al perfil
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-blue-200" />
            Pre-inscribir Prospecto
          </h1>
          <p className="text-blue-100 mt-2">
            Paso 1: Completa el pago de papelería y asigna el lugar definitivo para el alumno <strong className="text-white">{lead.prospecto}</strong>.
          </p>
        </div>

        <form action={handlePreInscribir} className="p-8 space-y-8">
          <input type="hidden" name="idLead" value={idLead} />
          
          {/* Sección Financiera */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              1. Manejo de Papelería
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Folio de Pago Papelería *</label>
                <input 
                  required
                  type="text" 
                  name="folioPapeleria"
                  placeholder="Ej. FOL-00129"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto Pagado *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    required
                    type="number" 
                    name="montoPapeleria"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Sección Académica */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              2. Asignación Definitiva
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carrera Asignada *</label>
                <select 
                  required
                  name="carreraAsignada"
                  defaultValue={lead.carrera}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 appearance-none"
                >
                  <option value="" disabled>Selecciona una carrera</option>
                  {carreras.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Turno Asignado *</label>
                <select 
                  required
                  name="turnoAsignado"
                  defaultValue={lead.turno}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 appearance-none"
                >
                  <option value="" disabled>Selecciona un turno</option>
                  {turnos.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Estos valores formarán los Grupos automáticamente. Si cambian respecto a lo que el prospecto quería originalmente, estos nuevos valores tendrán prioridad.
            </p>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Guardar y Pre-inscribir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
