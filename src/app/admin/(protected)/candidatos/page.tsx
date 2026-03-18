import { db } from "@/db";
import { vacantes, postulaciones, candidatos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCandidatosPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const vacanteIdParam = params.vacante_id as string | undefined;

  const allPostulaciones = await db
    .select({
      id: postulaciones.id,
      estado_postulacion: postulaciones.estado_postulacion,
      fecha_postulacion: postulaciones.fecha_postulacion,
      score: postulaciones.score_cuestionario,
      drive_cv_id: postulaciones.drive_cv_id,
      drive_audio_id: postulaciones.drive_audio_id,
      nombre_candidato: candidatos.nombre,
      email_candidato: candidatos.email,
      telefono_candidato: candidatos.telefono,
      vacante_id: vacantes.id,
      titulo_vacante: vacantes.titulo,
      codigo_corto: vacantes.codigo_corto,
    })
    .from(postulaciones)
    .innerJoin(vacantes, eq(postulaciones.vacante_id, vacantes.id))
    .innerJoin(candidatos, eq(postulaciones.candidato_id, candidatos.id))
    .orderBy(desc(postulaciones.fecha_postulacion));

  return (
    <>
      <div>
         <h1 className="text-3xl font-bold mb-6">Gestión de Candidatos</h1>
         
         <CandidatosTable initialPostulaciones={allPostulaciones} filterVacanteId={vacanteIdParam} />
      </div>
    </>
  );
}


import CandidatosTable from "./CandidatosTable";
