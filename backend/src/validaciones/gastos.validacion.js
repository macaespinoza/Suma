// =============================================================================
// SUMA — Esquemas de Validación Joi para Gastos Comunes
// Validación de datos de entrada en los endpoints del portal administrativo.
// =============================================================================

import Joi from 'joi';

const CATEGORIAS_VALIDAS = [
  'Agua', 'Electricidad', 'Gas', 'Portería', 'Mantención',
  'Aseo', 'Seguridad', 'Administración', 'Seguros', 'Otro'
];

export const esquemaCrearGasto = Joi.object({
  mes_anio: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'El campo mes_anio debe ser una fecha ISO (YYYY-MM-DD).',
      'any.required': 'El mes y año son obligatorios.',
    }),

  total_gastos: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .default(0)
    .messages({
      'number.base': 'El total de gastos debe ser un número.',
      'number.min': 'El total de gastos no puede ser negativo.',
      'number.precision': 'El total de gastos puede tener máximo 2 decimales.',
    }),
});

export const esquemaActualizarGasto = Joi.object({
  total_gastos: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'El total de gastos debe ser un número.',
      'number.positive': 'El total de gastos debe ser mayor a 0.',
      'number.precision': 'El total de gastos puede tener máximo 2 decimales.',
      'any.required': 'El total de gastos es obligatorio.',
    }),
});

export const esquemaAgregarEgreso = Joi.object({
  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .required()
    .messages({
      'any.only': `La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(', ')}.`,
      'any.required': 'La categoría es obligatoria.',
    }),

  descripcion: Joi.string()
    .max(500)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres.',
    }),

  monto: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'El monto debe ser un número.',
      'number.positive': 'El monto debe ser mayor a 0.',
      'number.precision': 'El monto puede tener máximo 2 decimales.',
      'any.required': 'El monto es obligatorio.',
    }),
});

export const esquemaActualizarEstadoCobro = Joi.object({
  estado_pago: Joi.string()
    .valid('pendiente', 'pagado', 'moroso')
    .required()
    .messages({
      'any.only': 'El estado de pago debe ser: pendiente, pagado o moroso.',
      'any.required': 'El estado de pago es obligatorio.',
    }),

  nota: Joi.string()
    .max(500)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'La nota no puede exceder 500 caracteres.',
    }),
});

export const esquemaRegistrarPago = Joi.object({
  monto_pagado: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'El monto pagado debe ser un número.',
      'number.positive': 'El monto pagado debe ser mayor a 0.',
      'any.required': 'El monto pagado es obligatorio.',
    }),

  fecha_pago: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'La fecha de pago debe ser una fecha ISO.',
      'any.required': 'La fecha de pago es obligatoria.',
    }),

  comprobante_url: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.uri': 'La URL del comprobante debe ser una URL válida.',
    }),
});
