// =============================================================================
// SUMA — Rutas de Gastos Comunes
// Endpoints para la gestión de gastos, egresos y cobranza del portal administrativo.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/gastos.controlador.js';
import { validar } from '../middlewares/validacion.js';
import {
  esquemaCrearGasto,
  esquemaActualizarGasto,
  esquemaAgregarEgreso,
  esquemaActualizarEstadoCobro
} from '../validaciones/gastos.validacion.js';

const router = Router();

router.get('/:id/gastos', controlador.listar);

router.post('/:id/gastos', validar(esquemaCrearGasto, 'body'), controlador.crear);

router.get('/:condominioId/gastos/:gastoId', controlador.obtenerDetalle);

router.patch('/:condominioId/gastos/:gastoId', validar(esquemaActualizarGasto, 'body'), controlador.actualizar);

router.delete('/:condominioId/gastos/:gastoId', controlador.eliminar);

router.post('/:condominioId/gastos/:gastoId/publicar', controlador.publicar);

router.get('/:condominioId/gastos/:gastoId/egresos', controlador.listarEgresos);

router.post('/:condominioId/gastos/:gastoId/egresos', validar(esquemaAgregarEgreso, 'body'), controlador.agregarEgreso);

router.get('/:condominioId/gastos/:gastoId/cobros', controlador.listarCobros);

router.get('/:condominioId/cobros/:cobroId', controlador.obtenerDetalleCobro);

router.patch('/:condominioId/cobros/:cobroId/estado', validar(esquemaActualizarEstadoCobro, 'body'), controlador.actualizarEstadoCobro);

export default router;
