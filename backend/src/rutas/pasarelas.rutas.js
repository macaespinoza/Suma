// =============================================================================
// SUMA — Rutas de Pasarelas de Pago
// Endpoints para gestionar credenciales de pasarelas de pago.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/pasarelas.controlador.js';

const router = Router();

router.get(
  '/:condominioId/pasarelas',
  controlador.listar
);

router.post(
  '/:condominioId/pasarelas',
  controlador.guardarCredenciales
);

router.patch(
  '/:condominioId/pasarelas/:pasarelaId',
  controlador.cambiarEstado
);

export default router;
