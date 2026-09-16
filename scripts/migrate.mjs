/**
 * Aplica db/schema.sql no banco apontado por DATABASE_URL.
 *
 *   npm run db:migrate                 (lê .env.local — banco de desenvolvimento)
 *   DATABASE_URL=... npm run db:migrate (qualquer outro banco, ex.: produção)
 *
 * O esquema é idempotente, então rodar de novo não altera nada que já exista.
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definida. Rode `vercel env pull .env.local` antes.");
  process.exit(1);
}

const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: url });

await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query("select current_database() as db");
  console.log(`Esquema aplicado em ${rows[0].db}.`);
} finally {
  await client.end();
}
