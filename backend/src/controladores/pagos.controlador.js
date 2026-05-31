// =============================================================================
// SUMA — Controlador de Pagos
// Capa HTTP: recibe request, llama al servicio, devuelve response.
// =============================================================================

import * as servicio from '../servicios/pagos.servicio.js';
import { respuestaExitosa, respuestaCreado } from '../utilidades/respuesta.js';

export const registrarPagoManual = async (req, res, next) => {
  try {
    const { cobroId } = req.params;
    const { monto_pagado, fecha_pago, comprobante_url } = req.body;

    const resultado = await servicio.registrarPagoManual(cobroId, {
      monto_pagado,
      fecha_pago,
      comprobante_url
    });

    return respuestaCreado(res, resultado);
  } catch (error) {
    next(error);
  }
};

export const listarPagos = async (req, res, next) => {
  try {
    const { condominioId } = req.params;
    const { pagina = 1, por_pagina: porPagina = 20, mes_anio, unidad_id } = req.query;

    const resultado = await servicio.listarPagosPorCondominio(condominioId, {
      pagina: parseInt(pagina, 10),
      porPagina: parseInt(porPagina, 10),
      mesAnio: mes_anio,
      unidadId: unidad_id
    });

    return respuestaExitosa(res, resultado.datos, 200, resultado.meta);
  } catch (error) {
    next(error);
  }
};

export const iniciarTransaccion = async (req, res, next) => {
  try {
    const { cobroId } = req.params;
    const { pasarela, url_retorno, url_cancelar } = req.body;

    const resultado = await servicio.iniciarTransaccion(cobroId, {
      pasarela,
      url_retorno,
      url_cancelar
    });

    return respuestaCreado(res, resultado);
  } catch (error) {
    next(error);
  }
};

export const obtenerDetalleTransaccion = async (req, res, next) => {
  try {
    const { transaccionId } = req.params;
    const resultado = await servicio.obtenerDetalleTransaccion(transaccionId);
    return respuestaExitosa(res, resultado);
  } catch (error) {
    next(error);
  }
};

export const procesarWebhook = async (req, res, next) => {
  try {
    const { pasarela } = req.params;
    const payload = req.body;

    const resultado = await servicio.procesarWebhookPago(pasarela, payload);
    return respuestaExitosa(res, resultado);
  } catch (error) {
    next(error);
  }
};
