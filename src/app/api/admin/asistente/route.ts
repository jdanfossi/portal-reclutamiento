// Force Next.js Turbopack cache invalidation
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Validate if the user is B2B Admin
    if (!session || (session.user as any)?.userRole !== "admin") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { descripcion, horarios, beneficios, sueldo, tipo } = await req.json();

    if (!descripcion) {
      return NextResponse.json({ error: "Descripción is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    const systemInstruction = `
Eres un experto reclutador de Recursos Humanos trabajando para "Clínica Avaria", una clínica estética moderna y profesional.
El administrador te enviará requerimientos de talento cortos (ej: "Busco una enfermera con 3 años de experiencia en inyectables").
Tu objetivo es devolver estrictamente un objeto JSON (sin formato Markdown adicional, solo el JSON válido) que incluya:
{
  "titulo": "Título sugerido para la vacante",
  "descripcion": "Descripción del cargo detallada y persuasiva.",
  "requisitos": "Lista de requisitos en formato texto plano (puedes usar guiones o viñetas).",
  "preguntas_filtro": [
    { "pregunta": "¿Tienes experiencia en depilación láser?", "tipo": "sn" },
    { "pregunta": "¿Cuántos años de experiencia tienes trabajando en clínicas?", "tipo": "texto" }
  ]
}
No incluyas \`\`\`json\`\`\` en tu respuesta, solo el objeto desde la llave de apertura hasta la de cierre.
`;

    const combinedPrompt = `
Descripción requerida: ${descripcion}

Por favor asegúrate de incorporar la siguiente información de forma atractiva en la descripción del cargo, y/o beneficios y requisitos donde corresponda:
- Horarios: ${horarios || "No especificado"}
- Beneficios ofrecidos: ${beneficios || "No especificado"}
- Renta/Sueldo ofrecido: ${sueldo || "No especificado"}
- Tipo de renta/contrato: ${tipo || "No especificado"}
`;

    const result = await model.generateContent([systemInstruction, combinedPrompt]);
    const responseText = result.response.text();
    
    // Attempt to parse JSON safely
    let parsedJson;
    try {
      // Remove any potential markdown code block markers
      const cleanJson = responseText.replace(/^\\s*```json/i, "").replace(/```\\s*$/, "").trim();
      parsedJson = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      throw new Error("Invalid output from AI");
    }

    return NextResponse.json({ result: parsedJson });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate profile" }, { status: 500 });
  }
}
