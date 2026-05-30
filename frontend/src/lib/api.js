// =============================================================================
// SUMA — Cliente HTTP (Fetch Wrapper)
// Wrapper sobre fetch con interceptor de autenticación y manejo de errores.
// =============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Clase de error para respuestas HTTP no exitosas.
 */
class ErrorAPI extends Error {
  /**
   * @param {string} mensaje
   * @param {number} codigo - Código HTTP.
   * @param {object} [detalles] - Detalles del error desde la API.
   */
  constructor(mensaje, codigo, detalles = null) {
    super(mensaje);
    this.nombre = 'ErrorAPI';
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

/**
 * Obtiene el token JWT de Firebase del usuario autenticado.
 * TODO (Open Code): Implementar con el estado de autenticación real.
 *
 * @returns {Promise<string|null>} Token JWT o null si no está autenticado.
 */
const obtenerToken = async () => {
  // Placeholder: Open Code implementará con Firebase Auth.
  // Ejemplo:
  //   import { auth } from './firebase';
  //   const usuario = auth.currentUser;
  //   return usuario ? await usuario.getIdToken() : null;
  return null;
};

/**
 * Función principal de petición HTTP.
 *
 * @param {string} ruta - Ruta relativa al API (sin /api/v1).
 * @param {object} opciones - Opciones de fetch.
 * @param {string} [opciones.metodo='GET'] - Método HTTP.
 * @param {object} [opciones.cuerpo] - Body de la petición (se serializa a JSON).
 * @param {object} [opciones.headers] - Headers adicionales.
 * @param {boolean} [opciones.autenticado=true] - Si true, adjunta Bearer token.
 * @returns {Promise<object>} Datos de la respuesta.
 * @throws {ErrorAPI} Si la respuesta no es exitosa.
 */
export const peticion = async (ruta, opciones = {}) => {
  const {
    metodo = 'GET',
    cuerpo = null,
    headers = {},
    autenticado = true,
  } = opciones;

  // Construir headers.
  const headersFinales = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Adjuntar token de autenticación si corresponde.
  if (autenticado) {
    const token = await obtenerToken();
    if (token) {
      headersFinales['Authorization'] = `Bearer ${token}`;
    }
  }

  // Ejecutar petición.
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: headersFinales,
    body: cuerpo ? JSON.stringify(cuerpo) : null,
  });

  // Manejar respuestas sin contenido (204).
  if (respuesta.status === 204) {
    return null;
  }

  const datos = await respuesta.json();

  // Lanzar error si la respuesta no es exitosa.
  if (!respuesta.ok) {
    throw new ErrorAPI(
      datos.error?.mensaje || 'Error en la petición.',
      respuesta.status,
      datos.error?.detalles,
    );
  }

  return datos;
};

// --- Métodos de conveniencia ---

export const api = {
  get: (ruta) => peticion(ruta, { metodo: 'GET' }),
  post: (ruta, cuerpo) => peticion(ruta, { metodo: 'POST', cuerpo }),
  put: (ruta, cuerpo) => peticion(ruta, { metodo: 'PUT', cuerpo }),
  patch: (ruta, cuerpo) => peticion(ruta, { metodo: 'PATCH', cuerpo }),
  delete: (ruta) => peticion(ruta, { metodo: 'DELETE' }),
};

export default api;
