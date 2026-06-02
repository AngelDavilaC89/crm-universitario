"use server";

import { googleSheets } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

export async function registrarLlamadaCalidadAction(formData: FormData) {
  const idLead = formData.get("idLead") as string;
  const decision = formData.get("decision") as string;
  const motivo = formData.get("motivo") as string || "";

  if (!idLead || !decision) {
    return { success: false, error: "Faltan campos obligatorios" };
  }

  const exito = await googleSheets.registrarLlamadaCalidad(idLead, {
    decision,
    motivo
  });

  if (exito) {
    revalidatePath("/grupos");
    revalidatePath("/bajas");
    revalidatePath("/dashboard");
    revalidatePath(`/leads/${idLead}`);
    return { success: true };
  } else {
    return { success: false, error: "No se pudo actualizar el lead en Google Sheets" };
  }
}
