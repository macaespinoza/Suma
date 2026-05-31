// =============================================================================
// SUMA — Rutas de Dashboard
// Endpoints para el resumen financiero del condominio.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/dashboard.controlador.js';

const router = Router();

router.get(
  '/:condominioId/dashboard/financiero',
  controlador.obtenerResumenFinanciero
);

export default router;
