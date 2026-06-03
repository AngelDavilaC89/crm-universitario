import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { googleSheets } from "@/lib/google-sheets";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Correo Electrónico",
      credentials: {
        email: { label: "Correo", type: "email", placeholder: "tu-correo@universidad.edu" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Obtener todos los asesores (usuarios)
          const asesores = await googleSheets.getAsesores();
          console.log("Total asesores encontrados:", asesores.length);
          if (asesores.length > 0) {
            console.log("Primer asesor de muestra:", JSON.stringify(asesores[0]));
          }
          
          // Buscar si el correo existe y está activo
          const user = asesores.find(
            a => a.correo && a.correo.trim().toLowerCase() === credentials.email.trim().toLowerCase()
          );

          console.log("Usuario encontrado:", user);

          if (!user || !user.activo) {
            console.log("Usuario no encontrado o inactivo:", credentials.email);
            return null;
          }

          let needsPasswordChange = false;

          // Verificar la contraseña
          if (!user.password || user.password.trim() === "") {
            // No tiene contraseña guardada, dejamos pasar si ingresa "123" pero lo marcamos para que la cambie
            if (credentials.password !== "123") {
              return null;
            }
            needsPasswordChange = true;
          } else {
            // Sí tiene contraseña, usar bcrypt para comparar
            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (!isValid) {
              return null;
            }
          }

          // Si llegamos hasta aquí, el login fue exitoso (o al menos autorizado para entrar/cambiar contraseña).
          // Guardamos la fecha y hora de acceso en Google Sheets de forma asíncrona.
          // No necesitamos hacer "await" obligatorio para no retrasar el login, 
          // pero Next.js / Serverless podría matarlo, así que lo esperamos, no tarda mucho.
          await googleSheets.updateLastAccess(user.correo).catch(e => console.error("Error guardando acceso", e));

          return {
            id: user.correo, // Usamos el correo como ID único
            name: user.nombre,
            email: user.correo,
            role: user.rol,
            campus: user.campus,
            needsPasswordChange
          };

        } catch (error) {
          console.error("Error al autenticar:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.campus = user.campus;
        token.needsPasswordChange = user.needsPasswordChange;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.campus = token.campus as string;
        session.user.needsPasswordChange = token.needsPasswordChange as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  }
};
