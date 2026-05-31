// =============================================================================
// SUMA — Esquemas de Validación Joi para Condominios
// Validación de datos de entrada en los endpoints de condominios.
// =============================================================================

import Joi from 'joi';

// Patrón RUT chileno: 7-8 dígitos, guión, dígito verificador o K.
const patronRut = /^[0-9]{7,8}-[0-9Kk]$/;

/**
 * Esquema para crear un condominio.
 * Todos los campos son obligatorios según openapi.yaml → CondominioCrear.
 */
export const esquemaCrearCondominio = Joi.object({
  nombre: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': 'El nombre no puede exceder 200 caracteres.',
      'any.required': 'El nombre es obligatorio.',
    }),

  direccion: Joi.string()
    .max(300)
    .required()
    .messages({
      'string.max': 'La dirección no puede exceder 300 caracteres.',
      'any.required': 'La dirección es obligatoria.',
    }),

  rut_comunidad: Joi.string()
    .pattern(patronRut)
    .required()
    .messages({
      'string.pattern.base': 'El RUT debe tener formato XXXXXXXX-X (sin puntos, con guión).',
      'any.required': 'El RUT de la comunidad es obligatorio.',
    }),

  cantidad_unidades: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'La cantidad de unidades debe ser un número.',
      'number.integer': 'La cantidad de unidades debe ser un número entero.',
      'number.min': 'La cantidad de unidades no puede ser negativa.',
      'any.required': 'La cantidad de unidades es obligatoria.',
    }),
});

/**
 * Esquema para actualizar un condominio.
 * Todos los campos son opcionales según openapi.yaml → CondominioActualizar.
 */
export const esquemaActualizarCondominio = Joi.object({
  nombre: Joi.string()
    .max(200)
    .messages({
      'string.max': 'El nombre no puede exceder 200 caracteres.',
    }),

  direccion: Joi.string()
    .max(300)
    .messages({
      'string.max': 'La dirección no puede exceder 300 caracteres.',
    }),

  rut_comunidad: Joi.string()
    .pattern(patronRut)
    .messages({
      'string.pattern.base': 'El RUT debe tener formato XXXXXXXX-X (sin puntos, con guión).',
    }),

  cantidad_unidades: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'La cantidad de unidades debe ser un número.',
      'number.integer': 'La cantidad de unidades debe ser un número entero.',
      'number.min': 'La cantidad de unidades no puede ser negativa.',
    }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar.',
});
