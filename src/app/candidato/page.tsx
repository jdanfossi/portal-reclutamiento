export default function CandidatePortalPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-6">Portal del Candidato</h1>
      <p className="text-lg text-slate-600 max-w-2xl text-center">
        Esta es tu zona privada. Aquí podrás ver el estado de tus postulaciones, subir tu CV y grabar tus audiciones de voz requeridas para los perfiles de Clínica Avaria.
      </p>
      {/* TODO: Fetch user's applications joined with vacancies and display them */}
    </main>
  );
}
