// =============================================================================
// SUMA — Rutas de Pagos
// Endpoints para gestión de pagos manuales y transacciones de pasarela.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/pagos.controlador.js';
import { validar } from '../middlewares/validacion.js';
import { esquemaIniciarTransaccion, esquemaWebhook } from '../validaciones/pagos.validacion.js';
import { esquemaRegistrarPago } from '../validaciones/gastos.validacion.js';

const router = Router();

router.post(
  '/:condominioId/cobros/:cobroId/pagos',
  validar(esquemaRegistrarPago, 'body'),
  controlador.registrarPagoManual
);

router.get(
  '/:condominioId/pagos',
  controlador.listarPagos
);

router.post(
  '/:condominioId/cobros/:cobroId/transacciones',
  validar(esquemaIniciarTransaccion, 'body'),
  controlador.iniciarTransaccion
);

router.get(
  '/:condominioId/transacciones/:transaccionId',
  controlador.obtenerDetalleTransaccion
);

router.post(
  '/webhooks/pagos/:pasarela',
  validar(esquemaWebhook, 'body'),
  controlador.procesarWebhook
);

export default router;
