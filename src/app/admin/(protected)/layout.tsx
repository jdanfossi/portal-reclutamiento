import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any)?.userRole !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-800 bg-slate-100">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-white font-bold text-xl tracking-tight">Admin Panel</h1>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1">
            <li>
               <Link className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors duration-200" href="/admin/vacantes">
                 <span className="font-medium text-sm text-blue-400">Vacantes</span>
               </Link>
            </li>
            <li>
               <Link className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors duration-200" href="/admin/candidatos">
                 <span className="font-medium text-sm">Candidatos</span>
               </Link>
            </li>
            <li>
               <Link className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors duration-200" href="/admin/asistente">
                 <span className="font-medium text-sm text-purple-400">✨ Asistente IA</span>
               </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#9eb4c9] to-[#67829a] overflow-y-auto relative">
        <div className="px-4 md:px-8 pb-12 pt-12 w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
