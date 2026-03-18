"use client";

import { updateVacante } from "@/actions/vacantes";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { type vacantes } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Vacante = InferSelectModel<typeof vacantes>;

// Using simple SVG icons to replicate the Phosphor icons from Stitch
const IconFilePlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18l4-4-4-4"></path><path d="M8 14h8"></path></svg>
);
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconClipboardText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 mb-2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="9" y1="14" x2="15" y2="14"></line><line x1="9" y1="18" x2="15" y2="18"></line><line x1="9" y1="10" x2="15" y2="10"></line></svg>
);
const IconUserList = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 mb-2"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
);


export default function EditarVacanteForm({
    vacante,
    preguntasIniciales
}: {
    vacante: Vacante,
    preguntasIniciales: { pregunta: string; tipo: string }[]
}) {
  const [titulo, setTitulo] = useState(vacante.titulo || "");
  const [descripcion, setDescripcion] = useState(vacante.descripcion || "");
  const [beneficios, setBeneficios] = useState(vacante.beneficios || "");
  const [horarios, setHorarios] = useState(vacante.horarios || "");
  const [remuneracion, setRemuneracion] = useState(vacante.remuneracion || "");
  const [requisitos, setRequisitos] = useState(vacante.requisitos || "");
  const [scriptAudio, setScriptAudio] = useState(vacante.script_audio || "");
  const [estado, setEstado] = useState(vacante.estado || "abierta");
  const [preguntas, setPreguntas] = useState<{ pregunta: string; tipo: string }[]>(preguntasIniciales);

  // Bind the server action using the pre-filled ID
  const updateVacanteWithId = updateVacante.bind(null, vacante.id);

  const handleAddQuestion = () => {
    setPreguntas([...preguntas, { pregunta: "", tipo: "texto" }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newPreguntas = [...preguntas];
    newPreguntas.splice(index, 1);
    setPreguntas(newPreguntas);
  };

  const handleQuestionChange = (index: number, field: "pregunta" | "tipo", value: string) => {
    const newPreguntas = [...preguntas];
    newPreguntas[index][field] = value;
    setPreguntas(newPreguntas);
  };

  return (
    <>
      <div className="bg-[#dce5ed]/80 backdrop-blur-md shadow-2xl rounded-2xl p-8">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-800 text-white rounded-lg shadow-sm">
             <IconFilePlus />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Editar Vacante: <span className="font-light truncate max-w-[200px] overflow-hidden">{vacante.titulo}</span></h2>
        </div>
        
        <form action={updateVacanteWithId}>
          {/* Section 1 */}
          <section className="flex flex-col md:flex-row bg-[#e6edf3] rounded-xl overflow-hidden mb-4 shadow-sm border border-slate-200/50">
            <div className="md:w-1/4 bg-[#d8e3ee] p-6 flex flex-col items-center justify-center text-center">
               <IconFileText />
               <h3 className="font-medium text-slate-800 leading-tight">Información<br/>del Cargo</h3>
            </div>
            <div className="md:w-3/4 p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del Cargo</label>
                <input 
                  name="titulo" 
                  type="text" 
                  required 
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500" 
                  placeholder="Ej: Kinesióloga Providencia" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea 
                  name="descripcion" 
                  rows={4} 
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500" 
                  placeholder="Descripción general del puesto..." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horarios</label>
                <textarea 
                  name="horarios" 
                  rows={2} 
                  value={horarios}
                  onChange={(e) => setHorarios(e.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500" 
                  placeholder="Ej: Lunes a Viernes de 9:00 a 18:00 hrs..." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beneficios</label>
                <textarea 
                  name="beneficios" 
                  rows={3} 
                  value={beneficios}
                  onChange={(e) => setBeneficios(e.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500" 
                  placeholder="Ej: Seguro complementario de salud, bonos por desempeño..." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Remuneración</label>
                <input 
                  name="remuneracion" 
                  type="text" 
                  value={remuneracion}
                  onChange={(e) => setRemuneracion(e.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500" 
                  placeholder="Ej: $800.000 (Fijo + Variable)" 
                />
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col md:flex-row bg-[#e6edf3] rounded-xl overflow-hidden mb-4 shadow-sm border border-slate-200/50">
            <div className="md:w-1/4 bg-[#d8e3ee] p-6 flex flex-col items-center justify-center text-center">
               <IconClipboardText />
               <h3 className="font-medium text-slate-800 leading-tight">Requisitos y<br/>Estado</h3>
            </div>
            <div className="md:w-3/4 p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requisitos</label>
                <textarea 
                  name="requisitos" 
                  rows={4} 
                  value={requisitos}
                  onChange={(e) => setRequisitos(e.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500" 
                  placeholder="- 2 años de experiencia..." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select name="estado" value={estado} onChange={e => setEstado(e.target.value)} className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500">
                  <option value="abierta">Abierta (Pública)</option>
                  <option value="pausada">Pausada (Oculta)</option>
                  <option value="cerrada">Cerrada (Finalizada)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col md:flex-row bg-[#e6edf3] rounded-xl overflow-hidden mb-6 shadow-sm border border-slate-200/50">
            <div className="md:w-1/4 bg-[#d8e3ee] p-6 flex flex-col items-center justify-center text-center">
               <IconUserList />
               <h3 className="font-medium text-slate-800 leading-tight">Evaluación del<br/>Candidato</h3>
            </div>
            <div className="md:w-3/4 p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instrucciones de Audición Libre (Opcional)</label>
                <textarea 
                  name="script_audio" 
                  rows={2} 
                  value={scriptAudio}
                  onChange={(e) => setScriptAudio(e.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500" 
                  placeholder="Ej: Preséntate brevemente y cuéntanos en 45 segundos por qué eres ideal para este puesto..." 
                />
                <p className="text-xs text-slate-500 mt-1">Si dejas esto vacío, no se requerirá audio al postular.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preguntas de Filtro Específicas</label>
                {preguntas.map((q, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 mb-3 items-start sm:items-center">
                    <input 
                      type="text" 
                      value={q.pregunta}
                      onChange={(e) => handleQuestionChange(idx, "pregunta", e.target.value)}
                      placeholder="Redacta la pregunta..."
                      className="flex-1 w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500"
                      required
                    />
                    <select 
                      value={q.tipo}
                      onChange={(e) => handleQuestionChange(idx, "tipo", e.target.value)}
                      className="rounded-md border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-slate-500"
                    >
                      <option value="texto">Respuesta Corta</option>
                      <option value="sn">Sí / No</option>
                    </select>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleRemoveQuestion(idx)}
                    >
                      X
                    </Button>
                  </div>
                ))}

                <button 
                  type="button" 
                  onClick={handleAddQuestion} 
                  className="inline-flex items-center gap-2 px-4 py-2 mt-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  + Agregar Pregunta
                </button>
                <input type="hidden" name="preguntas_json" value={JSON.stringify(preguntas)} />
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/admin/vacantes" className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
              Cancelar
            </Link>
            <button type="submit" className="px-6 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
