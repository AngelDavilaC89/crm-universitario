import { googleSheets } from "@/lib/google-sheets";
import { NewLeadForm } from "@/components/leads/NewLeadForm";

export default async function NuevoLeadPage() {
  // Cargar catálogos para los selectores del formulario
  const [campus, carreras, modalidades, medios] = await Promise.all([
    googleSheets.getCampus(),
    googleSheets.getCarreras(),
    googleSheets.getModalidades(),
    googleSheets.getMedios()
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Registrar Nuevo Lead</h1>
        <p className="text-slate-500 mt-1">
          El asesor correspondiente será asignado automáticamente basado en el Campus seleccionado.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <NewLeadForm 
          campus={campus} 
          carreras={carreras} 
          modalidades={modalidades} 
          medios={medios} 
        />
      </div>
    </div>
  );
}
