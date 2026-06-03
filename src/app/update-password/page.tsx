import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default async function UpdatePasswordPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Si ya tiene una contraseña y no requiere cambiarla, mandarlo al dashboard
  if (!session.user?.needsPasswordChange) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Crea tu Contraseña</h2>
          <p className="mt-2 text-sm text-slate-500">
            Por seguridad, debes establecer una contraseña única antes de continuar al panel operativo.
          </p>
        </div>

        <UpdatePasswordForm />
      </div>
    </div>
  );
}
