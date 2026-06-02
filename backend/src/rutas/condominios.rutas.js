// =============================================================================
// SUMA — Rutas de Condominios
// Endpoints CRUD para la entidad raíz del sistema.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/condominios.controlador.js';
import * as unidadesControlador from '../controladores/unidades.controlador.js';
// import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validacion.js';
import { esquemaCrearCondominio, esquemaActualizarCondominio } from '../validaciones/condominios.validacion.js';
import { esquemaActualizarDatosBase, esquemaTitular, esquemaVehiculo, esquemaMascota } from '../validaciones/unidades.validacion.js';

const router = Router();

/**
 * GET /api/v1/condominios
 * Lista todos los condominios activos.
 */
router.get('/', controlador.listar);

/**
 * GET /api/v1/condominios/:id
 * Obtiene un condominio por su ID.
 */
router.get('/:id', controlador.obtenerPorId);

/**
 * POST /api/v1/condominios
 * Crea un nuevo condominio.
 */
router.post('/', validar(esquemaCrearCondominio, 'body'), controlador.crear);

/**
 * PUT /api/v1/condominios/:id
 * Actualiza un condominio existente.
 */
router.put('/:id', validar(esquemaActualizarCondominio, 'body'), controlador.actualizar);

/**
 * DELETE /api/v1/condominios/:id
 * Desactiva un condominio (eliminación lógica).
 */
router.delete('/:id', controlador.desactivar);

/**
 * GET /api/v1/condominios/:id/unidades
 * Lista las unidades vecinales de un condominio específico.
 */
router.get('/:id/unidades', controlador.listarUnidades);

/**
 * GET /api/v1/condominios/:condominioId/unidades/preview-alicuotas
 * Genera vista previa de alícuotas por m2.
 */
router.get('/:condominioId/unidades/preview-alicuotas', unidadesControlador.previewAlicuotas);

/**
 * POST /api/v1/condominios/:condominioId/unidades/aplicar-alicuotas
 * Aplica el cálculo de alícuotas por m2 a las unidades del condominio.
 */
router.post('/:condominioId/unidades/aplicar-alicuotas', unidadesControlador.aplicarAlicuotas);

// =============================================================================
// Ficha Administrativa de Unidades — Rutas Anidadas
// =============================================================================

/**
 * GET /api/v1/condominios/:condominioId/unidades/:unidadId
 * Obtiene el detalle completo de una unidad (datos base + titulares + vehículos + mascotas).
 */
router.get('/:condominioId/unidades/:unidadId', unidadesControlador.obtenerDetalleCompleto);

/**
 * PUT /api/v1/condominios/:condominioId/unidades/:unidadId
 * Actualiza los datos base de una unidad (estacionamiento, bodega).
 */
router.put('/:condominioId/unidades/:unidadId', validar(esquemaActualizarDatosBase, 'body'), unidadesControlador.actualizarDatosBase);

/**
 * POST /api/v1/condominios/:condominioId/unidades/:unidadId/titulares
 * Añade o reemplaza un titular (propietario o arrendatario).
 */
router.post('/:condominioId/unidades/:unidadId/titulares', validar(esquemaTitular, 'body'), unidadesControlador.agregarTitular);

/**
 * DELETE /api/v1/condominios/:condominioId/unidades/:unidadId/titulares/:titularId
 * Elimina administrativamente a un titular de la unidad.
 */
router.delete('/:condominioId/unidades/:unidadId/titulares/:titularId', unidadesControlador.eliminarTitular);

/**
 * POST /api/v1/condominios/:condominioId/unidades/:unidadId/vehiculos
 * Añade un vehículo a la unidad.
 */
router.post('/:condominioId/unidades/:unidadId/vehiculos', validar(esquemaVehiculo, 'body'), unidadesControlador.agregarVehiculo);

/**
 * DELETE /api/v1/condominios/:condominioId/unidades/:unidadId/vehiculos/:vehiculoId
 * Elimina un vehículo de la unidad.
 */
router.delete('/:condominioId/unidades/:unidadId/vehiculos/:vehiculoId', unidadesControlador.eliminarVehiculo);

/**
 * POST /api/v1/condominios/:condominioId/unidades/:unidadId/mascotas
 * Añade una mascota a la unidad.
 */
router.post('/:condominioId/unidades/:unidadId/mascotas', validar(esquemaMascota, 'body'), unidadesControlador.agregarMascota);

/**
 * DELETE /api/v1/condominios/:condominioId/unidades/:unidadId/mascotas/:mascotaId
 * Elimina una mascota de la unidad.
 */
router.delete('/:condominioId/unidades/:unidadId/mascotas/:mascotaId', unidadesControlador.eliminarMascota);

export default router;
