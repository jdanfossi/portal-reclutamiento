"use client";

import { useState } from "react";
import { toggleVacanteStatus } from "@/actions/vacantes";

export default function VacantesTable({ initialVacantes }: { initialVacantes: any[] }) {
  const [activeTab, setActiveTab] = useState<"activas" | "inactivas">("activas");
  const [vacantes, setVacantes] = useState(initialVacantes);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredVacantes = vacantes.filter((v) => {
    if (activeTab === "activas") return v.estado === "abierta";
    return v.estado === "cerrada" || v.estado === "pausada";
  });

  const handleStatusChange = async (id: string, newEstado: string) => {
    setLoadingId(id);
    try {
      await toggleVacanteStatus(id, newEstado);
      // Update local state to reflect change immediately
      setVacantes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, estado: newEstado } : v))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-4 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("activas")}
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "activas"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Activas
        </button>
        <button
          onClick={() => setActiveTab("inactivas")}
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "inactivas"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Inactivas
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vacante
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Postulantes
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha Creación
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVacantes.map((vacante) => (
              <tr key={vacante.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {vacante.titulo}
                  </div>
                  {vacante.codigo_corto && (
                     <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block">
                       {vacante.codigo_corto}
                     </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex flex-col gap-1.5">
                     <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded w-max border border-slate-200">
                        {vacante.totalPostulantes || 0} Totales
                     </span>
                     {vacante.nuevosPostulantes > 0 && (
                       <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded w-max border border-blue-200">
                          {vacante.nuevosPostulantes} Sin revisar
                       </span>
                     )}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={vacante.estado || "abierta"}
                    onChange={(e) => handleStatusChange(vacante.id, e.target.value)}
                    disabled={loadingId === vacante.id}
                    className={`text-sm rounded-full px-3 py-1 font-semibold border-0 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${
                      vacante.estado === "abierta"
                        ? "bg-green-100 text-green-800"
                        : vacante.estado === "cerrada"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    } ${loadingId === vacante.id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="abierta">Abierta</option>
                    <option value="pausada">Pausada</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vacante.created_at
                    ? new Date(vacante.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a
                    href={`/admin/candidatos?vacante_id=${vacante.id}`}
                    className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm font-semibold"
                  >
                    👥 Ver Candidatos
                  </a>
                  <a
                    href={`/admin/vacantes/${vacante.id}/editar`}
                    className="text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Editar
                  </a>
                  <a
                    href={`/vacantes/${vacante.id}`}
                    target="_blank"
                    className="text-slate-500 hover:text-slate-800 px-2 py-1.5"
                    title="Ver página pública de la vacante"
                  >
                    ↗ Externa
                  </a>
                </td>
              </tr>
            ))}

            {filteredVacantes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No hay vacantes en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
