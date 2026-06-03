"use server";

import { googleSheets } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createLeadAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("No autenticado");

    const campusInteres = formData.get("campusInteres") as string;
    
    // Asignación automática de asesor por campus
    const asesores = await googleSheets.getAsesores();
    const asesoresCampus = asesores.filter(a => 
      a.campus === campusInteres && 
      a.rol === "Asesor" && 
      a.activo
    );
    
    // Si el usuario logueado es Asesor o Campus y está creando para su propio campus, el asesor es él.
    // De lo contrario, asignar al primero del campus (o se podría hacer round-robin futuro)
    let asesorAsignado = "";
    if (session.user.role === "Asesor" && session.user.campus === campusInteres) {
      asesorAsignado = session.user.email;
    } else {
      asesorAsignado = asesoresCampus.length > 0 ? asesoresCampus[0].correo : "";
    }

    const leadData = {
      prospecto: formData.get("prospecto"),
      celular: formData.get("celular"),
      correo: formData.get("correo"),
      campusInteres,
      carrera: formData.get("carrera"),
      modalidad: formData.get("modalidad"),
      turno: formData.get("turno"),
      periodoInteres: formData.get("periodoInteres"),
      año: formData.get("año"),
      medio: formData.get("medio"),
      comentario: formData.get("comentario"),
      asesor: asesorAsignado,
    };

    await googleSheets.addLead(leadData);
    
    // Refrescar la página de leads
    revalidatePath("/leads");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePreInscripcionAction(idLead: string, data: any) {
  try {
    const success = await googleSheets.updatePreInscripcion(idLead, data);
    if (success) {
      revalidatePath(`/leads/${idLead}`);
      revalidatePath("/leads");
      return { success: true };
    }
    return { success: false, error: "No se pudo actualizar" };
  } catch (error: any) {
    console.error("Error updating pre-inscripcion:", error);
    return { success: false, error: error.message };
  }
}
