"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Referencia {
  nombre: string;
  email: string;
  telefono: string;
}

export default function DynamicReferences() {
  const [referencias, setReferencias] = useState<Referencia[]>([]);

  const handleAddReferencia = () => {
    setReferencias([...referencias, { nombre: "", email: "", telefono: "" }]);
  };

  const handleRemoveReferencia = (index: number) => {
    const newRefs = [...referencias];
    newRefs.splice(index, 1);
    setReferencias(newRefs);
  };

  const handleChange = (index: number, field: keyof Referencia, value: string) => {
    const newRefs = [...referencias];
    newRefs[index][field] = value;
    setReferencias(newRefs);
  };

  return (
    <div className="space-y-4">
      {/* Hidden input to pass to the Server Action / route handler */}
      <input type="hidden" name="referencias_json" value={JSON.stringify(referencias)} />

      {referencias.length === 0 && (
         <p className="text-sm text-slate-500 italic mb-2">
           No has añadido referencias. (Opcional, pero muy recomendado)
         </p>
      )}

      {referencias.map((ref, index) => (
        <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-md relative flex flex-col gap-4 sm:flex-row">
          <button 
            type="button" 
            onClick={() => handleRemoveReferencia(index)}
            className="absolute -top-3 -right-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs"
            title="Quitar Referencia"
          >
            &times;
          </button>
          
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              required 
              value={ref.nombre}
              onChange={(e) => handleChange(index, "nombre", e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="Ej: María Gómez"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={ref.email}
              onChange={(e) => handleChange(index, "email", e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="Ej: maria@empresa.com"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
            <input 
              type="tel" 
              required
              value={ref.telefono}
              onChange={(e) => handleChange(index, "telefono", e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="+569XXXXXXXX"
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={handleAddReferencia} className="text-blue-600 border-blue-600 hover:bg-blue-50">
        + Añadir Referencia
      </Button>
    </div>
  );
}
