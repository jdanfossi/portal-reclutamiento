import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import Link from "next/link";
import { signOut } from "@/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Portal de Reclutamiento Clínica Avaria",
  description: "Buscamos a los mejores profesionales",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <img src="/logo.png" alt="Clínica Avaria" className="h-8 w-auto object-contain" />
                  <span className="text-sm font-medium text-slate-500 hidden sm:inline border-l pl-2 border-slate-300">Reclutamiento</span>
                </Link>
              </div>
               <div className="flex flex-1 justify-end items-center gap-4 sm:gap-6">
                 <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors hidden md:block">
                   Vacantes Disponibles
                 </Link>
                 {session ? (
                   <>
                     {(session.user as any)?.userRole === "candidato" ? (
                       <Link href="/candidato/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                         Mi Dashboard
                       </Link>
                     ) : (session.user as any)?.userRole === "admin" ? (
                       <Link href="/admin/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                         Panel Admin
                       </Link>
                     ) : null}
                     <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
                       {session.user?.name || session.user?.email}
                     </span>
                     <form
                       action={async () => {
                         "use server";
                         await signOut();
                       }}
                     >
                       <button type="submit" className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-2">
                         Cerrar Sesión
                       </button>
                     </form>
                   </>
                 ) : (
                   <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2">
                     Iniciar Sesión
                   </Link>
                 )}
              </div>
            </div>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
