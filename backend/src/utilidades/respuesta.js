// =============================================================================
// SUMA — Helpers de Respuesta HTTP Estandarizada
// Formato consistente para todas las respuestas de la API.
// =============================================================================

/**
 * Genera una respuesta HTTP exitosa estandarizada.
 *
 * Formato:
 * {
 *   exito: true,
 *   datos: { ... },
 *   metadata: { total, pagina, porPagina }  // Solo si aplica paginación.
 * }
 *
 * @param {import('express').Response} res - Objeto response de Express.
 * @param {object|Array} datos - Datos a enviar al cliente.
 * @param {number} [codigoHttp=200] - Código HTTP (200, 201, etc.).
 * @param {object} [metadata=null] - Metadatos opcionales (paginación, etc.).
 * @returns {import('express').Response}
 */
export const respuestaExitosa = (res, datos, codigoHttp = 200, metadata = null) => {
  const cuerpo = {
    exito: true,
    datos,
  };

  if (metadata) {
    cuerpo.metadata = metadata;
  }

  return res.status(codigoHttp).json(cuerpo);
};

/**
 * Genera una respuesta de lista paginada.
 *
 * @param {import('express').Response} res - Objeto response de Express.
 * @param {Array} registros - Array de registros a enviar.
 * @param {number} total - Total de registros (antes de paginar).
 * @param {number} pagina - Página actual (1-indexed).
 * @param {number} porPagina - Cantidad de registros por página.
 * @returns {import('express').Response}
 */
export const respuestaPaginada = (res, registros, total, pagina, porPagina) => {
  return respuestaExitosa(res, registros, 200, {
    total,
    pagina,
    porPagina,
    totalPaginas: Math.ceil(total / porPagina),
  });
};

/**
 * Genera una respuesta de creación exitosa (201 Created).
 *
 * @param {import('express').Response} res
 * @param {object} datos - Recurso creado.
 * @returns {import('express').Response}
 */
export const respuestaCreado = (res, datos) => {
  return respuestaExitosa(res, datos, 201);
};

/**
 * Genera una respuesta sin contenido (204 No Content).
 * Usado para DELETE exitoso.
 *
 * @param {import('express').Response} res
 * @returns {import('express').Response}
 */
export const respuestaSinContenido = (res) => {
  return res.status(204).send();
};
