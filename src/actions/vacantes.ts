"use server";

import { db } from "@/db";
import { vacantes } from "@/db/schema";
import { createVacancyFolder } from "@/lib/drive";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, like } from "drizzle-orm";

export async function createVacante(formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const descripcion = formData.get("descripcion") as string;
  const requisitos = formData.get("requisitos") as string;
  const beneficios = formData.get("beneficios") as string;
  const horarios = formData.get("horarios") as string;
  const remuneracion = formData.get("remuneracion") as string;
  const script_audio = formData.get("script_audio") as string;
  const preguntas_json = formData.get("preguntas_json") as string;
  const estado = (formData.get("estado") as string) || "abierta";

  const id = crypto.randomUUID();

  // Generate codigo_corto
  // 1. Get Initials (max 4, uppercase letters only)
  const words = titulo.split(" ").filter(w => w.trim().length > 0);
  let initials = words.map(w => w[0].toUpperCase()).join("").replace(/[^A-Z]/g, "").substring(0, 4);
  if (initials.length === 0) initials = "VAC";

  // 2. Get today's date YYYYMMDD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  // 3. Find how many vacancies were created today for the incremental suffix
  const prefix = `${initials}${dateStr}`;
  const todayVacantes = await db.select().from(vacantes).where(like(vacantes.codigo_corto, `${prefix}%`));
  
  // Calculate the next ID (e.g. 01, 02)
  const nextCount = todayVacantes.length + 1;
  const suffix = String(nextCount).padStart(2, "0");
  const codigo_corto = `${prefix}${suffix}`;

  // Create Google Drive folder for this vacancy
  try {
     await createVacancyFolder(`Vacante - ${titulo} (${id})`);
  } catch (error) {
     console.error("Failed to create Drive folder, but proceeding with DB creation", error);
     // Depending on strictness, we could throw here, but we proceed for now
  }

  await db.insert(vacantes).values({
    id,
    codigo_corto,
    titulo,
    descripcion,
    requisitos,
    beneficios,
    horarios,
    remuneracion,
    script_audio,
    preguntas_json,
    estado,
  });

  revalidatePath("/admin/vacantes");
  redirect("/admin/vacantes");
}

export async function updateVacante(id: string, formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const descripcion = formData.get("descripcion") as string;
  const requisitos = formData.get("requisitos") as string;
  const beneficios = formData.get("beneficios") as string;
  const horarios = formData.get("horarios") as string;
  const remuneracion = formData.get("remuneracion") as string;
  const script_audio = formData.get("script_audio") as string;
  const preguntas_json = formData.get("preguntas_json") as string;
  const estado = formData.get("estado") as string;

  await db.update(vacantes)
    .set({
      titulo,
      descripcion,
      requisitos,
      beneficios,
      horarios,
      remuneracion,
      script_audio,
      preguntas_json,
      estado,
    })
    .where(eq(vacantes.id, id));

  revalidatePath("/admin/vacantes");
  redirect("/admin/vacantes");
}

export async function toggleVacanteStatus(id: string, newEstado: string) {
  await db.update(vacantes)
    .set({ estado: newEstado })
    .where(eq(vacantes.id, id));
    
  revalidatePath("/admin/vacantes");
}
