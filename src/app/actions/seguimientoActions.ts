"use server";

import { googleSheets } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createSeguimientoAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("No autenticado");

    const idLead = formData.get("idLead") as string;
    
    const seguimientoData = {
      idLead,
      tipoContacto: formData.get("tipoContacto"),
      comentario: formData.get("comentario"),
      resultado: formData.get("resultado"),
      proximaAccion: formData.get("proximaAccion"),
      fechaProxima: formData.get("fechaProxima"),
      nuevoEstatus: formData.get("nuevoEstatus"),
      asesor: session.user.email,
    };

    const idSeguimiento = await googleSheets.addSeguimiento(seguimientoData);
    
    // Refrescar las rutas involucradas
    revalidatePath(`/leads/${idLead}`);
    revalidatePath("/leads");
    
    return { success: true, idSeguimiento };
  } catch (error: any) {
    console.error("Error creating seguimiento:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSeguimientoAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("No autenticado");

    const idSeguimiento = formData.get("idSeguimiento") as string;
    const idLead = formData.get("idLead") as string;
    
    if (!idSeguimiento || !idLead) throw new Error("Faltan datos de identificación");

    const data = {
      tipoContacto: formData.get("tipoContacto") as string,
      comentario: formData.get("comentario") as string,
      resultado: formData.get("resultado") as string,
      proximaAccion: formData.get("proximaAccion") as string,
      fechaProxima: formData.get("fechaProxima") as string,
    };

    const updated = await googleSheets.updateSeguimiento(idSeguimiento, data);
    if (!updated) throw new Error("No se pudo actualizar el registro en Google Sheets");

    revalidatePath(`/leads/${idLead}`);
    revalidatePath(`/seguimientos`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating seguimiento:", error);
    return { success: false, error: error.message };
  }
}
