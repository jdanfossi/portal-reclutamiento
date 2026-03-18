"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MediaViewerProps {
  driveCvId: string | null;
  driveAudioId: string | null;
  postulacionId: number;
}

export default function MediaViewerModal({ driveCvId, driveAudioId }: MediaViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // In a real scenario, the Drive IDs need to be converted to actual embed links or we route through a Next.js API
  // to stream the File without making the Drive folder totally public. For simplicity we assume a public stream proxy route.
  
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>Visualizar</Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold">Documentos del Candidato</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 flex flex-col space-y-4 bg-slate-50">
               
               {driveAudioId ? (
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <h4 className="font-semibold mb-3">Audición de Voz</h4>
                   {/* Here we'd load the stream from our proxy API using the Drive ID limit: /api/proxy/audio?id={driveAudioId} */}
                   <audio src={`/api/proxy/drive?id=${driveAudioId}`} controls className="w-full" />
                 </div>
               ) : (
                 <div className="text-slate-500 italic">No se registró audición de voz.</div>
               )}

               {driveCvId ? (
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col relative h-full min-h-[400px]">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="font-semibold">Curriculum Vitae</h4>
                     <a 
                       href={`/api/proxy/drive?id=${driveCvId}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md font-medium flex items-center gap-1"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                       Abrir en nueva pestaña
                     </a>
                   </div>
                   {/* Same proxy logic for PDF rendering iframe */}
                   <iframe src={`/api/proxy/drive?id=${driveCvId}`} className="w-full flex-1 border rounded" title="CV Candidato" />
                 </div>
               ) : (
                 <div className="text-slate-500 italic pb-4">No se adjuntó CV.</div>
               )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
