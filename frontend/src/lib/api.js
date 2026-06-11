// =============================================================================
// SUMA — Cliente HTTP (Fetch Wrapper)
// Wrapper sobre fetch con interceptor de autenticación y manejo de errores.
// =============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Clase de error para respuestas HTTP no exitosas.
 */
class ErrorAPI extends Error {
  constructor(mensaje, codigo, detalles = null) {
    super(mensaje);
    this.nombre = 'ErrorAPI';
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

/**
 * Obtiene el token JWT según el entorno:
 * - Desarrollo: mock token local (no requiere Firebase).
 * - Producción: Firebase Auth token real.
 *
 * @returns {Promise<string|null>} Token JWT o null si no está autenticado.
 */
const obtenerToken = async () => {
  if (typeof window === 'undefined') return null;

  if (IS_DEV) {
    try {
      const { mockAuth } = await import('./auth-mock');
      const user = mockAuth.currentUser;
      return user ? await user.getIdToken() : null;
    } catch {
      return null;
    }
  }

  try {
    const { getAuth } = await import('./firebase');
    const auth = getAuth();
    const usuario = auth?.currentUser;
    return usuario ? await usuario.getIdToken() : null;
  } catch {
    return null;
  }
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
import { interceptarRuta } from './mocks';

export const peticion = async (ruta, opciones = {}) => {
  // === MOCK INTERCEPTION PARA PROTOTIPO CORFO ===
  if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'false') {
    return await interceptarRuta(ruta, opciones.metodo || 'GET', opciones.cuerpo);
  }
  // ===============================================

  const {
    metodo = 'GET',
    cuerpo = null,
    headers = {},
    autenticado = true,
  } = opciones;

  const headersFinales = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (autenticado) {
    const token = await obtenerToken();
    if (token) {
      headersFinales['Authorization'] = `Bearer ${token}`;
    }
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: headersFinales,
    body: cuerpo ? JSON.stringify(cuerpo) : null,
  });

  if (respuesta.status === 204) {
    return null;
  }

  const datos = await respuesta.json();

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