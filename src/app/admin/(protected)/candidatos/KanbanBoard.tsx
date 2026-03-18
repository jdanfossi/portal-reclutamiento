"use client";

import React from "react";
import ApplicantDetailsModal from "./ApplicantDetailsModal";

const STAGES = [
  { id: "pendiente", title: "Nuevos", color: "bg-slate-50", border: "border-slate-200", header: "text-slate-800" },
  { id: "en_revision", title: "En Revisión", color: "bg-amber-50/50", border: "border-amber-200", header: "text-amber-800" },
  { id: "entrevista", title: "Entrevistas", color: "bg-blue-50/50", border: "border-blue-200", header: "text-blue-800" },
  { id: "oferta", title: "Ofertas", color: "bg-purple-50/50", border: "border-purple-200", header: "text-purple-800" },
  { id: "contratado", title: "Contratados", color: "bg-emerald-50/50", border: "border-emerald-200", header: "text-emerald-800" },
];

export default function KanbanBoard({ postulaciones }: { postulaciones: any[] }) {
  
  const columns = STAGES.map(stage => ({
    ...stage,
    cards: postulaciones.filter(p => (p.estado_postulacion || "pendiente") === stage.id)
  }));

  return (
    <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-6 h-[calc(100vh-280px)] min-h-[500px]">
      {columns.map(col => (
        <div key={col.id} className={`flex flex-col flex-1 min-w-[280px] max-w-sm rounded-xl border ${col.border} ${col.color} shadow-sm overflow-hidden`}>
          <div className="px-4 py-3 border-b border-black/5 bg-white/70 flex justify-between items-center backdrop-blur-sm">
            <h3 className={`font-bold ${col.header}`}>{col.title}</h3>
            <span className="bg-white text-slate-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-black/5">{col.cards.length}</span>
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {col.cards.map(card => (
              <ApplicantDetailsModal
                key={card.id}
                postulacionId={card.id}
                estadoActual={card.estado_postulacion || "pendiente"}
                driveCvId={card.drive_cv_id}
                driveAudioId={card.drive_audio_id}
                trigger={
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all group flex flex-col text-left">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{card.nombre_candidato}</h4>
                      {card.score !== null && (
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 border border-slate-200">{card.score} pts</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mb-3 truncate" title={card.titulo_vacante}>{card.titulo_vacante}</div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-auto pt-3 border-t border-slate-50">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                       {card.fecha_postulacion ? new Date(card.fecha_postulacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                }
              />
            ))}
            
            {col.cards.length === 0 && (
               <div className="h-20 border-2 border-dashed border-black/10 rounded-lg flex items-center justify-center opacity-70">
                 <span className="text-sm font-medium text-slate-500">Vacío</span>
               </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
