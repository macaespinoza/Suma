// =============================================================================
// SUMA — Entry Point del Servidor
// Carga las variables de entorno y arranca Express en el puerto configurado.
// Separado de app.js para permitir testing sin levantar el servidor.
// =============================================================================

import 'dotenv/config';
import app from './app.js';

const PUERTO = process.env.PORT || 3001;

app.listen(PUERTO, () => {
  console.log(`✅ SUMA Backend corriendo en puerto ${PUERTO}`);
  console.log(`📌 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
