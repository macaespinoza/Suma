// =============================================================================
// SUMA — Esquemas de Validación Joi para Usuarios
// Validación de datos de entrada en los endpoints de usuarios.
// =============================================================================

import Joi from 'joi';

// Patrón RUT chileno: 7-8 dígitos, guión, dígito verificador o K.
const patronRut = /^[0-9]{7,8}-[0-9Kk]$/;

// Roles válidos según el ENUM tipo_rol_usuario en PostgreSQL.
const rolesValidos = ['admin', 'propietario', 'arrendatario', 'conserje'];

/**
 * Esquema para registrar un nuevo usuario.
 * Campos obligatorios según openapi.yaml → UsuarioCrear.
 */
export const esquemaCrearUsuario = Joi.object({
  firebase_uid: Joi.string()
    .required()
    .messages({
      'any.required': 'El UID de Firebase es obligatorio.',
    }),

  rut: Joi.string()
    .pattern(patronRut)
    .required()
    .messages({
      'string.pattern.base': 'El RUT debe tener formato XXXXXXXX-X (sin puntos, con guión).',
      'any.required': 'El RUT es obligatorio.',
    }),

  nombre_completo: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': 'El nombre no puede exceder 200 caracteres.',
      'any.required': 'El nombre completo es obligatorio.',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El email debe ser una dirección de correo válida.',
      'any.required': 'El email es obligatorio.',
    }),

  telefono: Joi.string()
    .max(20)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'El teléfono no puede exceder 20 caracteres.',
    }),

  rol: Joi.string()
    .valid(...rolesValidos)
    .optional()
    .messages({
      'any.only': `El rol debe ser uno de: ${rolesValidos.join(', ')}.`,
    }),
});

/**
 * Esquema para actualizar datos de un usuario.
 * Todos los campos son opcionales según openapi.yaml → UsuarioActualizar.
 */
export const esquemaActualizarUsuario = Joi.object({
  nombre_completo: Joi.string()
    .max(200)
    .messages({
      'string.max': 'El nombre no puede exceder 200 caracteres.',
    }),

  email: Joi.string()
    .email()
    .messages({
      'string.email': 'El email debe ser una dirección de correo válida.',
    }),

  telefono: Joi.string()
    .max(20)
    .allow(null, '')
    .messages({
      'string.max': 'El teléfono no puede exceder 20 caracteres.',
    }),

  rol: Joi.string()
    .valid(...rolesValidos)
    .messages({
      'any.only': `El rol debe ser uno de: ${rolesValidos.join(', ')}.`,
    }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar.',
});

/**
 * Esquema para verificar un usuario por Firebase UID.
 * Endpoint: POST /api/v1/usuarios/verificar
 */
export const esquemaVerificarUsuario = Joi.object({
  firebase_uid: Joi.string()
    .required()
    .messages({
      'any.required': 'El UID de Firebase es obligatorio.',
    }),
});
