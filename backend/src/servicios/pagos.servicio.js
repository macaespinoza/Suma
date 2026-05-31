// =============================================================================
// SUMA — Servicio de Pagos
// Lógica de negocio: gestión de pagos manuales y transacciones de pasarela.
// =============================================================================

import * as cobrosRepo from '../repositorios/cobros.repositorio.js';
import * as transaccionesRepo from '../repositorios/transacciones.repositorio.js';
import * as gastosRepo from '../repositorios/gastos.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';

const PASARELAS_VALIDAS = ['flow', 'fintoc', 'mercado_pago'];

export const registrarPagoManual = async (cobroId, { monto_pagado, fecha_pago, comprobante_url }) => {
  const cobro = await cobrosRepo.obtenerCobroPorId(cobroId);
  if (!cobro) {
    throw new ErrorApp('COBRO_NO_ENCONTRADO', 'El cobro por unidad no existe.', 404);
  }

  if (cobro.estado_pago === 'pagado') {
    throw new ErrorApp('ESTADO_INVALIDO', 'Este cobro ya está pagado.', 400);
  }

  if (monto_pagado <= 0) {
    throw new ErrorApp('MONTO_NEGATIVO', 'El monto pagado debe ser mayor a 0.', 400);
  }

  const totalAPagar = parseFloat(cobro.total_a_pagar);
  const montoPagadoFloat = parseFloat(monto_pagado);

  const pago = await cobrosRepo.registrarPago({
    cobroUnidadId: cobroId,
    transaccionId: null,
    montoPagado: montoPagadoFloat,
    fechaPago: fecha_pago,
    comprobanteUrl: comprobante_url || null
  });

  let cobroActualizado;
  if (montoPagadoFloat >= totalAPagar) {
    cobroActualizado = await cobrosRepo.marcarCobroComoPagado(cobroId);
  } else {
    cobroActualizado = await cobrosRepo.obtenerCobroPorId(cobroId);
  }

  return {
    pago: {
      id: pago.id,
      cobro_unidad_id: pago.cobro_unidad_id,
      monto_pagado: parseFloat(pago.monto_pagado),
      fecha_pago: pago.fecha_pago,
      transaccion_id: null,
      comprobante_url: pago.comprobante_url
    },
    cobro_actualizado: {
      id: cobroActualizado.id,
      estado_pago: cobroActualizado.estado_pago,
      total_a_pagar: parseFloat(cobroActualizado.total_a_pagar)
    }
  };
};

export const listarPagosPorCondominio = async (condominioId, opciones = {}) => {
  const pagos = await cobrosRepo.obtenerPagosPorCondominio(condominioId, opciones);

  return {
    datos: pagos.rows.map(p => ({
      id: p.id,
      cobro_unidad_id: p.cobro_unidad_id,
      monto_pagado: parseFloat(p.monto_pagado),
      fecha_pago: p.fecha_pago,
      transaccion_id: p.transaccion_id,
      comprobante_url: p.comprobante_url,
      pasarela: p.pasarela,
      unidad: p.unidad
    })),
    meta: {
      pagina: opciones.pagina || 1,
      por_pagina: opciones.porPagina || 20,
      total: pagos.total,
      total_monto_pagado: pagos.totalMonto
    }
  };
};

export const iniciarTransaccion = async (cobroId, { pasarela, url_retorno, url_cancelar }) => {
  if (!PASARELAS_VALIDAS.includes(pasarela)) {
    throw new ErrorApp('PASARELA_INVALIDA', `Pasarela inválida. Debe ser una de: ${PASARELAS_VALIDAS.join(', ')}`, 400);
  }

  const cobro = await cobrosRepo.obtenerCobroPorId(cobroId);
  if (!cobro) {
    throw new ErrorApp('COBRO_NO_ENCONTRADO', 'El cobro por unidad no existe.', 404);
  }

  if (cobro.estado_pago === 'pagado') {
    throw new ErrorApp('ESTADO_INVALIDO', 'Este cobro ya está pagado.', 400);
  }

  const tokenTransaccion = `TX${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const transaccion = await transaccionesRepo.crear({
    cobroUnidadId: cobroId,
    pasarela,
    tokenTransaccion,
    montoTransaccion: parseFloat(cobro.total_a_pagar)
  });

  let urlPasarela = '';
  switch (pasarela) {
    case 'flow':
      urlPasarela = `https://www.flow.cl/pay/${tokenTransaccion}`;
      break;
    case 'fintoc':
      urlPasarela = `https://link.fintoc.com/pay/${tokenTransaccion}`;
      break;
    case 'mercado_pago':
      urlPasarela = `https://www.mercadopago.cl/checkout/v1/redirect?preference_id=${tokenTransaccion}`;
      break;
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return {
    transaccion: {
      id: transaccion.id,
      cobro_unidad_id: transaccion.cobro_unidad_id,
      pasarela: transaccion.pasarela,
      token_transaccion: transaccion.token_transaccion,
      monto_transaccion: parseFloat(transaccion.monto_transaccion),
      estado_transaccion: transaccion.estado_transaccion
    },
    url_pasarela: urlPasarela,
    expires_at: expiresAt
  };
};

export const obtenerDetalleTransaccion = async (transaccionId) => {
  const transaccion = await transaccionesRepo.obtenerPorId(transaccionId);
  if (!transaccion) {
    throw new ErrorApp('TRANSACCION_NO_ENCONTRADA', 'La transacción no existe.', 404);
  }

  return {
    id: transaccion.id,
    cobro_unidad_id: transaccion.cobro_unidad_id,
    pasarela: transaccion.pasarela,
    token_transaccion: transaccion.token_transaccion,
    monto_transaccion: parseFloat(transaccion.monto_transaccion),
    estado_transaccion: transaccion.estado_transaccion,
    flow_status_detail: null,
    flow_fecha_pago: null
  };
};

export const procesarWebhookPago = async (pasarela, payload) => {
  const { token, status, amount, order } = payload;

  let estadoTransaccion;
  switch (status) {
    case 1:
      estadoTransaccion = 'iniciada';
      break;
    case 2:
      estadoTransaccion = 'exitosa';
      break;
    case 3:
      estadoTransaccion = 'fallida';
      break;
    case 4:
      estadoTransaccion = 'reembolsada';
      break;
    default:
      throw new ErrorApp('ESTADO_INVALIDO', `Estado de webhook desconocido: ${status}`, 400);
  }

  const transaccion = await transaccionesRepo.obtenerPorToken(token);
  if (!transaccion) {
    throw new ErrorApp('TRANSACCION_NO_ENCONTRADA', 'La transacción no existe.', 404);
  }

  if (transaccion.estado_transaccion === 'exitosa') {
    return { mensaje: 'Transacción ya procesada.' };
  }

  await transaccionesRepo.actualizarEstado(transaccion.id, estadoTransaccion);

  if (estadoTransaccion === 'exitosa') {
    const cobro = await cobrosRepo.obtenerCobroPorId(transaccion.cobro_unidad_id);
    if (cobro && cobro.estado_pago !== 'pagado') {
      await cobrosRepo.registrarPago({
        cobroUnidadId: transaccion.cobro_unidad_id,
        transaccionId: transaccion.id,
        montoPagado: parseFloat(amount || transaccion.monto_transaccion),
        fechaPago: new Date().toISOString(),
        comprobanteUrl: null
      });

      await cobrosRepo.marcarCobroComoPagado(transaccion.cobro_unidad_id);
    }
  }

  return { mensaje: 'Pago procesado correctamente.' };
};
