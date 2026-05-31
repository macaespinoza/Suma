// =============================================================================
// SUMA — Middleware Manejador Global de Errores
// Centraliza el manejo de errores para respuestas consistentes y logging
// estructurado compatible con Google Cloud Logging.
// =============================================================================

/**
 * Clase de error personalizada para errores de la aplicación.
 * Permite lanzar errores con código HTTP y mensaje descriptivo.
 *
 * Uso: throw new ErrorApp('Condominio no encontrado.', 404);
 */
export class ErrorApp extends Error {
  /**
   * @param {string} mensaje - Mensaje descriptivo del error.
   * @param {number} codigoHttp - Código de estado HTTP (default: 500).
   * @param {object} [detalles] - Información adicional sobre el error.
   */
  constructor(mensaje, codigoHttp = 500, detalles = null) {
    super(mensaje);
    this.nombre = 'ErrorApp';
    this.codigoHttp = codigoHttp;
    this.detalles = detalles;
  }
}

/**
 * Middleware de manejo global de errores de Express.
 * Debe ser el ÚLTIMO middleware registrado en app.js.
 *
 * Características:
 * - Logging estructurado en JSON para Cloud Logging.
 * - Oculta detalles del stack en producción.
 * - Maneja errores de validación de Joi.
 * - Maneja errores de PostgreSQL (unique constraint, FK, etc.).
 *
 * @param {Error} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
export const manejarError = (error, req, res, _next) => {
  // --- Determinar código HTTP y mensaje ---
  let codigoHttp = error.codigoHttp || 500;
  let mensaje = error.message || 'Error interno del servidor.';
  let detalles = error.detalles || null;

  // Errores de validación de Joi → 400 Bad Request.
  if (error.isJoi || error.name === 'ValidationError') {
    codigoHttp = 400;
    mensaje = 'Error de validación en los datos enviados.';
    detalles = error.details?.map(d => ({
      campo: d.path?.join('.'),
      mensaje: d.message,
    }));
  }

  // Errores de PostgreSQL.
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        codigoHttp = 409;
        mensaje = 'Ya existe un registro con estos datos.';
        detalles = { restriccion: error.constraint };
        break;
      case '23503': // foreign_key_violation
        codigoHttp = 400;
        mensaje = 'Referencia a un registro que no existe.';
        detalles = { restriccion: error.constraint };
        break;
      case '22P02': // invalid_text_representation (UUID malformado en parámetro)
        codigoHttp = 400;
        mensaje = 'El identificador proporcionado no tiene un formato válido.';
        break;
      case '23514': // check_violation (incluye validación de RUT)
        codigoHttp = 400;
        mensaje = 'Los datos no cumplen las restricciones de validación.';
        detalles = { restriccion: error.constraint };
        break;
      default:
        break;
    }
  }

  // --- Logging estructurado (compatible con Cloud Logging severity levels) ---
  const entradaLog = {
    severity: codigoHttp >= 500 ? 'ERROR' : 'WARNING',
    mensaje: error.message,
    codigoHttp,
    ruta: `${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  };

  if (codigoHttp >= 500) {
    console.error(JSON.stringify(entradaLog));
  } else {
    console.warn(JSON.stringify(entradaLog));
  }

  // --- Respuesta al cliente ---
  res.status(codigoHttp).json({
    exito: false,
    error: {
      codigo: codigoHttp,
      mensaje,
      ...(detalles && { detalles }),
      // Solo incluir stack en desarrollo.
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    },
  });
};
