import { db } from "@/db";
import { vacantes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditarVacanteForm from "./EditarVacanteForm";

export default async function EditarVacantePage({
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

  // Parse JSON questions safely
  let preguntas = [];
  if (vacante.preguntas_json) {
    try {
      preguntas = JSON.parse(vacante.preguntas_json);
    } catch (e) {
      console.error("Error parsing preguntas JSON", e);
    }
  }

  return (
    <EditarVacanteForm vacante={vacante} preguntasIniciales={preguntas} />
  );
}
