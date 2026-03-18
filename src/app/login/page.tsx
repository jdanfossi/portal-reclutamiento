"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        if (res.error.toLowerCase().includes("unverified")) {
          setError("Tu cuenta no está verificada. Revisa tu correo y haz clic en el enlace de activación.");
        } else {
          setError("Credenciales inválidas o cuenta no verificada. Inténtalo de nuevo.");
        }
      } else {
        window.location.href = "/candidato/dashboard";
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Usa tu cuenta para acceder a tu portal.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleCredentialsLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email (Candidato)</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

            <div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Entrar como Candidato
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">¿No tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "/registro"}
              >
                Crear cuenta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
