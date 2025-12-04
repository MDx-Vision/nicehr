import { createRequire } from 'module';
import * as schema from "@shared/schema";

const require = createRequire(import.meta.url);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db: any;
let pool: any;

// Use standard pg driver for better connection stability
// Neon serverless WebSocket can be unreliable
console.log('[DB] Using standard PostgreSQL connection');
const pg = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
db = drizzle(pool, { schema });

export { pool, db };
