import { consultar } from '../backend/src/config/database.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar .env de forma robusta
const envPathBackend = path.join(process.cwd(), '.env');
const envPathRoot = path.join(process.cwd(), 'backend', '.env');

if (fs.existsSync(envPathBackend)) {
  dotenv.config({ path: envPathBackend });
} else if (fs.existsSync(envPathRoot)) {
  dotenv.config({ path: envPathRoot });
}

async function main() {
  try {
    // Buscar el script SQL relative a la ubicación del archivo
    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
    // En Windows, new URL().pathname puede empezar con '/C:/...', removemos la barra inicial si es necesario.
    let sqlPath = path.join(scriptDir, 'migracion_003_responsable_pago.sql');
    if (process.platform === 'win32' && sqlPath.startsWith('\\')) {
      sqlPath = sqlPath.substring(1);
    }
    
    // Fallback si la resolución de URL no funciona en Windows
    const filePath = fs.existsSync(sqlPath) 
      ? sqlPath 
      : path.join(process.cwd(), 'scripts', 'migracion_003_responsable_pago.sql');

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('Ejecutando migración de responsable_pago...');
    await consultar(sql);
    console.log('Migración 003 completada exitosamente.');
  } catch (error) {
    console.error('Error al ejecutar migración 003:', error);
  } finally {
    process.exit(0);
  }
}

main();
