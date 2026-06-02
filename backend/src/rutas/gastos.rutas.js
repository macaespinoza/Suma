// =============================================================================
// SUMA — Rutas de Gastos Comunes
// Endpoints para la gestión de gastos, egresos y cobranza del portal administrativo.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/gastos.controlador.js';
import * as importacionControlador from '../controladores/importacionExcel.controlador.js';
import upload from '../middlewares/upload.js';
import uploadRespaldo from '../middlewares/uploadRespaldo.js';
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

router.get('/:condominioId/gastos/:gastoId/liquidacion', controlador.generarLiquidacionPdf);

router.get('/:condominioId/gastos/:gastoId', controlador.obtenerDetalle);

router.patch('/:condominioId/gastos/:gastoId', validar(esquemaActualizarGasto, 'body'), controlador.actualizar);

router.delete('/:condominioId/gastos/:gastoId', controlador.eliminar);

router.post('/:condominioId/gastos/:gastoId/publicar', controlador.publicar);

router.post('/:condominioId/gastos/:gastoId/despublicar', controlador.despublicar);

router.post('/:condominioId/gastos/:gastoId/egresos/importar',
  upload.single('archivo'),
  importacionControlador.parsearYPreview
);

router.post('/:condominioId/gastos/:gastoId/egresos/importar/confirmar',
  importacionControlador.confirmarImportacion
);

router.post('/:condominioId/gastos/:gastoId/subir-respaldo',
  uploadRespaldo.single('archivo'),
  controlador.subirRespaldo
);

router.get('/:condominioId/gastos/:gastoId/egresos', controlador.listarEgresos);

router.post('/:condominioId/gastos/:gastoId/egresos', validar(esquemaAgregarEgreso, 'body'), controlador.agregarEgreso);

router.patch('/:condominioId/gastos/:gastoId/egresos/:egresoId', validar(esquemaAgregarEgreso, 'body'), controlador.actualizarEgreso);

router.delete('/:condominioId/gastos/:gastoId/egresos/:egresoId', controlador.eliminarEgreso);

router.get('/:condominioId/gastos/:gastoId/cobros', controlador.listarCobros);


router.get('/:condominioId/cobros/:cobroId', controlador.obtenerDetalleCobro);

router.patch('/:condominioId/cobros/:cobroId/estado', validar(esquemaActualizarEstadoCobro, 'body'), controlador.actualizarEstadoCobro);

export default router;
