"use server";

import { googleSheets } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function updateInscritoAction(idInscrito: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const success = await googleSheets.updateInscrito(idInscrito, data);
    
    if (success) {
      revalidatePath('/inscritos');
      revalidatePath('/grupos');
      return { success: true };
    } else {
      return { success: false, error: "No se encontró el registro o hubo un error al actualizar" };
    }
  } catch (error: any) {
    console.error("Error en updateInscritoAction:", error);
    return { success: false, error: error.message };
  }
}
