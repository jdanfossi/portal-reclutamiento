import { db } from "@/db";
import { vacantes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VacancyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  
  const vacanteArr = await db.select().from(vacantes).where(eq(vacantes.id, resolvedParams.id)).limit(1);
  const vacante = vacanteArr[0];

  if (!vacante) {
    notFound();
  }

  // Si está cerrada, podríamos igual mostrarla pero sin botón de postular. 
  // O solo mostrar "Postular" si está "abierta".
  const isOpen = vacante.estado === "abierta";

  return (
    <main className="flex min-h-screen flex-col items-center py-24 px-6 bg-slate-50">
      <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Volver al listado</Link>
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mb-4 ${isOpen ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
          {vacante.estado?.toUpperCase() || ''}
        </span>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-8">{vacante.titulo}</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Descripción del Cargo</h2>
            <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
              {vacante.descripcion || "Aún no hay descripción disponible para este cargo."}
            </div>
          </div>

          {vacante.requisitos && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Requisitos</h2>
              <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                {vacante.requisitos}
              </div>
            </div>
          )}

          {vacante.horarios && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Horarios</h2>
              <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                {vacante.horarios}
              </div>
            </div>
          )}

          {vacante.beneficios && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Beneficios</h2>
              <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                {vacante.beneficios}
              </div>
            </div>
          )}

          {vacante.remuneracion && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Remuneración</h2>
              <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                {vacante.remuneracion}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-slate-200 mt-8 text-center flex justify-center">
            {isOpen ? (
               <Link href={`/candidato/postular/${vacante.id}`}>
                 <Button size="lg" className="px-12 py-6 text-lg bg-blue-600 hover:bg-blue-700">
                   Postular a este cargo
                 </Button>
               </Link>
            ) : (
               <div className="p-4 bg-slate-100 rounded-lg text-slate-600 font-medium">
                 El proceso de postulación para esta vacante ya se encuentra cerrado o pausado.
               </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
