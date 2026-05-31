// =============================================================================
// SUMA — Controlador de Dashboard
// Capa HTTP: recibe request, llama al servicio, devuelve response.
// =============================================================================

import * as servicio from '../servicios/dashboard.servicio.js';
import { respuestaExitosa } from '../utilidades/respuesta.js';

export const obtenerResumenFinanciero = async (req, res, next) => {
  try {
    const { condominioId } = req.params;
    const resumen = await servicio.obtenerResumenFinanciero(condominioId);
    return respuestaExitosa(res, resumen);
  } catch (error) {
    next(error);
  }
};
