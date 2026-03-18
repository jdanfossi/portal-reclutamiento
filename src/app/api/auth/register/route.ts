import { NextResponse } from "next/server";
import { db } from "@/db";
import { candidatos } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { email, password, nombre, telefono } = await req.json();

    if (!email || !password || !nombre || !telefono) {
      return NextResponse.json(
        { error: "Name, email, password and telefono are required." },
        { status: 400 }
      );
    }

    const telefonoRegex = /^\+569\d{8}$/;
    if (!telefonoRegex.test(telefono)) {
      return NextResponse.json(
        { error: "El teléfono debe tener el formato +569XXXXXXXX." },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres, e incluir al menos una letra mayúscula, una minúscula y un número o símbolo." },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingArr = await db.select().from(candidatos).where(eq(candidatos.email, email)).limit(1);
    if (existingArr.length > 0) {
      return NextResponse.json(
        { error: "El email ya está registrado." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = nanoid();
    const vToken = nanoid(32);

    // Create candidate
    await db.insert(candidatos).values({
      id: newId,
      email,
      nombre,
      telefono: telefono || null,
      password_hash: hashedPassword,
      email_verified: 0,
      verification_token: vToken,
    });

    // Send Verification Email via Brevo
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const clicaUrl = `${baseUrl}/verificar?token=${vToken}`;

    await sendEmail({
      to: [{ email, name: nombre }],
      subject: "Verifica tu cuenta en Clínica Avaria",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">¡Bienvenido a Clínica Avaria, ${nombre}!</h2>
          <p>Gracias por crear tu cuenta en nuestro Portal de Reclutamiento.</p>
          <p>Para poder iniciar sesión y postular a nuestras vacantes, necesitamos que confirmes tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
          <div style="margin: 30px 0;">
            <a href="${clicaUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verificar mi Correo</a>
          </div>
          <p>O si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p><a href="${clicaUrl}">${clicaUrl}</a></p>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">Si no has creado una cuenta en Clínica Avaria, por favor ignora este correo.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: "Revisa tu correo para verificar tu cuenta e iniciar sesión." });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar el candidato." },
      { status: 500 }
    );
  }
}
