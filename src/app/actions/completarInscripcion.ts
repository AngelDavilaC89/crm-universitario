"use server";

import { googleSheets } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function completarInscripcion(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "No autorizado" };

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
    statusColegiatura,
    inscritoPor: session.user?.email || ""
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
