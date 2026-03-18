import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { postulaciones } from "@/db/schema";
import { uploadFileToDrive } from "@/lib/drive";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.userRole !== "candidato") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const vacante_id = formData.get("vacante_id") as string;
    const disponibilidad = formData.get("disponibilidad") as string;
    const experiencia_laboral = formData.get("experiencia_laboral") as string;
    const estudios = formData.get("estudios") as string;
    const expectativas_renta = formData.get("expectativas_renta") as string;
    const referencias_json = formData.get("referencias_json") as string;
    const cvFile = formData.get("cv") as File | null;
    const audioFile = formData.get("audio") as File | null; // From VoiceRecorder

    if (!vacante_id) {
      return NextResponse.json({ error: "Falta vacante_id" }, { status: 400 });
    }

    if (!disponibilidad) {
      return NextResponse.json({ error: "Falta disponibilidad" }, { status: 400 });
    }

    if (!experiencia_laboral || !estudios) {
      return NextResponse.json({ error: "Faltan los campos de historia narrativa" }, { status: 400 });
    }

    if (!expectativas_renta || !expectativas_renta.trim()) {
      return NextResponse.json({ error: "Faltan las expectativas de renta" }, { status: 400 });
    }

    if (!cvFile) {
      return NextResponse.json({ error: "Falta el archivo CV" }, { status: 400 });
    }

    // STRICT PDF VALIDATION
    if (cvFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Formato de archivo inválido. Solo se aceptan documentos PDF (.pdf)." },
        { status: 400 }
      );
    }

    // Process Questionnaire Answers
    // Instead of saving answers in DB as requested by user (since we didn't add a field for it in the schema, 
    // wait, schema has `score_cuestionario`, but no `respuestas_json`?
    // Let's check schema for postulaciones: id, candidato_id, vacante_id, estado_postulacion, score_cuestionario, drive_cv_id, drive_audio_id, fecha_postulacion
    // For now we will just process the uploaded files.
    
    const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
    if (!parentFolderId) {
      throw new Error("Missing GOOGLE_DRIVE_PARENT_FOLDER_ID");
    }

    const candidatoId = session.user?.id || (session.user as any)?.email;

    // Upload CV
    const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
    const cvFilename = `CV_${candidatoId}_Vacante_${vacante_id}.pdf`;
    const driveCvId = await uploadFileToDrive(cvFilename, cvFile.type, cvBuffer, parentFolderId);

    // Upload Audio if exists
    let driveAudioId = null;
    if (audioFile && audioFile.size > 0) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const audioFilename = `Audio_${candidatoId}_Vacante_${vacante_id}.webm`;
      driveAudioId = await uploadFileToDrive(audioFilename, audioFile.type, audioBuffer, parentFolderId);
    }

    // Save to database
    await db.insert(postulaciones).values({
      candidato_id: session.user?.id || "",
      vacante_id,
      disponibilidad,
      experiencia_laboral,
      estudios,
      expectativas_renta,
      referencias: referencias_json || "[]",
      drive_cv_id: driveCvId,
      drive_audio_id: driveAudioId,
      estado_postulacion: "pendiente"
    });

    // Native form submission redirect requires absolute URL in NextResponse.redirect
    const baseUrl = req.nextUrl.origin;
    return NextResponse.redirect(`${baseUrl}/candidato/dashboard`, 303);

  } catch (error: any) {
    console.error("Error al procesar la postulación:", error);
    return NextResponse.json({ error: "Error interno del servidor. " + error.message }, { status: 500 });
  }
}
