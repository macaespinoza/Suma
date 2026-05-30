// =============================================================================
// SUMA — Validación de RUT Chileno (Módulo 11) en JavaScript
// Mirror de la función PL/pgSQL validar_rut() definida en init.sql.
// Se usa tanto en el backend (pre-validación) como potencialmente en el frontend.
// =============================================================================

/**
 * Valida matemáticamente un RUT chileno usando el algoritmo Módulo 11.
 * Acepta formatos: '12345678-9', '12.345.678-9', '12345678-K'.
 *
 * @param {string} rutInput - RUT a validar (con o sin puntos, con guión).
 * @returns {boolean} true si el RUT es válido, false si no.
 *
 * @example
 * validarRut('12345678-5'); // true
 * validarRut('11.111.111-1'); // true
 * validarRut('00000000-0'); // false
 */
export const validarRut = (rutInput) => {
  if (!rutInput || typeof rutInput !== 'string') {
    return false;
  }

  // Normalizar: eliminar puntos, espacios y convertir a mayúsculas.
  const rutLimpio = rutInput.replace(/\./g, '').replace(/\s/g, '').toUpperCase();

  // Validar formato básico: 7-8 dígitos, guión, dígito o K.
  const formatoValido = /^[0-9]{7,8}-[0-9K]$/;
  if (!formatoValido.test(rutLimpio)) {
    return false;
  }

  // Separar cuerpo y dígito verificador.
  const [cuerpo, dvIngresado] = rutLimpio.split('-');

  // Algoritmo Módulo 11: suma ponderada de derecha a izquierda.
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  // Calcular dígito verificador esperado.
  const resto = 11 - (suma % 11);
  let dvCalculado;

  if (resto === 11) {
    dvCalculado = '0';
  } else if (resto === 10) {
    dvCalculado = 'K';
  } else {
    dvCalculado = resto.toString();
  }

  return dvCalculado === dvIngresado;
};

/**
 * Formatea un RUT a su forma canónica (sin puntos, con guión, DV en mayúscula).
 * Útil para normalizar antes de guardar en la base de datos.
 *
 * @param {string} rutInput - RUT en cualquier formato.
 * @returns {string} RUT normalizado. Ej: '12345678-K'
 */
export const formatearRut = (rutInput) => {
  if (!rutInput || typeof rutInput !== 'string') {
    return rutInput;
  }
  return rutInput.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
};
