// =============================================================================
// SUMA — Rutas de Usuarios
// Endpoints CRUD para gestión de usuarios y verificación de autenticación.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/usuarios.controlador.js';
// import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validacion.js';
import {
  esquemaCrearUsuario,
  esquemaActualizarUsuario,
  esquemaVerificarUsuario,
} from '../validaciones/usuarios.validacion.js';

const router = Router();

/**
 * GET /api/v1/usuarios
 * Lista todos los usuarios activos.
 */
router.get('/', controlador.listar);

/**
 * GET /api/v1/usuarios/:id
 * Obtiene un usuario por su ID.
 */
router.get('/:id', controlador.obtenerPorId);

/**
 * POST /api/v1/usuarios
 * Registra un nuevo usuario (vinculado a Firebase Auth).
 */
router.post('/', validar(esquemaCrearUsuario, 'body'), controlador.crear);

/**
 * PUT /api/v1/usuarios/:id
 * Actualiza los datos de un usuario.
 */
router.put('/:id', validar(esquemaActualizarUsuario, 'body'), controlador.actualizar);

/**
 * DELETE /api/v1/usuarios/:id
 * Elimina lógicamente un usuario (soft delete con deleted_at).
 */
router.delete('/:id', controlador.eliminar);

/**
 * POST /api/v1/usuarios/verificar
 * Verifica un token de Firebase y retorna/crea el usuario en PostgreSQL.
 * Este es el endpoint principal para el flujo de login.
 */
router.post('/verificar', validar(esquemaVerificarUsuario, 'body'), controlador.verificar);

export default router;
