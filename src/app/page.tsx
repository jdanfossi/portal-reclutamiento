import { db } from "@/db";
import { vacantes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const openVacancies = await db.select().from(vacantes).where(eq(vacantes.estado, "abierta")).orderBy(desc(vacantes.created_at));

  return (
    <main className="flex min-h-screen flex-col items-center py-24 px-6 bg-slate-50">
      <div className="max-w-4xl w-full text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
          Portal de Reclutamiento <span className="text-blue-600">Clínica Avaria</span>
        </h1>
        <p className="text-lg md:text-xl leading-8 text-slate-600">
          Únete al equipo de Clínica Avaria. Buscamos a los mejores profesionales para seguir entregando excelencia.
        </p>
      </div>

      <div className="w-full max-w-4xl max-w-4xl grid gap-6 md:grid-cols-2">
        {openVacancies.length > 0 ? (
          openVacancies.map((vacante) => (
            <div key={vacante.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{vacante.titulo}</h2>
              <p className="text-slate-600 mb-6 line-clamp-3">
                {vacante.descripcion || "Sin descripción detallada."}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Publicado: {new Date(vacante.created_at!).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                <Link href={`/vacantes/${vacante.id}`}>
                  <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">Ver Detalles</Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">No hay vacantes abiertas en este momento. ¡Vuelve pronto!</p>
          </div>
        )}
      </div>
    </main>
  );
}
