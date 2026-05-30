// =============================================================================
// SUMA — Middleware de Validación con Joi
// Wrapper genérico que valida req.body, req.params o req.query
// contra un esquema Joi proporcionado.
// =============================================================================

/**
 * Factory de middleware de validación.
 * Recibe un esquema Joi y la fuente de datos a validar.
 *
 * Uso en rutas:
 *   import { validar } from '../middlewares/validacion.js';
 *   import { esquemaCrearCondominio } from '../validaciones/condominios.validacion.js';
 *
 *   router.post('/', validar(esquemaCrearCondominio, 'body'), controlador.crear);
 *   router.get('/:id', validar(esquemaIdUUID, 'params'), controlador.obtenerPorId);
 *
 * @param {import('joi').ObjectSchema} esquema - Esquema Joi para validar.
 * @param {'body'|'params'|'query'} fuente - De dónde extraer los datos (default: 'body').
 * @returns {import('express').RequestHandler}
 */
export const validar = (esquema, fuente = 'body') => {
  return (req, res, next) => {
    const { error, value } = esquema.validate(req[fuente], {
      abortEarly: false,      // Reportar TODOS los errores, no solo el primero.
      stripUnknown: true,      // Eliminar campos no definidos en el esquema.
      errors: {
        wrap: { label: false }, // No envolver nombres de campo en comillas.
      },
    });

    if (error) {
      return res.status(400).json({
        exito: false,
        error: {
          codigo: 400,
          mensaje: 'Error de validación en los datos enviados.',
          detalles: error.details.map(detalle => ({
            campo: detalle.path.join('.'),
            mensaje: detalle.message,
          })),
        },
      });
    }

    // Reemplazamos los datos originales con los validados y sanitizados.
    req[fuente] = value;
    next();
  };
};
