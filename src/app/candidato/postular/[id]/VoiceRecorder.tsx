"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pendingBlobRef = useRef<Blob | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        pendingBlobRef.current = audioBlob;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioURL(null);
      setIsAccepted(false);
      pendingBlobRef.current = null;
      
      // Clear the hidden input if we restart recording
      const fileInput = document.getElementById("audio_upload_input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono. Por favor, asegúrate de dar los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const acceptRecording = () => {
    if (pendingBlobRef.current) {
      const file = new File([pendingBlobRef.current], "audicion.webm", { type: "audio/webm" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const fileInput = document.getElementById("audio_upload_input") as HTMLInputElement;
      if (fileInput) {
         fileInput.files = dataTransfer.files;
      }
      setIsAccepted(true);
    }
  };

  const clearRecording = () => {
    setAudioURL(null);
    setIsAccepted(false);
    pendingBlobRef.current = null;
    const fileInput = document.getElementById("audio_upload_input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="bg-slate-100 p-6 rounded-lg border border-slate-300 flex flex-col items-center">
      
      {/* Recording Controls */}
      {!audioURL && (
        <div className="mb-4">
          {!isRecording ? (
            <Button type="button" onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 shadow-md">
              🎤 Iniciar Grabación
            </Button>
          ) : (
            <Button type="button" onClick={stopRecording} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 shadow-md animate-pulse">
              ⏹ Detener Grabación
            </Button>
          )}
        </div>
      )}

      {isRecording && <div className="text-red-500 text-sm font-semibold tracking-wide animate-pulse mb-2">GRABANDO...</div>}

      {/* Review & Accept Controls */}
      {audioURL && (
        <div className="mt-4 w-full flex flex-col items-center gap-4">
           <audio src={audioURL} controls className="w-full max-w-sm" />
           
           {!isAccepted ? (
             <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
               <Button type="button" onClick={acceptRecording} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                 ✅ Aceptar Grabación
               </Button>
               <Button type="button" onClick={clearRecording} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                 🔄 Volver a Grabar
               </Button>
             </div>
           ) : (
             <div className="flex flex-col items-center gap-2 mt-2 w-full">
               <span className="text-sm text-green-700 font-semibold bg-green-100 px-4 py-2 rounded-md w-full max-w-sm text-center border border-green-200">
                 Grabación Confirmada y Adjuntada
               </span>
               <Button type="button" onClick={clearRecording} variant="ghost" className="text-slate-500 hover:text-slate-700 text-xs h-8">
                 Descartar y grabar de nuevo
               </Button>
             </div>
           )}
        </div>
      )}

      {/* Hidden input to hold the recorded file so the parent form can submit it directly */}
      <input type="file" name="audio" id="audio_upload_input" className="hidden" accept="audio/*" />
    </div>
  );
}
