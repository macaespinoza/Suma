// =============================================================================
// SUMA — Enrutador Principal
// Monta todos los sub-enrutadores bajo /api/v1.
// =============================================================================

import { Router } from 'express';
import rutasCondominios from './condominios.rutas.js';
import rutasUnidades from './unidades.rutas.js';
import rutasUsuarios from './usuarios.rutas.js';
import rutasGastos from './gastos.rutas.js';
import rutasPagos from './pagos.rutas.js';
import rutasDashboard from './dashboard.rutas.js';
import rutasPasarelas from './pasarelas.rutas.js';

const enrutador = Router();

enrutador.use('/condominios', rutasCondominios);
enrutador.use('/unidades', rutasUnidades);
enrutador.use('/usuarios', rutasUsuarios);
enrutador.use('/condominios', rutasGastos);
enrutador.use('/condominios', rutasPagos);
enrutador.use('/condominios', rutasDashboard);
enrutador.use('/condominios', rutasPasarelas);

enrutador.get('/', (_req, res) => {
  res.json({
    exito: true,
    datos: {
      nombre: 'SUMA API',
      version: 'v1',
      descripcion: 'Plataforma PropTech de Gestión y Cohesión Comunitaria — Arica, Chile.',
      modulos: {
        core: '/api/v1/condominios, /api/v1/unidades, /api/v1/usuarios',
        admin: '/api/v1/condominios/:id/gastos, /api/v1/condominios/:id/cobros, /api/v1/condominios/:id/pagos',
        comunidad: '(próximamente) /api/v1/publicaciones, /api/v1/eventos, /api/v1/mascotas',
      },
    },
  });
});

export default enrutador;
