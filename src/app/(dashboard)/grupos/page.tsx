import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import { Users } from "lucide-react";
import { GrupoCard } from "@/components/grupos/GrupoCard";

export default async function GruposPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role;
  const campus = session.user.campus;

  // Obtener inscritos
  const inscritos = await googleSheets.getInscritos();

  // Filtrar por campus si es "Campus" o "Asesor"
  const inscritosFiltrados = (role === "Campus" || role === "Asesor") 
    ? inscritos.filter(i => i.campus === campus)
    : inscritos;

  // Agrupar por la llave única: Campus + Año + Periodo + Carrera + Modalidad + Turno
  const gruposMap = new Map<string, any>();

  inscritosFiltrados.forEach(inscrito => {
    // Si falta algún dato, usamos "?" para no ocultar al alumno y que el usuario sepa que le falta información
    const año = inscrito.año || "Año ?";
    const periodo = inscrito.periodo || "Periodo ?";
    const carrera = inscrito.carrera || "Carrera ?";
    const turno = inscrito.turno || "Turno ?";
    const modalidad = inscrito.modalidad || "Modalidad ?";
    const campusStr = inscrito.campus || "Campus ?";

    const llaveGrupo = `${campusStr}|${año}|${periodo}|${carrera}|${modalidad}|${turno}`;
    
    if (!gruposMap.has(llaveGrupo)) {
      gruposMap.set(llaveGrupo, {
        campus: campusStr,
        año: año,
        periodo: periodo,
        carrera: carrera,
        modalidad: modalidad,
        turno: turno,
        inscritos: [],
      });
    }

    gruposMap.get(llaveGrupo).inscritos.push(inscrito);
  });

  const grupos = Array.from(gruposMap.values());

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Apertura de Grupos</h1>
        <p className="text-slate-500 mt-1">
          Un grupo se apertura automáticamente al alcanzar <span className="font-bold text-slate-700">8 alumnos inscritos</span> que coincidan en Campus, Año, Periodo, Carrera, Modalidad y Turno.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grupos.length > 0 ? (
          grupos.map((grupo, idx) => (
            <GrupoCard key={idx} grupo={grupo} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-slate-600">No hay grupos en formación para tu campus</p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Para que aparezca un grupo aquí, debes inscribir al menos a un alumno asegurándote de llenar todos sus datos: <b>Campus, Año, Periodo, Carrera, Modalidad y Turno</b>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
