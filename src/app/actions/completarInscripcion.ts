"use server";

import { googleSheets } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

export async function completarInscripcion(formData: FormData) {
  const idLead = formData.get("idLead") as string;
  const folioColegiatura = formData.get("folioColegiatura") as string;
  const montoColegiatura = formData.get("montoColegiatura") as string;
  const statusColegiatura = formData.get("statusColegiatura") as string;

  if (!idLead || !folioColegiatura || !montoColegiatura || !statusColegiatura) {
    return { success: false, error: "Faltan campos obligatorios" };
  }

  const exito = await googleSheets.completarInscripcionLead(idLead, {
    folioColegiatura,
    montoColegiatura,
    statusColegiatura
  });

  if (exito) {
    // Forzar la actualización del dashboard y los grupos
    revalidatePath("/grupos");
    revalidatePath("/dashboard");
    revalidatePath(`/leads/${idLead}`);
    return { success: true };
  } else {
    return { success: false, error: "No se pudo actualizar el lead en Google Sheets" };
  }
}
