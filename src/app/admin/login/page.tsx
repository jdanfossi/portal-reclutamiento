"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Acceso Administradores
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Usa tu cuenta de Google para acceder al portal de staff.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/admin/vacantes" })}
            variant="outline" 
            className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
            Entrar con Google
          </Button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">¿Eres candidato?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Ir al portal de candidatos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
