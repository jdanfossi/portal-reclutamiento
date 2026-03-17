-- Tabla de Vacantes
CREATE TABLE vacantes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  requisitos TEXT,
  estado TEXT DEFAULT 'abierta', -- abierta, cerrada, pausada
  script_audio TEXT,            -- Lo que debe leer en la audición
  preguntas_json TEXT,          -- Configuración de preguntas (JSON)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Candidatos
CREATE TABLE candidatos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  telefono TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Postulaciones
CREATE TABLE postulaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidato_id TEXT,
  vacante_id TEXT,
  estado_postulacion TEXT DEFAULT 'pendiente', -- pendiente, visto, descartado, entrevista
  score_cuestionario INTEGER,
  drive_cv_id TEXT,
  drive_audio_id TEXT,
  fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(candidato_id) REFERENCES candidatos(id),
  FOREIGN KEY(vacante_id) REFERENCES vacantes(id)
);
