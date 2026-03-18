import { db } from "@/db";
import { candidatos } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token as string | undefined;

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Enlace Inválido</h1>
          <p className="text-slate-600 mb-6">No se proporcionó ningún token de verificación o el enlace está corrupto.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium text-sm inline-block">
            Ir al Login
          </Link>
        </div>
      </main>
    );
  }

  // Find user by token
  const result = await db.select().from(candidatos).where(eq(candidatos.verification_token, token)).limit(1);

  if (result.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Verificación Fallida</h1>
          <p className="text-slate-600 mb-6">Este enlace de verificación es inválido o no existe en nuestros registros.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium text-sm inline-block">
            Ir al Login
          </Link>
        </div>
      </main>
    );
  }

  const user = result[0];

  // Si ya estaba verificado
  if (user.email_verified === 1) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Cuenta ya verificada</h1>
          <p className="text-slate-600 mb-6">Tu correo electrónico ya había sido validado anteriormente.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium text-sm inline-block">
            Iniciar Sesión
          </Link>
        </div>
      </main>
    );
  }

  // Validar cuenta
  await db.update(candidatos)
    .set({ email_verified: 1 })
    .where(eq(candidatos.id, user.id));

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">¡Verificación Exitosa!</h1>
        <p className="text-slate-600 mb-6">Tu correo <strong>{user.email}</strong> ha sido verificado. Ya puedes iniciar sesión y comenzar a postular a nuestras vacantes.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors shadow-sm inline-block">
          Ir al Login
        </Link>
      </div>
    </main>
  );
}
