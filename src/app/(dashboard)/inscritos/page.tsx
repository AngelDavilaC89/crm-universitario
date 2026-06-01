import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { GraduationCap, MapPin, BookOpen, CheckCircle, XCircle, Search } from "lucide-react";
import { EditInscritoModal } from "@/components/inscritos/EditInscritoModal";

export default async function InscritosPage({
  searchParams,
}: {
  searchParams: Promise<{ año?: string; periodo?: string; campus?: string; q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role;
  const userCampus = session.user.campus;

  const resolvedParams = await searchParams;
  const filterYear = resolvedParams.año || "Todos";
  const filterPeriod = resolvedParams.periodo || "Todos";
  const filterCampus = resolvedParams.campus || (role === "Campus" ? userCampus : "Todos");
  const searchQuery = resolvedParams.q?.toLowerCase() || "";

  // Obtener inscritos
  const todosInscritos = await googleSheets.getInscritos();
  const campusOptions = await googleSheets.getCampus();
  const carrerasOptions = await googleSheets.getCarreras();
  const modalidadesOptions = await googleSheets.getModalidades();

  // Filtrar
  const inscritos = todosInscritos.filter(inscrito => {
    // Si el usuario es de un Campus específico, obligar el filtro a su campus
    if (role === "Campus" && inscrito.campus !== userCampus) return false;
    
    // Si el Asesor entra a esta página, idealmente solo vería sus inscritos, 
    // pero si es tabla general de Campus, la regla podría variar. Por seguridad:
    if (role === "Asesor" && inscrito.asesor !== session.user.email) return false;

    // Filtros de UI
    const yearMatch = filterYear === "Todos" || inscrito.año === filterYear;
    const periodMatch = filterPeriod === "Todos" || inscrito.periodo === filterPeriod;
    const campusMatch = filterCampus === "Todos" || inscrito.campus === filterCampus;

    // Búsqueda profunda
    let searchMatch = true;
    if (searchQuery) {
      const valores = Object.values(inscrito).map(v => String(v).toLowerCase());
      searchMatch = valores.some(v => v.includes(searchQuery));
    }

    return yearMatch && periodMatch && campusMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alumnos Inscritos</h1>
          <p className="text-slate-500 mt-1">
            Listado oficial de inscripciones. Las comisiones dependen de que el pago sea mayor a cero y tenga folio.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Buscar en inscritos..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm text-slate-900"
            />
          </div>
          {(role === "Dirección" || role === "Marketing") && (
            <select name="campus" defaultValue={filterCampus} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm text-slate-900 outline-none focus:ring-2 focus:ring-green-500">
              <option value="Todos">Todos los Campus</option>
              {campusOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          )}

          <select name="año" defaultValue={filterYear} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm text-slate-900 outline-none focus:ring-2 focus:ring-green-500">
            <option value="Todos">Todos los Años</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>

          <select name="periodo" defaultValue={filterPeriod} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm text-slate-900 outline-none focus:ring-2 focus:ring-green-500">
            <option value="Todos">Todos los Periodos</option>
            <option value="Enero-Abril">Enero-Abril</option>
            <option value="Mayo-Agosto">Mayo-Agosto</option>
            <option value="Septiembre-Diciembre">Septiembre-Diciembre</option>
          </select>

          <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl shadow-sm hover:bg-slate-700 transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {/* Tabla de Inscritos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Alumno</th>
                <th className="px-6 py-4">Carrera y Modalidad</th>
                <th className="px-6 py-4">Campus</th>
                <th className="px-6 py-4">Asignación</th>
                <th className="px-6 py-4">Pago y Comisión</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inscritos.length > 0 ? (
                inscritos.map((inscrito, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{inscrito.prospecto}</div>
                      <div className="text-xs text-slate-400 mt-1">ID: {inscrito.idInscrito}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Inscrito el {inscrito.fechaInscripcion}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-700 font-medium mb-1">
                        <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                        {inscrito.carrera}
                      </div>
                      <div className="text-xs text-slate-500 ml-6">
                        {inscrito.modalidad} • {inscrito.turno}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-700">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        {inscrito.campus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800">{inscrito.asesor}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {inscrito.periodo} {inscrito.año}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Papelería:</span>
                          <span className="font-medium text-slate-700">${inscrito.montoPagadoPapeleria || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Inscripción:</span>
                          <span className="font-medium text-slate-700">${inscrito.montoPagadoInscripcion || "0"}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 pl-1">Folio: {inscrito.folioPago || "N/A"}</div>
                      </div>
                      
                      {inscrito.aplicaComision === "SÍ" ? (
                        <div className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-200 mt-1">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Aplica Comisión
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md border border-red-200 mt-1">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Sin Comisión
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <EditInscritoModal 
                        inscrito={inscrito} 
                        campusOptions={campusOptions}
                        carrerasOptions={carrerasOptions}
                        modalidadesOptions={modalidadesOptions}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <GraduationCap className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-600">No hay alumnos inscritos</p>
                      <p className="text-sm mt-1">No se encontraron registros con los filtros seleccionados.</p>
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
