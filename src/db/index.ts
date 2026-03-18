import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const dbUrl = process.env.TURSO_DATABASE_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl && process.env.NODE_ENV === "production") {
  console.warn("⚠️ ALERTA DE BUILD: TURSO_DATABASE_URL es undefined. Se usará una URL temporal aislada para permitir que Vercel compile exitosamente.");
}

const client = createClient({
  url: dbUrl || "libsql://dummy-deploy-bypass.turso.io",
  authToken: dbToken || "dummy-token",
});

export const db = drizzle(client, { schema });
