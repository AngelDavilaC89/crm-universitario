"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/app/actions/authActions";
import { Check, X, Loader2, Eye, EyeOff } from "lucide-react";
import { signOut } from "next-auth/react";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[\W_]/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const allValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;

    setLoading(true);
    setError(null);

    const res = await updatePasswordAction(password);
    
    if (!res.success) {
      setError(res.error || "Ocurrió un error.");
      setLoading(false);
      return;
    }

    // Como cambiamos el flag en la DB, necesitamos recargar la sesión.
    // La forma más limpia es desloguear y mandar al login con mensaje.
    await signOut({ redirect: false });
    router.push("/login?message=Contraseña actualizada. Inicia sesión nuevamente.");
  };

  return (
    <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">Políticas de Seguridad</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            {validations.length ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-slate-300" />}
            Mínimo 8 caracteres
          </li>
          <li className="flex items-center gap-2">
            {validations.upper ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-slate-300" />}
            Al menos una mayúscula (A-Z)
          </li>
          <li className="flex items-center gap-2">
            {validations.number ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-slate-300" />}
            Al menos un número (0-9)
          </li>
          <li className="flex items-center gap-2">
            {validations.special ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-slate-300" />}
            Al menos un carácter especial (@, $, !, %, *, ?, &)
          </li>
          <li className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
            {validations.match ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-slate-300" />}
            <span className={validations.match ? "text-slate-800 font-medium" : ""}>Las contraseñas coinciden</span>
          </li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={!allValid || loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Contraseña y Continuar"}
      </button>
    </form>
  );
}
