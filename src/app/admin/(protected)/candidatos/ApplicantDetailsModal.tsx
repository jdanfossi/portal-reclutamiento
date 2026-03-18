"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ApplicantDetailsProps {
  driveCvId: string | null;
  driveAudioId: string | null;
  postulacionId: number;
  estadoActual: string;
  trigger?: React.ReactNode;
}

interface Nota {
  id: number;
  texto: string;
  autor_email: string;
  created_at: string;
}

const ESTADOS = [
  "pendiente",
  "en_revision",
  "preseleccionado",
  "entrevista",
  "oferta",
  "contratado",
  "descartado"
];

export default function ApplicantDetailsModal({ 
  driveCvId, 
  driveAudioId, 
  postulacionId,
  estadoActual,
  trigger
}: ApplicantDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [estado, setEstado] = useState(estadoActual);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [detalles, setDetalles] = useState<any>(null);
  const [nuevaNota, setNuevaNota] = useState("");
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"documentos" | "perfil">("perfil");
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);
  const [sendEmailChecked, setSendEmailChecked] = useState(true);
  
  const router = useRouter();

  const fetchNotas = useCallback(async () => {
    setLoadingNotas(true);
    try {
      const res = await fetch(`/api/admin/postulacion/${postulacionId}`);
      if (res.ok) {
        const data = await res.json();
        setNotas(data.notas || []);
        setDetalles(data.detalles || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotas(false);
    }
  }, [postulacionId]);

  useEffect(() => {
    if (isOpen) {
      fetchNotas();
    }
  }, [isOpen, fetchNotas]);

  const handleStatusChange = async (newStatus: string, sendEmail: boolean) => {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/postulacion/${postulacionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus, enviarEmail: sendEmail })
      });
      if (res.ok) {
        setEstado(newStatus);
        setPendingStatusChange(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNota = async () => {
    if (!nuevaNota.trim()) return;
    try {
      const res = await fetch(`/api/admin/postulacion/${postulacionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota: nuevaNota })
      });
      if (res.ok) {
        setNuevaNota("");
        fetchNotas();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="contents cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>Gestión y Documentos</Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-slate-800">Detalles de Postulación #{postulacionId}</h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500">Estado:</span>
                  <select 
                     value={estado} 
                     onChange={(e) => {
                       setPendingStatusChange(e.target.value);
                       setSendEmailChecked(true); // reset
                     }}
                     disabled={savingStatus}
                     className="border border-slate-300 rounded-md px-3 py-1 text-sm bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                  >
                    {ESTADOS.map(st => (
                      <option key={st} value={st}>
                        {st.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {savingStatus && <span className="text-xs text-blue-500">Guardando...</span>}
                </div>
              </div>

              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
            </div>
            
            {/* INICIO MODAL CONFIRMACION ESTADO */}
            {pendingStatusChange && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 rounded-lg whitespace-normal text-left">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmar acción</h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    Estás a punto de pasar a este candidato a la etapa de <strong className="text-blue-700">{pendingStatusChange.replace("_", " ").toUpperCase()}</strong>.
                  </p>
                  
                  {["descartado", "entrevista", "oferta", "contratado"].includes(pendingStatusChange) ? (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6 whitespace-normal text-left">
                      <p className="text-sm font-semibold text-blue-800 mb-2">Acción Automatizada</p>
                      <p className="text-sm text-blue-800/80 mb-4 leading-relaxed">
                        {pendingStatusChange === "descartado" && "Se le enviará un correo amable agradeciendo su tiempo e informando que no avanzará en el proceso."}
                        {pendingStatusChange === "entrevista" && "Se le enviará un correo notificándole que avanza a la etapa de entrevistas formalmente."}
                        {pendingStatusChange === "oferta" && "Se le enviará un correo avisándole que hay gran interés y se elaborará una propuesta."}
                        {pendingStatusChange === "contratado" && "Se le enviará un correo de felicitaciones por haber sido contratado."}
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" className="peer w-5 h-5 text-blue-600 rounded border-slate-300 cursor-pointer transition-all" checked={sendEmailChecked} onChange={e => setSendEmailChecked(e.target.checked)} />
                        </div>
                        <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900 transition-colors">Enviar correo de notificación al candidato</span>
                      </label>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 whitespace-normal text-left">
                      <p className="text-sm text-slate-600 font-medium">Esta etapa de evaluación es interna y no genera correos automáticos al candidato.</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
                    <Button variant="outline" onClick={() => setPendingStatusChange(null)} disabled={savingStatus} className="hover:bg-slate-100">
                      Cancelar
                    </Button>
                    <Button onClick={() => handleStatusChange(pendingStatusChange, sendEmailChecked)} disabled={savingStatus} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium px-6">
                      {savingStatus ? "Guardando..." : "Confirmar Cambio"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* FIN MODAL CONFIRMACION ESTADO */}

            {/* Contenido principal dividido en 2 columnas */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* COLUMNA IZQUIERDA 65% (TABS) */}
              <div className="w-[65%] flex flex-col bg-slate-100 border-r overflow-hidden">
                <div className="flex border-b bg-white shrink-0 px-4 pt-4 space-x-6">
                  <button 
                    onClick={() => setActiveTab("perfil")}
                    className={`pb-3 px-1 font-semibold text-sm border-b-2 transition-colors ${activeTab === "perfil" ? "border-blue-600 text-blue-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    Historia y Referencias
                  </button>
                  <button 
                    onClick={() => setActiveTab("documentos")}
                    className={`pb-3 px-1 font-semibold text-sm border-b-2 transition-colors ${activeTab === "documentos" ? "border-blue-600 text-blue-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    Documentos (CV y Audición)
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
                   {activeTab === "documentos" && (
                     <>
                       {driveAudioId && (
                         <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 shrink-0">
                           <h4 className="font-semibold mb-3 text-slate-700 text-sm uppercase tracking-wider">Audición de Voz</h4>
                           <audio src={`/api/proxy/drive?id=${driveAudioId}`} controls className="w-full" />
                         </div>
                       )}

                       {driveCvId ? (
                         <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col relative min-h-[400px]">
                           <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Curriculum Vitae</h4>
                             <a 
                               href={`/api/proxy/drive?id=${driveCvId}`} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                               Abrir a pantalla completa
                             </a>
                           </div>
                           <iframe src={`/api/proxy/drive?id=${driveCvId}`} className="w-full flex-1 border rounded bg-slate-50" title="CV Candidato" />
                         </div>
                       ) : (
                         <div className="text-slate-500 italic p-4 bg-white rounded-lg border flex-1 flex items-center justify-center">El candidato no adjuntó un archivo CV.</div>
                       )}
                     </>
                   )}

                   {activeTab === "perfil" && detalles && (
                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-8 h-max">
                       <div>
                         <h4 className="font-bold text-slate-800 text-lg mb-2">Expectativas de Renta</h4>
                         <p className="text-blue-700 font-semibold text-lg bg-blue-50 px-4 py-2 rounded-md inline-block border border-blue-100">{detalles.expectativas_renta || "No especificada."}</p>
                       </div>
                       
                       <hr className="border-slate-100" />

                       <div>
                         <h4 className="font-bold text-slate-800 text-lg mb-2">Experiencia Laboral</h4>
                         <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{detalles.experiencia_laboral || "No proporcionada."}</p>
                       </div>
                       
                       <hr className="border-slate-100" />
                       
                       <div>
                         <h4 className="font-bold text-slate-800 text-lg mb-2">Estudios y Formación</h4>
                         <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{detalles.estudios || "No proporcionada."}</p>
                       </div>

                       <hr className="border-slate-100" />
                       
                       <div>
                         <h4 className="font-bold text-slate-800 text-lg mb-4">Referencias Laborales</h4>
                         {(() => {
                            try {
                              const refs = JSON.parse(detalles.referencias || "[]");
                              if (!Array.isArray(refs) || refs.length === 0) return <p className="text-slate-500 italic text-sm">El candidato no añadió referencias.</p>;
                              return (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                  {refs.map((r: any, i: number) => (
                                    <div key={i} className="bg-slate-50 border p-4 rounded-md text-sm shadow-sm">
                                      <div className="font-bold text-slate-800 mb-2 truncate">{r.nombre}</div>
                                      <div className="text-slate-600 flex items-center gap-2 mb-1"><span className="text-lg">📧</span> {r.email}</div>
                                      <div className="text-slate-600 flex items-center gap-2"><span className="text-lg">📱</span> {r.telefono}</div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } catch(e) {
                              return <p className="text-red-500 text-sm">Error al leer preferencias.</p>;
                            }
                         })()}
                       </div>
                     </div>
                   )}
                </div>
              </div>

              {/* NOTAS Y COMENTARIOS (Columna Derecha 35%) */}
              <div className="w-[35%] flex flex-col bg-white">
                <div className="px-5 py-4 border-b bg-white shrink-0">
                  <h4 className="font-bold text-slate-800 text-lg">Notas Internas</h4>
                  <p className="text-xs text-slate-500">Historial de evaluación y comentarios.</p>
                </div>
                
                {/* Lista de Notas */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
                  {loadingNotas ? (
                    <div className="text-center text-slate-400 text-sm py-8">Cargando notas...</div>
                  ) : notas.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-8 italic border-2 border-dashed border-slate-200 rounded-lg">No hay notas registradas. Escribe la primera evaluación abajo.</div>
                  ) : (
                    notas.map((n) => (
                      <div key={n.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-200 text-sm relative">
                         <p className="text-slate-800 whitespace-pre-wrap">{n.texto}</p>
                         <div className="mt-2 flex justify-between items-center text-xs text-slate-400 border-t pt-2">
                           <span className="font-medium">{n.autor_email}</span>
                           <span>{new Date(n.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input de Nueva Nota */}
                <div className="p-4 bg-white border-t shrink-0">
                  <textarea 
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="Añade un comentario sobre este candidato..."
                    className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button 
                      onClick={handleAddNota} 
                      disabled={!nuevaNota.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      Añadir Nota
                    </Button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
