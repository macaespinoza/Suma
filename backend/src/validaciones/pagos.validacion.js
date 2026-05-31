// =============================================================================
// SUMA — Esquemas de Validación Joi para Pagos
// Validación de datos de entrada en los endpoints de pagos y transacciones.
// =============================================================================

import Joi from 'joi';

const PASARELAS_VALIDAS = ['flow', 'fintoc', 'mercado_pago'];

export const esquemaIniciarTransaccion = Joi.object({
  pasarela: Joi.string()
    .valid(...PASARELAS_VALIDAS)
    .required()
    .messages({
      'any.only': `La pasarela debe ser una de: ${PASARELAS_VALIDAS.join(', ')}.`,
      'any.required': 'La pasarela es obligatoria.',
    }),

  url_retorno: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'La URL de retorno debe ser una URL válida.',
      'any.required': 'La URL de retorno es obligatoria.',
    }),

  url_cancelar: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'La URL de cancelación debe ser una URL válida.',
      'any.required': 'La URL de cancelación es obligatoria.',
    }),
});

export const esquemaWebhook = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'El token de transacción es obligatorio.',
    }),

  status: Joi.number()
    .integer()
    .min(1)
    .max(4)
    .required()
    .messages({
      'number.base': 'El estado debe ser un número.',
      'number.min': 'El estado debe estar entre 1 y 4.',
      'number.max': 'El estado debe estar entre 1 y 4.',
      'any.required': 'El estado es obligatorio.',
    }),

  amount: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.positive': 'El monto debe ser mayor a 0.',
    }),

  currency: Joi.string()
    .optional()
    .messages({
      'string.base': 'La moneda debe ser un texto.',
    }),

  order: Joi.string()
    .optional()
    .messages({
      'string.base': 'El ID de la orden debe ser un texto.',
    }),

  environment: Joi.string()
    .valid('production', 'integration')
    .optional()
    .messages({
      'any.only': 'El entorno debe ser production o integration.',
    }),
});
