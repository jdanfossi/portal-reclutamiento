import { db } from "@/db";
import { vacantes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import VoiceRecorder from "./VoiceRecorder";
import DynamicReferences from "./DynamicReferences";

export default async function PostularPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Basic Auth Check (In a real scenario, use middleware or dedicated provider)
  const session = await auth();
  if (!session || (session.user as any)?.userRole !== "candidato") {
     // Redirect to login sending the redirect URL back here
     redirect(`/login?callbackUrl=/candidato/postular/${resolvedParams.id}`);
  }

  const vacanteArr = await db.select().from(vacantes).where(eq(vacantes.id, resolvedParams.id)).limit(1);
  const vacante = vacanteArr[0];

  if (!vacante || vacante.estado !== "abierta") {
     return (
       <div className="flex min-h-screen items-center justify-center p-24 bg-slate-50">
          <p className="text-xl text-slate-600">Esta vacante no está disponible para postulación.</p>
       </div>
     );
  }

  let preguntas = [];
  if (vacante.preguntas_json) {
     try {
       preguntas = JSON.parse(vacante.preguntas_json);
     } catch(e) { console.error("Invalid JSON preguntas"); }
  }

  return (
    <main className="flex flex-col items-center py-12 px-4 sm:px-6">
       <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
         <h1 className="text-2xl font-bold mb-2">Postulando a:</h1>
         <h2 className="text-3xl font-extrabold text-blue-600 mb-8">{vacante.titulo}</h2>

         <form action={`/api/candidato/postular`} method="POST" encType="multipart/form-data" className="space-y-8">
            <input type="hidden" name="vacante_id" value={vacante.id} />
            
            {/* Cuestionario */}
            {preguntas.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Cuestionario de Filtro</h3>
                {preguntas.map((p: any, i: number) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{p.pregunta}</label>
                    {p.tipo === "sn" ? (
                      <select name={`respuesta_${i}`} required className="w-full border rounded-md p-2 bg-white">
                        <option value="">Selecciona...</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    ) : (
                      <textarea name={`respuesta_${i}`} required rows={3} className="w-full border rounded-md p-2" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Historia Narrativa */}
            <div className="space-y-6 pt-4">
               <h3 className="text-xl font-semibold border-b pb-2">Perfil y Trayectoria</h3>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Cuéntanos sobre tu Experiencia Laboral</label>
                 <p className="text-xs text-slate-500 mb-2">Redacta tu historia profesional. No hagas una lista enumerada; cuéntanos tus retos, logros y responsabilidades más importantes.</p>
                 <textarea name="experiencia_laboral" required rows={5} className="w-full border border-slate-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white" placeholder="Escribe aquí tu experiencia..." />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Cuéntanos sobre tus Estudios y Formación</label>
                 <p className="text-xs text-slate-500 mb-2">Dónde estudiaste, qué aprendiste, cursos relevantes, motivación por tu carrera.</p>
                 <textarea name="estudios" required rows={4} className="w-full border border-slate-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white" placeholder="Escribe sobre tus estudios aquí..." />
               </div>
            </div>

            {/* Expectativas de Renta */}
            <div className="space-y-4 pt-4">
               <h3 className="text-xl font-semibold border-b pb-2">Expectativas de Renta</h3>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Indícanos tus expectativas de renta líquida mensual</label>
                 <textarea name="expectativas_renta" required rows={2} className="w-full border border-slate-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white" placeholder="Ej: $1.000.000 líquidos, pretensiones acorde a mercado, etc." />
               </div>
            </div>

            {/* Referencias */}
            <div className="space-y-4 pt-4">
               <h3 className="text-xl font-semibold border-b pb-2">Referencias Laborales</h3>
               <p className="text-sm text-slate-600 mb-2">
                 Incluye contactos de empleadores anteriores que puedan dar recomendaciones relevantes sobre tu desempeño. (Opcional)
               </p>
               <DynamicReferences />
            </div>

            {/* Disponibilidad */}
            <div className="space-y-4 pt-4">
               <h3 className="text-xl font-semibold border-b pb-2">Disponibilidad</h3>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona tu disponibilidad para integrarte</label>
                 <select name="disponibilidad" required className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500">
                   <option value="">Selecciona una opción...</option>
                   <option value="inmediata">Inmediata</option>
                   <option value="15_dias">15 días</option>
                   <option value="30_dias">30 días</option>
                   <option value="mas_30_dias">Más de 30 días</option>
                 </select>
               </div>
            </div>

            {/* CV Upload */}
            <div className="space-y-4 pt-4">
               <h3 className="text-xl font-semibold border-b pb-2">Curriculum Vitae</h3>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Sube tu CV en formato PDF</label>
                 <input type="file" name="cv" accept=".pdf" required className="w-full border rounded-md p-2 bg-slate-50" />
               </div>
            </div>

            {/* Voice Audition */}
            {vacante.script_audio && (
              <div className="space-y-4 pt-4">
                 <h3 className="text-xl font-semibold border-b pb-2">Audición de Voz</h3>
                 <p className="text-sm text-slate-600 mb-4 bg-blue-50 p-4 border border-blue-100 rounded-md">
                   <strong>Instrucciones:</strong> Graba un audio siguiendo la instrucción a continuación. Presiona el botón del micrófono cuando estés listo para hablar.
                   <br/><br/>
                   <em className="text-slate-800 text-base font-medium">"{vacante.script_audio}"</em>
                 </p>
                 
                 {/* 
                   We will attach a React Client Component here to handle MediaRecorder API.
                   For now, we leave a placeholder input to attach the final audio Blob.
                 */}
                 <VoiceRecorder /> 

              </div>
            )}

            <div className="pt-6 border-t mt-6">
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-md hover:bg-blue-700 text-lg">
                Enviar Postulación Completa
              </button>
            </div>
         </form>
       </div>
    </main>
  );
}
