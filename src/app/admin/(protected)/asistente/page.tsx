"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AsistenteAdminPage() {
  const [descripcion, setDescripcion] = useState("");
  const [horarios, setHorarios] = useState("");
  const [beneficios, setBeneficios] = useState("");
  const [sueldo, setSueldo] = useState("");
  const [tipo, setTipo] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion, horarios, beneficios, sueldo, tipo }),
      });

      if (!res.ok) {
        throw new Error("Error generating profile");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      setError("Hubo un error al conectar con Gemini. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mb-6">Asistente IA (Gemini)</h1>
        <p className="text-slate-600 mb-8 max-w-2xl">
          Describe brevemente el puesto que buscas. Gemini generará el título, la descripción profesional, los requisitos del cargo y sugerencias de preguntas de filtro.
        </p>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-2xl bg-white p-6 rounded-md shadow border">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Puesto</label>
            <textarea
              className="w-full h-24 p-2 border rounded-md shadow-sm text-slate-900"
              placeholder='Ej: "Kinesióloga con 2 años de experiencia en depilación láser, para la sucursal de Providencia."'
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Horarios</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md shadow-sm text-slate-900"
              placeholder='Ej: Lunes a Viernes 09:00 a 18:00, Sabados por medio, turnos rotativos...'
              value={horarios}
              onChange={(e) => setHorarios(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Beneficios</label>
            <textarea
              className="w-full p-2 border rounded-md shadow-sm text-slate-900"
              placeholder='Ej: Seguro complementario, bonos de cumplimiento, aguinaldos...'
              value={beneficios}
              onChange={(e) => setBeneficios(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sueldo / Renta Ofrecida</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md shadow-sm text-slate-900"
                placeholder='Ej: $800.000 líquidos'
                value={sueldo}
                onChange={(e) => setSueldo(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Sueldo</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md shadow-sm text-slate-900"
                placeholder='Ej: Fijo, Fijo + Variable, Por boleta...'
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading || !descripcion.trim()}>
            {loading ? "Generando..." : "Generar Perfil"}
          </Button>
        </form>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {result && typeof result === "object" && (
          <div className="bg-white p-6 rounded-md shadow border max-w-3xl">
            <h3 className="text-xl font-bold mb-2 text-emerald-700">{result.titulo}</h3>
            
            <div className="mb-4">
              <h4 className="font-semibold text-slate-800">Descripción del Cargo</h4>
              <p className="whitespace-pre-wrap text-slate-700 mt-1">{result.descripcion}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-slate-800">Requisitos</h4>
              <p className="whitespace-pre-wrap text-slate-700 mt-1">{result.requisitos}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-slate-800">Preguntas de Filtro Sugeridas</h4>
              <ul className="list-disc pl-5 mt-1 text-slate-700">
                {result.preguntas_filtro?.map((q: any, i: number) => (
                  <li key={i}>{q.pregunta} <span className="text-xs text-slate-400">({q.tipo})</span></li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-4">
              <Button 
                onClick={() => {
                  const combinedRemuneracion = sueldo && tipo ? `${sueldo} (${tipo})` : (sueldo || tipo || "");
                  const finalPayload = {
                    ...result,
                    horarios: horarios || "",
                    beneficios: beneficios || "",
                    remuneracion: combinedRemuneracion
                  };
                  localStorage.setItem("gemini_vacancy_profile", JSON.stringify(finalPayload));
                  window.location.href = "/admin/vacantes/nueva";
                }}
              >
                Crear Vacante con este Perfil
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
