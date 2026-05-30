// =============================================================================
// SUMA — Enrutador Principal
// Monta todos los sub-enrutadores bajo /api/v1.
// =============================================================================

import { Router } from 'express';
import rutasCondominios from './condominios.rutas.js';
import rutasUnidades from './unidades.rutas.js';
import rutasUsuarios from './usuarios.rutas.js';

const enrutador = Router();

// --- Montaje de módulos ---
enrutador.use('/condominios', rutasCondominios);
enrutador.use('/unidades', rutasUnidades);
enrutador.use('/usuarios', rutasUsuarios);

// Ruta informativa de la API.
enrutador.get('/', (_req, res) => {
  res.json({
    exito: true,
    datos: {
      nombre: 'SUMA API',
      version: 'v1',
      descripcion: 'Plataforma PropTech de Gestión y Cohesión Comunitaria — Arica, Chile.',
      modulos: {
        core: '/api/v1/condominios, /api/v1/unidades, /api/v1/usuarios',
        admin: '(próximamente) /api/v1/gastos, /api/v1/cobros, /api/v1/pagos',
        comunidad: '(próximamente) /api/v1/publicaciones, /api/v1/eventos, /api/v1/mascotas',
      },
    },
  });
});

export default enrutador;
