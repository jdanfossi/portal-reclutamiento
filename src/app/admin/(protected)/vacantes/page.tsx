import { db } from "@/db";
import { vacantes, postulaciones } from "@/db/schema";
import { desc } from "drizzle-orm";
import VacantesTable from "./VacantesTable";

export default async function VacantesAdminPage() {
  const allVacantes = await db.select().from(vacantes).orderBy(desc(vacantes.created_at));
  
  // Fetch counts efficiently
  const allPostData = await db.select({ 
    vacante_id: postulaciones.vacante_id, 
    estado: postulaciones.estado_postulacion 
  }).from(postulaciones);

  const vacantesConMetricas = allVacantes.map((v) => {
     const posts = allPostData.filter((p) => p.vacante_id === v.id);
     return {
       ...v,
       totalPostulantes: posts.length,
       nuevosPostulantes: posts.filter((p) => p.estado === "pendiente").length
     };
  });

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Vacantes</h1>
          <a href="/admin/vacantes/nueva" className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800">
            Nueva Vacante
          </a>
        </div>

        <VacantesTable initialVacantes={vacantesConMetricas} />
      </div>
    </>
  );
}
