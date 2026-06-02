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

/**
 * Esquema para crear múltiples unidades en lote.
 */
export const esquemaCrearUnidadesLote = Joi.object({
  condominio_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'El ID del condominio debe ser un UUID válido.',
      'any.required': 'El ID del condominio es obligatorio.',
    }),

  unidades: Joi.array()
    .items(
      Joi.object({
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
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Debes incluir al menos una unidad.',
      'any.required': 'La lista de unidades es obligatoria.',
    }),
});

/**
 * Esquema para actualizar datos base de una unidad (estacionamiento, bodega).
 * Según API_SPEC_UNIDADES.md → PUT /api/condominios/:condominioId/unidades/:unidadId
 */
export const esquemaActualizarDatosBase = Joi.object({
  tiene_estacionamiento: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'El campo tiene_estacionamiento debe ser verdadero o falso.',
      'any.required': 'El campo tiene_estacionamiento es obligatorio.',
    }),

  numero_estacionamiento: Joi.string()
    .max(50)
    .allow(null)
    .optional()
    .messages({
      'string.max': 'El número de estacionamiento no puede exceder 50 caracteres.',
    }),

  tiene_bodega: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'El campo tiene_bodega debe ser verdadero o falso.',
      'any.required': 'El campo tiene_bodega es obligatorio.',
    }),

  numero_bodega: Joi.string()
    .max(50)
    .allow(null)
    .optional()
    .messages({
      'string.max': 'El número de bodega no puede exceder 50 caracteres.',
    }),
});

/**
 * Esquema para crear o actualizar un titular (propietario o arrendatario).
 * Según API_SPEC_UNIDADES.md → POST /api/condominios/:condominioId/unidades/:unidadId/titulares
 */
export const esquemaTitular = Joi.object({
  tipo: Joi.string()
    .valid('propietario', 'arrendatario')
    .required()
    .messages({
      'any.only': 'El tipo de titular debe ser "propietario" o "arrendatario".',
      'any.required': 'El tipo de titular es obligatorio.',
    }),

  nombre: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': 'El nombre no puede exceder 200 caracteres.',
      'any.required': 'El nombre del titular es obligatorio.',
    }),

  rut: Joi.string()
    .max(12)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'El RUT no puede exceder 12 caracteres.',
    }),

  email: Joi.string()
    .email()
    .max(254)
    .allow(null, '')
    .optional()
    .messages({
      'string.email': 'El email no tiene un formato válido.',
      'string.max': 'El email no puede exceder 254 caracteres.',
    }),

  telefono: Joi.string()
    .max(20)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'El teléfono no puede exceder 20 caracteres.',
    }),
});

/**
 * Esquema para agregar un vehículo.
 * Según API_SPEC_UNIDADES.md → POST /api/condominios/:condominioId/unidades/:unidadId/vehiculos
 */
export const esquemaVehiculo = Joi.object({
  tipo_vehiculo: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'El tipo de vehículo no puede exceder 50 caracteres.',
      'any.required': 'El tipo de vehículo es obligatorio.',
    }),

  patente: Joi.string()
    .max(10)
    .required()
    .messages({
      'string.max': 'La patente no puede exceder 10 caracteres.',
      'any.required': 'La patente es obligatoria.',
    }),
});

/**
 * Esquema para agregar una mascota.
 */
export const esquemaMascota = Joi.object({
  nombre: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'El nombre no puede exceder 100 caracteres.',
      'any.required': 'El nombre de la mascota es obligatorio.',
    }),

  especie: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'La especie no puede exceder 50 caracteres.',
      'any.required': 'La especie es obligatoria.',
    }),

  raza: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'La raza no puede exceder 100 caracteres.',
    }),
});

