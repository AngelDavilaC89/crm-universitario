"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { googleSheets } from "@/lib/google-sheets";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updatePasswordAction(password: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    // Validar políticas en el servidor
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[\W_]/.test(password);

    if (!minLength || !hasUpper || !hasNumber || !hasSpecial) {
      return { success: false, error: "La contraseña no cumple con las políticas de seguridad." };
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Guardar en Google Sheets
    const success = await googleSheets.updateAsesorPassword(session.user.email, hashedPassword);

    if (!success) {
      return { success: false, error: "No se pudo actualizar la contraseña en la base de datos." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar la contraseña:", error);
    return { success: false, error: error.message || "Error interno del servidor" };
  }
}
