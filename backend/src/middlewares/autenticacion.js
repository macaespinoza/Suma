// =============================================================================
// SUMA — Middleware de Autenticación (Firebase JWT)
// Verifica el token Bearer de Firebase Authentication.
// Adjunta el usuario decodificado a req.usuario para uso en controladores.
// =============================================================================

import { authAdmin } from '../config/firebase.js';

/**
 * Middleware que verifica el token JWT de Firebase.
 * Extrae el token del header Authorization: Bearer <token>.
 *
 * Si es válido, adjunta a req.usuario:
 *   - uid: UID de Firebase
 *   - email: Email del usuario
 *   - (otros claims del token)
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const verificarAutenticacion = async (req, res, next) => {
  try {
    const encabezadoAuth = req.headers.authorization;

    if (!encabezadoAuth || !encabezadoAuth.startsWith('Bearer ')) {
      return res.status(401).json({
        exito: false,
        error: {
          codigo: 401,
          mensaje: 'Token de autenticación no proporcionado.',
        },
      });
    }

    const token = encabezadoAuth.split('Bearer ')[1];
    const tokenDecodificado = await authAdmin.verifyIdToken(token);

    // Adjuntamos los datos del usuario al request para uso posterior.
    req.usuario = {
      firebaseUid: tokenDecodificado.uid,
      email: tokenDecodificado.email,
      ...tokenDecodificado,
    };

    next();
  } catch (error) {
    // Firebase lanza errores específicos para tokens inválidos o expirados.
    const mensajeError = error.code === 'auth/id-token-expired'
      ? 'Token expirado. Por favor, inicia sesión nuevamente.'
      : 'Token de autenticación inválido.';

    return res.status(401).json({
      exito: false,
      error: {
        codigo: 401,
        mensaje: mensajeError,
      },
    });
  }
};

/**
 * Middleware de autorización por rol.
 * Debe usarse DESPUÉS de verificarAutenticacion.
 * Verifica que el usuario tenga uno de los roles permitidos.
 *
 * Uso: router.get('/ruta', verificarAutenticacion, verificarRol('admin', 'propietario'), controlador)
 *
 * @param  {...string} rolesPermitidos - Roles que pueden acceder al recurso.
 * @returns {import('express').RequestHandler}
 */
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    // El rol del usuario se obtiene de la base de datos, no del token.
    // Open Code deberá completar esta lógica consultando la tabla Usuarios.
    if (!req.usuarioBD || !rolesPermitidos.includes(req.usuarioBD.rol)) {
      return res.status(403).json({
        exito: false,
        error: {
          codigo: 403,
          mensaje: 'No tienes permisos para acceder a este recurso.',
        },
      });
    }
    next();
  };
};
