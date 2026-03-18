import { db } from "@/db";
import { vacantes, postulaciones } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CandidateDashboardPage() {
  const session = await auth();
  
  if (!session || (session.user as any)?.userRole !== "candidato") {
     redirect("/login?callbackUrl=/candidato/dashboard");
  }

  const userId = (session.user as any)?.id;

  const getCandidatoStatus = (adminStatus: string | null, vacanteEstado: string | null) => {
    if (adminStatus === "contratado") return { label: "¡Seleccionado! 🎉", color: "bg-green-100 text-green-800" };
    
    if (vacanteEstado === "cerrada") return { label: "Proceso Cerrado 🔒", color: "bg-slate-100 text-slate-800" };
    
    switch(adminStatus) {
      case "descartado": return { label: "Proceso Finalizado 🛑", color: "bg-red-100 text-red-800" };
      case "oferta": return { label: "Propuesta en Curso 📝", color: "bg-blue-100 text-blue-800" };
      case "entrevista": 
      case "preseleccionado": return { label: "En Evaluación Avanzada 🎯", color: "bg-purple-100 text-purple-800" };
      case "en_revision":
      case "pendiente": 
      default: return { label: "En Revisión ⏳", color: "bg-yellow-100 text-yellow-800" };
    }
  };

  // Real-time status dashboard via POSTULACIONES x VACANTES JOIN
  const userApplications = await db
    .select({
      postulacion_id: postulaciones.id,
      estado_postulacion: postulaciones.estado_postulacion,
      fecha_postulacion: postulaciones.fecha_postulacion,
      vacante_titulo: vacantes.titulo,
      vacante_estado: vacantes.estado,
    })
    .from(postulaciones)
    .innerJoin(vacantes, eq(postulaciones.vacante_id, vacantes.id))
    .where(eq(postulaciones.candidato_id, userId))
    .orderBy(desc(postulaciones.fecha_postulacion));

  return (
    <main className="flex flex-col items-center py-12 px-6">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold">Mi Portal</h1>
        </div>
        <p className="text-slate-600 mb-8">
          Bienvenido. Aquí puedes hacer seguimiento del estado de tus postulaciones en Clínica Avaria.
        </p>

        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Postulación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado del Proceso</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userApplications.map((app) => (
                <tr key={app.postulacion_id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    {app.vacante_titulo}
                    {app.vacante_estado === "cerrada" && <span className="ml-2 text-xs text-red-500">(Oferta Cerrada)</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {app.fecha_postulacion ? new Date(app.fecha_postulacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const status = getCandidatoStatus(app.estado_postulacion, app.vacante_estado);
                      return (
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}

              {userApplications.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-gray-500">
                    <p className="mb-6 font-medium text-slate-600">Aún no has postulado a ninguna vacante.</p>
                    <a href="/" className="inline-block bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-6 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                      Explorar Oportunidades
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
