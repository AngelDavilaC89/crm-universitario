import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { googleSheets } from "@/lib/google-sheets";

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

          // Nota: En un sistema real la contraseña debe estar encriptada en la base de datos.
          // Para este prototipo usando Google Sheets, asumo que usaremos una contraseña genérica
          // o que hay una columna 'Password' (no mencionada). 
          // Por simplicidad, aceptaremos '123' para todos los usuarios mientras tanto.
          // TODO: Agregar validación de contraseña real si se agrega columna 'Password' a 'Asesores'
          if (credentials.password !== "123") {
            return null;
          }

          return {
            id: user.correo, // Usamos el correo como ID único
            name: user.nombre,
            email: user.correo,
            role: user.rol,
            campus: user.campus
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.campus = token.campus as string;
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
