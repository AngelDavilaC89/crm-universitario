"use server";

import { googleSheets } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createInscripcionAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("No autenticado");

    const idLead = formData.get("idLead") as string;
    
    // Obtener los datos del lead original para pasarlos a la tabla de inscritos
    const lead = await googleSheets.getLeadById(idLead);
    if (!lead) throw new Error("No se encontró el prospecto original");

    const folioPago = (formData.get("folioPago") as string || "").trim();
    const montoPapeleriaStr = formData.get("montoPagadoPapeleria") as string || "0";
    const montoPagadoPapeleria = parseFloat(montoPapeleriaStr);

    const montoInscripcionStr = formData.get("montoPagadoInscripcion") as string || "0";
    const montoPagadoInscripcion = parseFloat(montoInscripcionStr);
    
    const turno = formData.get("turno") as string || lead.turno || "Matutino";

    // Regla de Negocio: La inscripción solo debe contar para comisión si existe 
    // folio de pago de manejo de papelería y monto mayor a cero.
    const aplicaComision = (folioPago.length > 0 && montoPagadoPapeleria > 0) ? "SÍ" : "NO";

    const inscripcionData = {
      idLead: lead.idLead,
      prospecto: lead.prospecto,
      campus: lead.campusInteres,
      carrera: lead.carrera,
      modalidad: lead.modalidad,
      turno: turno,
      periodo: lead.periodoInteres,
      año: lead.año,
      asesor: lead.asesor,
      folioPago: folioPago,
      montoPagadoPapeleria: montoPagadoPapeleria,
      montoPagadoInscripcion: montoPagadoInscripcion,
      aplicaComision: aplicaComision
    };

    await googleSheets.addInscrito(inscripcionData);
    
    // Refrescar las rutas involucradas
    revalidatePath(`/leads/${idLead}`);
    revalidatePath("/leads");
    revalidatePath("/inscritos");
    revalidatePath("/grupos");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error creating inscripcion:", error);
    return { success: false, error: error.message };
  }
}
