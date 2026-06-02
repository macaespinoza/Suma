import { consultar } from '../backend/src/config/database.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from backend
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

async function main() {
  try {
    const filePath = path.join(process.cwd(), 'scripts', 'migracion_002_metros_cuadrados.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('Ejecutando migración...');
    await consultar(sql);
    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error al ejecutar migración:', error);
  } finally {
    process.exit(0);
  }
}

main();
