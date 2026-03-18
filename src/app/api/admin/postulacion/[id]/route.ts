import { NextResponse } from "next/server";
import { db } from "@/db";
import { postulaciones, postulacion_notas, candidatos, vacantes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/brevo";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.userRole !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);
    if (isNaN(postId)) {
       return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Fetch application details for narrative fields
    const postulacionesRows = await db.select().from(postulaciones).where(eq(postulaciones.id, postId)).limit(1);
    const postulacion = postulacionesRows.length > 0 ? postulacionesRows[0] : null;

    // Fetch notes ordered by creation time
    const notas = await db.select().from(postulacion_notas).where(eq(postulacion_notas.postulacion_id, postId)).orderBy(desc(postulacion_notas.created_at));

    return NextResponse.json({ notas, detalles: postulacion });
  } catch(error) {
    console.error("Error GET notas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.userRole !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);
    if (isNaN(postId)) {
       return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { nota } = await req.json();
    if (!nota || typeof nota !== "string") {
      return NextResponse.json({ error: "Falta el texto de la nota" }, { status: 400 });
    }

    const userEmail = session.user?.email || "Admin";

    await db.insert(postulacion_notas).values({
      postulacion_id: postId,
      autor_email: userEmail,
      texto: nota
    });

    return NextResponse.json({ success: true });
  } catch(error) {
    console.error("Error POST nota:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.userRole !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);
    if (isNaN(postId)) {
       return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { estado, enviarEmail = true } = await req.json();
    if (!estado) {
      return NextResponse.json({ error: "Falta el nuevo estado" }, { status: 400 });
    }

    // Fetch candidate and vacante data to notify
    const profileRows = await db
      .select({
        candidato_email: candidatos.email,
        candidato_nombre: candidatos.nombre,
        vacante_titulo: vacantes.titulo,
        estado_actual: postulaciones.estado_postulacion
      })
      .from(postulaciones)
      .innerJoin(candidatos, eq(candidatos.id, postulaciones.candidato_id))
      .innerJoin(vacantes, eq(vacantes.id, postulaciones.vacante_id))
      .where(eq(postulaciones.id, postId))
      .limit(1);

    await db.update(postulaciones).set({ estado_postulacion: estado }).where(eq(postulaciones.id, postId));

    // Email Automations
    if (profileRows.length > 0 && profileRows[0].estado_actual !== estado && enviarEmail) {
      const profile = profileRows[0];
      const nombre = profile.candidato_nombre.split(" ")[0]; // First name roughly
      const email = profile.candidato_email;
      const vacante = profile.vacante_titulo;

      let subject = "";
      let htmlContent = "";

      if (estado === "descartado") {
        subject = `Actualización de tu postulación: ${vacante}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
            <h2>Hola ${nombre},</h2>
            <p>Queremos agradecerte el interés y el tiempo que tomaste al postular al cargo de <strong>${vacante}</strong> en Clínica Avaria.</p>
            <p>Después de evaluar detenidamente tu perfil junto con el de los demás postulantes, hemos decidido avanzar en esta ocasión con otros candidatos que se ajustan más estrechamente a los requisitos actuales de la posición.</p>
            <p>Mantendremos tus antecedentes en nuestra base de datos para futuras oportunidades que calcen mejor con tu experiencia.</p>
            <p>¡Te deseamos el mayor de los éxitos en tu búsqueda laboral!</p>
            <br/>
            <p>Atentamente,<br/><strong>El Equipo de Reclutamiento | Clínica Avaria</strong></p>
          </div>
        `;
      } else if (estado === "entrevista") {
         subject = `¡Avanzas en el proceso! - Entrevista para ${vacante}`;
         htmlContent = `
          <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
            <h2>¡Excelentes noticias, ${nombre}!</h2>
            <p>Hemos revisado tu postulación para el cargo de <strong>${vacante}</strong> y tu perfil nos ha interesado mucho.</p>
            <p>Has sido seleccionado/a para avanzar a la <strong>etapa de entrevista</strong>. Pronto un miembro de nuestro equipo se pondrá en contacto contigo para coordinar la fecha y los detalles.</p>
            <p>¡Felicidades y estamos emocionados de conocerte mejor!</p>
            <br/>
            <p>Atentamente,<br/><strong>El Equipo de Reclutamiento | Clínica Avaria</strong></p>
          </div>
        `;
      } else if (estado === "oferta") {
         subject = `Propuesta en Curso - ${vacante}`;
         htmlContent = `
          <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
            <h2>¡Hola ${nombre}!</h2>
            <p>Tenemos muy buenas noticias respecto a tu postulación para <strong>${vacante}</strong>.</p>
            <p>Actualmente nos encontramos elaborando una propuesta formal para ti y te contactaremos a la brevedad para discutir los siguientes pasos.</p>
            <br/>
            <p>Atentamente,<br/><strong>El Equipo de Reclutamiento | Clínica Avaria</strong></p>
          </div>
        `;
      } else if (estado === "contratado") {
         subject = `¡Felicidades! Has sido seleccionado - ${vacante}`;
         htmlContent = `
          <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
            <h2>¡Felicidades, ${nombre}! 🎉</h2>
            <p>Nos enorgullece comunicarte que has superado todo nuestro proceso de selección y eres la persona elegida para el cargo de <strong>${vacante}</strong> en Clínica Avaria.</p>
            <p>Estamos entusiasmados de que te unas a nuestro equipo. Nuestro departamento te guiará con los últimos detalles de contratación (y/u onboarding).</p>
            <br/>
            <p>Bienvenido/a,<br/><strong>El Equipo de Clínica Avaria</strong></p>
          </div>
        `;
      }

      if (subject && htmlContent) {
        // Send email seamlessly async (do not await throwing error back to client ideally, just log if fails)
        sendEmail({
          to: [{ email, name: profile.candidato_nombre }],
          subject,
          htmlContent
        }).catch(err => console.error("Error sending status email:", err));
      }
    }

    return NextResponse.json({ success: true });
  } catch(error) {
    console.error("Error PATCH estado:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
