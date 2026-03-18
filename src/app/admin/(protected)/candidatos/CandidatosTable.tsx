"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ApplicantDetailsModal from "./ApplicantDetailsModal";
import KanbanBoard from "./KanbanBoard";

export default function CandidatosTable({ initialPostulaciones, filterVacanteId }: { initialPostulaciones: any[], filterVacanteId?: string }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"activos" | "descartados">("activos");
  const [activeFilterId, setActiveFilterId] = useState<string | undefined>(filterVacanteId);
  const [viewMode, setViewMode] = useState<"tabla" | "tablero">("tabla");

  const filterSummaryTitle = useMemo(() => {
    if (!activeFilterId) return null;
    return initialPostulaciones.find(p => p.vacante_id === activeFilterId)?.titulo_vacante || "Vacante seleccionada";
  }, [activeFilterId, initialPostulaciones]);

  const filteredPostulaciones = useMemo(() => {
    let baseList = initialPostulaciones;
    
    if (activeFilterId) {
      baseList = baseList.filter(p => p.vacante_id === activeFilterId);
    }
    
    if (activeTab === "activos") {
      baseList = baseList.filter(p => p.estado_postulacion !== "descartado");
    } else {
      baseList = baseList.filter(p => p.estado_postulacion === "descartado");
    }

    if (!searchTerm.trim()) return baseList;

    const lowerSearch = searchTerm.toLowerCase();
    
    return baseList.filter((post) => {
      const nombreMatch = post.nombre_candidato?.toLowerCase().includes(lowerSearch);
      const emailMatch = post.email_candidato?.toLowerCase().includes(lowerSearch);
      const vacanteMatch = post.titulo_vacante?.toLowerCase().includes(lowerSearch);
      const codigoMatch = post.codigo_corto?.toLowerCase().includes(lowerSearch);
      
      return nombreMatch || emailMatch || vacanteMatch || codigoMatch;
    });
  }, [initialPostulaciones, searchTerm, activeTab, activeFilterId]);

  const clearVacanteFilter = () => {
    setActiveFilterId(undefined);
    router.replace("/admin/candidatos");
  };

  return (
    <>
      <div className="mb-6 flex space-x-8 border-b border-gray-200">
        <button
          className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
            activeTab === "activos"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("activos")}
        >
          Postulaciones Activas
        </button>
        <button
           className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
            activeTab === "descartados"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("descartados")}
        >
          Candidatos Descartados
        </button>
      </div>

      {activeFilterId && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-medium text-sm">Viendo postulantes para la vacante: <strong className="font-bold">{filterSummaryTitle}</strong></span>
          </div>
          <button 
            onClick={clearVacanteFilter} 
            className="text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-100 rounded-md px-3 py-1.5 transition-colors text-sm font-semibold border border-blue-200 shadow-sm flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Quitar Filtro
          </button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow border">
        <div className="w-full max-w-md">
          <label htmlFor="search" className="sr-only">Buscar candidatos</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Buscar por nombre, email, vacante o código (ej: CAPE2026031701)"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {activeTab === "activos" && (
          <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 ml-4 shrink-0 shadow-inner">
            <button 
               onClick={() => setViewMode("tabla")} 
               className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${viewMode === "tabla" ? "bg-white shadow-sm text-slate-900 ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
            >
               📋 Tabla
            </button>
            <button 
               onClick={() => setViewMode("tablero")} 
               className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${viewMode === "tablero" ? "bg-white shadow-sm text-slate-900 ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
            >
               📊 Tablero
            </button>
          </div>
        )}
      </div>

      {viewMode === "tabla" || activeTab === "descartados" ? (
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPostulaciones.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-slate-900">{post.nombre_candidato}</div>
                  <div className="text-sm text-slate-500">{post.email_candidato}</div>
                  <div className="text-sm text-slate-500">{post.telefono_candidato}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {post.titulo_vacante}
                  {post.codigo_corto && (
                     <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block">
                       {post.codigo_corto}
                     </div>
                  )}
                  {post.score !== null && (
                     <div className="mt-1 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                       Score: {post.score}%
                     </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {post.fecha_postulacion ? new Date(post.fecha_postulacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold uppercase rounded-full ${
                    post.estado_postulacion === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                    post.estado_postulacion === "descartado" ? "bg-red-100 text-red-800" :
                    post.estado_postulacion === "contratado" ? "bg-green-100 text-green-800" :
                    post.estado_postulacion === "oferta" ? "bg-emerald-100 text-emerald-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {post.estado_postulacion.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <ApplicantDetailsModal 
                     driveCvId={post.drive_cv_id} 
                     driveAudioId={post.drive_audio_id} 
                     postulacionId={post.id} 
                     estadoActual={post.estado_postulacion}
                  />
                </td>
              </tr>
            ))}

            {filteredPostulaciones.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? "No se encontraron candidatos que coincidan con la búsqueda." : "No hay postulaciones registradas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      ) : (
        <KanbanBoard postulaciones={filteredPostulaciones} />
      )}
    </>
  );
}
