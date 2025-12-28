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

// =============================================================================
// HIPAA-COMPLIANT DATABASE CONNECTION
// =============================================================================
// - SSL/TLS encryption for data in transit (configured below)
// - Neon PostgreSQL encrypts data at rest by default using AES-256
// - Connection pooling with secure defaults

const isProduction = process.env.NODE_ENV === 'production';
const isLocalDb = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

// Use standard pg driver for better connection stability
// Neon serverless WebSocket can be unreliable
console.log(`[DB] Using standard PostgreSQL connection ${isLocalDb ? '(local, no SSL)' : 'with SSL'}`);
const pg = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');

pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // SSL/TLS configuration - disabled for local development
  ssl: isLocalDb
    ? false // No SSL for local PostgreSQL
    : isProduction
      ? { rejectUnauthorized: true } // Strict certificate validation in production
      : { rejectUnauthorized: false }, // Allow self-signed certs in development
});

db = drizzle(pool, { schema });

export { pool, db };
