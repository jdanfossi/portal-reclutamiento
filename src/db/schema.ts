import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const vacantes = sqliteTable("vacantes", {
  id: text("id").primaryKey(),
  codigo_corto: text("codigo_corto").unique(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  requisitos: text("requisitos"),
  beneficios: text("beneficios"),
  horarios: text("horarios"),
  remuneracion: text("remuneracion"),
  estado: text("estado").default("abierta"), // abierta, cerrada, pausada
  script_audio: text("script_audio"),
  preguntas_json: text("preguntas_json"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const candidatos = sqliteTable("candidatos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash"),
  telefono: text("telefono"),
  email_verified: integer("email_verified").default(0),
  verification_token: text("verification_token"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const postulaciones = sqliteTable("postulaciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidato_id: text("candidato_id").references(() => candidatos.id),
  vacante_id: text("vacante_id").references(() => vacantes.id),
  estado_postulacion: text("estado_postulacion").default("pendiente"), // pendiente, en_revision, preseleccionado, entrevista, oferta, contratado, descartado
  disponibilidad: text("disponibilidad"),
  experiencia_laboral: text("experiencia_laboral"),
  estudios: text("estudios"),
  referencias: text("referencias"),
  score_cuestionario: integer("score_cuestionario"),
  drive_cv_id: text("drive_cv_id"),
  drive_audio_id: text("drive_audio_id"),
  expectativas_renta: text("expectativas_renta"),
  fecha_postulacion: text("fecha_postulacion").default(sql`(CURRENT_TIMESTAMP)`),
});

export const postulacion_notas = sqliteTable("postulacion_notas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postulacion_id: integer("postulacion_id").references(() => postulaciones.id),
  autor_email: text("autor_email"), 
  texto: text("texto").notNull(),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});
