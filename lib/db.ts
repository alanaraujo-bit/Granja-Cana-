import "server-only";
import { Pool } from "pg";

/**
 * Pool único por instância. Na Vercel (Fluid Compute) a mesma instância
 * atende várias requisições, então poucas conexões bastam — e o Postgres da
 * Railway tem limite de conexões compartilhado entre todas elas.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

export const db =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10_000,
    // Banco fora do ar precisa virar erro rápido no checkout, não um botão
    // girando para sempre.
    connectionTimeoutMillis: 5_000,
  });

// Em desenvolvimento o módulo é recarregado a cada edição; sem isto cada
// recarga abriria um pool novo.
if (process.env.NODE_ENV !== "production") globalForDb.pool = db;
