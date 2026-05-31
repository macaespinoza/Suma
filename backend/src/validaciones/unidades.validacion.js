// =============================================================================
// SUMA — Esquemas de Validación Joi para Unidades Vecinales
// Validación de datos de entrada en los endpoints de unidades.
// =============================================================================

import Joi from 'joi';

/**
 * Esquema para crear una unidad vecinal.
 * Campos obligatorios según openapi.yaml → UnidadVecinalCrear.
 */
export const esquemaCrearUnidad = Joi.object({
  condominio_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'El ID del condominio debe ser un UUID válido.',
      'any.required': 'El ID del condominio es obligatorio.',
    }),

  bloque_edificio: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'El bloque/edificio no puede exceder 100 caracteres.',
    }),

  numero: Joi.string()
    .max(20)
    .required()
    .messages({
      'string.max': 'El número no puede exceder 20 caracteres.',
      'any.required': 'El número de la unidad es obligatorio.',
    }),

  alicuota: Joi.number()
    .min(0)
    .max(1)
    .required()
    .messages({
      'number.base': 'La alícuota debe ser un número.',
      'number.min': 'La alícuota no puede ser menor a 0.',
      'number.max': 'La alícuota no puede ser mayor a 1.',
      'any.required': 'La alícuota es obligatoria.',
    }),
});

/**
 * Esquema para actualizar una unidad vecinal.
 * Todos los campos son opcionales según openapi.yaml → UnidadVecinalActualizar.
 */
export const esquemaActualizarUnidad = Joi.object({
  bloque_edificio: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'El bloque/edificio no puede exceder 100 caracteres.',
    }),

  numero: Joi.string()
    .max(20)
    .messages({
      'string.max': 'El número no puede exceder 20 caracteres.',
    }),

  alicuota: Joi.number()
    .min(0)
    .max(1)
    .messages({
      'number.base': 'La alícuota debe ser un número.',
      'number.min': 'La alícuota no puede ser menor a 0.',
      'number.max': 'La alícuota no puede ser mayor a 1.',
    }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar.',
});
