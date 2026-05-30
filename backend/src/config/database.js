// =============================================================================
// SUMA — Configuración de Conexión a PostgreSQL (Cloud SQL)
// Pool de conexiones optimizado para Cloud Run.
// =============================================================================

import pg from 'pg';

const { Pool } = pg;

/**
 * Configuración del pool de conexiones.
 * Soporta dos modos de conexión:
 *
 * 1. Desarrollo local: TCP directo → host:port
 * 2. Cloud Run (producción): Socket Unix → /cloudsql/PROYECTO:REGION:INSTANCIA
 */
const configuracionPool = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Conexión: Cloud SQL via socket Unix o TCP directo.
  ...(process.env.DB_CLOUD_SQL_CONNECTION_NAME
    ? { host: `/cloudsql/${process.env.DB_CLOUD_SQL_CONNECTION_NAME}` }
    : { host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT, 10) || 5432 }
  ),

  // Opciones de pool optimizadas para Cloud Run (scale-to-zero).
  max: parseInt(process.env.DB_POOL_MAX, 10) || 10,       // Máximo de conexiones en el pool.
  idleTimeoutMillis: 30_000,   // Tiempo antes de cerrar una conexión inactiva.
  connectionTimeoutMillis: 10_000, // Timeout de conexión (Cloud SQL puede tardar en cold start).
};

const pool = new Pool(configuracionPool);

// Logging de errores inesperados del pool (no rompe la app).
pool.on('error', (error) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', error.message);
});

/**
 * Ejecuta una consulta SQL preparada contra el pool.
 * Uso: const { rows } = await consultar('SELECT * FROM condominios WHERE id = $1', [id]);
 *
 * @param {string} texto - Query SQL con placeholders $1, $2, etc.
 * @param {Array} parametros - Valores para los placeholders.
 * @returns {Promise<pg.QueryResult>} Resultado de la query.
 */
export const consultar = (texto, parametros) => {
  return pool.query(texto, parametros);
};

/**
 * Obtiene un cliente individual del pool para transacciones.
 * Uso:
 *   const cliente = await obtenerCliente();
 *   try {
 *     await cliente.query('BEGIN');
 *     // ... operaciones ...
 *     await cliente.query('COMMIT');
 *   } catch (error) {
 *     await cliente.query('ROLLBACK');
 *     throw error;
 *   } finally {
 *     cliente.release();
 *   }
 *
 * @returns {Promise<pg.PoolClient>} Cliente del pool.
 */
export const obtenerCliente = () => {
  return pool.connect();
};

export default pool;
