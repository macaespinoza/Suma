// =============================================================================
// SUMA — Controlador de Pasarelas de Pago
// Capa HTTP: recibe request, llama al servicio, devuelve response.
// =============================================================================

import * as servicio from '../servicios/pasarelas.servicio.js';
import { respuestaExitosa, respuestaCreado } from '../utilidades/respuesta.js';

export const listar = async (req, res, next) => {
  try {
    const { condominioId } = req.params;
    const pasarelas = await servicio.listarPasarelas(condominioId);
    return respuestaExitosa(res, pasarelas);
  } catch (error) {
    next(error);
  }
};

export const guardarCredenciales = async (req, res, next) => {
  try {
    const { condominioId } = req.params;
    const { pasarela, api_key, secret_key } = req.body;

    const credencial = await servicio.guardarCredenciales(condominioId, {
      pasarela,
      api_key,
      secret_key
    });

    return respuestaCreado(res, credencial);
  } catch (error) {
    next(error);
  }
};

export const cambiarEstado = async (req, res, next) => {
  try {
    const { pasarelaId } = req.params;
    const { activo } = req.body;

    const credencial = await servicio.cambiarEstado(pasarelaId, { activo });
    return respuestaExitosa(res, credencial);
  } catch (error) {
    next(error);
  }
};
