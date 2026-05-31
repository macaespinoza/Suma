// =============================================================================
// SUMA — Servicio de Gastos Comunes
// Lógica de negocio: gestión de gastos, egresos y cobranza.
// =============================================================================

import * as gastosRepo from '../repositorios/gastos.repositorio.js';
import * as cobrosRepo from '../repositorios/cobros.repositorio.js';
import * as unidadesRepo from '../repositorios/condominios.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';

const CATEGORIAS_VALIDAS = [
  'Agua', 'Electricidad', 'Gas', 'Portería', 'Mantención',
  'Aseo', 'Seguridad', 'Administración', 'Seguros', 'Otro'
];

export const listarGastos = async (condominioId, opciones = {}) => {
  const gastos = await gastosRepo.obtenerPorCondominio(condominioId, opciones);
  return {
    datos: gastos.rows,
    meta: {
      pagina: opciones.pagina || 1,
      por_pagina: opciones.porPagina || 12,
      total: gastos.total
    }
  };
};

export const obtenerDetalleGasto = async (gastoId) => {
  const gasto = await gastosRepo.obtenerDetalleCompleto(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  const egresos = await gastosRepo.obtenerEgresosPorGasto(gastoId);

  return {
    id: gasto.id,
    condominio_id: gasto.condominio_id,
    mes_anio: gasto.mes_anio,
    total_gastos: parseFloat(gasto.total_gastos),
    estado: gasto.estado,
    egresos_operativos: egresos.map(e => ({
      id: e.id,
      categoria: e.categoria,
      descripcion: e.descripcion,
      monto: parseFloat(e.monto)
    })),
    resumen_unidades: {
      total_unidades: parseInt(gasto.total_unidades),
      unidades_cobradas: parseInt(gasto.unidades_cobradas || 0),
      total_cobrado: parseFloat(gasto.total_cobrado || 0),
      total_pagado: parseFloat(gasto.total_pagado || 0),
      total_pendiente: parseFloat(gasto.total_pendiente || 0)
    },
    created_at: gasto.created_at,
    updated_at: gasto.updated_at
  };
};

export const crearGasto = async (condominioId, { mes_anio, total_gastos }) => {
  // total_gastos puede ser 0 al crear un borrador sin egresos previos.
  if (total_gastos !== undefined && total_gastos < 0) {
    throw new ErrorApp('El monto total de gastos no puede ser negativo.', 400);
  }

  const condominio = await unidadesRepo.obtenerPorId(condominioId);
  if (!condominio) {
    throw new ErrorApp('El condominio no existe.', 404);
  }

  const existe = await gastosRepo.existeMesDuplicado(condominioId, mes_anio);
  if (existe) {
    throw new ErrorApp('Ya existe un gasto para ese mes en este condominio.', 409);
  }

  const gasto = await gastosRepo.crear({
    condominioId,
    mesAnio: mes_anio,
    totalGastos: total_gastos
  });

  return {
    id: gasto.id,
    condominio_id: gasto.condominio_id,
    mes_anio: gasto.mes_anio,
    total_gastos: parseFloat(gasto.total_gastos),
    estado: gasto.estado,
    egresos: [],
    created_at: gasto.created_at
  };
};

export const actualizarGasto = async (gastoId, { total_gastos }) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  if (gasto.estado !== 'borrador') {
    throw new ErrorApp('No se puede modificar un gasto ya publicado.', 400);
  }

  if (total_gastos !== undefined && total_gastos <= 0) {
    throw new ErrorApp('El monto total de gastos debe ser mayor a 0.', 400);
  }

  const actualizado = await gastosRepo.actualizar(gastoId, { totalGastos: total_gastos });
  if (!actualizado) {
    throw new ErrorApp('No se pudo actualizar el gasto.', 404);
  }

  return {
    id: actualizado.id,
    total_gastos: parseFloat(actualizado.total_gastos),
    estado: actualizado.estado,
    updated_at: actualizado.updated_at
  };
};

export const agregarEgreso = async (gastoId, { categoria, descripcion, monto }) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  if (gasto.estado !== 'borrador') {
    throw new ErrorApp('No se puede agregar egresos a un gasto ya publicado.', 400);
  }

  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    throw new ErrorApp(`Categoría inválida. Debe ser una de: ${CATEGORIAS_VALIDAS.join(', ')}`, 400);
  }

  if (monto <= 0) {
    throw new ErrorApp('El monto del egreso debe ser mayor a 0.', 400);
  }

  const egreso = await gastosRepo.crearEgreso({
    gastoComunMesId: gastoId,
    categoria,
    descripcion: descripcion || null,
    monto
  });

  // Recalcular total_gastos automáticamente como suma de todos los egresos.
  await gastosRepo.actualizarTotalConSumaEgresos(gastoId);

  return {
    id: egreso.id,
    gasto_comun_mes_id: egreso.gasto_comun_mes_id,
    categoria: egreso.categoria,
    descripcion: egreso.descripcion,
    monto: parseFloat(egreso.monto),
    archivo_respaldo_url: egreso.archivo_respaldo_url,
    created_at: egreso.created_at
  };
};

export const listarEgresos = async (gastoId) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  const egresos = await gastosRepo.obtenerEgresosPorGasto(gastoId);
  const sumaEgresos = await gastosRepo.obtenerSumaEgresos(gastoId);

  return {
    datos: egresos.map(e => ({
      id: e.id,
      categoria: e.categoria,
      descripcion: e.descripcion,
      monto: parseFloat(e.monto)
    })),
    meta: {
      total_egresos: egresos.length,
      suma_egresos: parseFloat(sumaEgresos)
    }
  };
};

export const publicarGasto = async (gastoId) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  if (gasto.estado !== 'borrador') {
    throw new ErrorApp('El gasto ya está publicado.', 409);
  }

  const sumaEgresos = await gastosRepo.obtenerSumaEgresos(gastoId);
  if (parseFloat(sumaEgresos) > parseFloat(gasto.total_gastos)) {
    throw new ErrorApp('La suma de egresos excede el total de gastos declarados.', 400);
  }

  const unidades = await unidadesRepo.obtenerUnidades(gasto.condominio_id);

  const publicados = await gastosRepo.marcarPublicado(gastoId);
  if (!publicados) {
    throw new ErrorApp('No se pudo publicar el gasto.', 404);
  }

  const cobros = await cobrosRepo.crearCobrosPorGasto(gastoId, unidades, parseFloat(gasto.total_gastos));

  return {
    gasto: {
      id: publicados.id,
      estado: publicados.estado,
      total_gastos: parseFloat(publicados.total_gastos)
    },
    cobros_generados: cobros.length,
    detalle_cobros: cobros.map(c => ({
      unidad_id: c.unidad_id,
      numero: c.unidad.numero,
      bloque_edificio: c.unidad.bloque_edificio,
      alicuota: parseFloat(c.unidad.alicuota),
      monto_cobrado: parseFloat(c.monto_cobrado),
      saldo_anterior: parseFloat(c.saldo_anterior),
      total_a_pagar: parseFloat(c.total_a_pagar),
      estado_pago: c.estado_pago
    }))
  };
};

export const eliminarGasto = async (gastoId) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  if (gasto.estado !== 'borrador') {
    throw new ErrorApp('No se puede eliminar un gasto ya publicado.', 400);
  }

  await gastosRepo.eliminarEgresosPorGasto(gastoId);
  const eliminado = await gastosRepo.eliminar(gastoId);

  if (!eliminado) {
    throw new ErrorApp('No se pudo eliminar el gasto.', 404);
  }

  return true;
};

export const listarCobros = async (gastoId, opciones = {}) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  const cobros = await cobrosRepo.obtenerCobrosPorGasto(gastoId, opciones);

  return {
    datos: cobros.rows.map(c => ({
      id: c.id,
      unidad_id: c.unidad_id,
      numero: c.numero,
      bloque_edificio: c.bloque_edificio,
      alicuota: parseFloat(c.alicuota),
      monto_cobrado: parseFloat(c.monto_cobrado),
      saldo_anterior: parseFloat(c.saldo_anterior),
      total_a_pagar: parseFloat(c.total_a_pagar),
      estado_pago: c.estado_pago,
      residente_principal: c.residente_principal,
      ultimo_pago: c.ultimo_pago
    })),
    meta: {
      pagina: opciones.pagina || 1,
      por_pagina: opciones.porPagina || 20,
      total: cobros.total,
      resumen: {
        total_cobrado: parseFloat(cobros.resumen.total_cobrado),
        total_pagado: parseFloat(cobros.resumen.total_pagado),
        total_pendiente: parseFloat(cobros.resumen.total_pendiente),
        unidades_pagadas: parseInt(cobros.resumen.unidades_pagadas),
        unidades_pendientes: parseInt(cobros.resumen.unidades_pendientes),
        unidades_morosas: parseInt(cobros.resumen.unidades_morosas)
      }
    }
  };
};

export const obtenerDetalleCobro = async (cobroId) => {
  const cobro = await cobrosRepo.obtenerCobroPorId(cobroId);
  if (!cobro) {
    throw new ErrorApp('El cobro por unidad no existe.', 404);
  }

  const historialPagos = await cobrosRepo.obtenerPagosPorCobro(cobroId);

  return {
    id: cobro.id,
    unidad: {
      id: cobro.unidad.id,
      numero: cobro.unidad.numero,
      bloque_edificio: cobro.unidad.bloque_edificio,
      alicuota: parseFloat(cobro.unidad.alicuota),
      propietario: cobro.unidad.propietario,
      residentes: cobro.unidad.residentes
    },
    gasto_comun: {
      id: cobro.gasto_comun.id,
      mes_anio: cobro.gasto_comun.mes_anio,
      total_gastos: parseFloat(cobro.gasto_comun.total_gastos)
    },
    monto_cobrado: parseFloat(cobro.monto_cobrado),
    saldo_anterior: parseFloat(cobro.saldo_anterior),
    total_a_pagar: parseFloat(cobro.total_a_pagar),
    estado_pago: cobro.estado_pago,
    historial_pagos: historialPagos.map(p => ({
      id: p.id,
      fecha: p.fecha_pago,
      monto: parseFloat(p.monto_pagado),
      comprobante_url: p.comprobante_url
    }))
  };
};

export const actualizarEstadoCobro = async (cobroId, { estado_pago, nota }) => {
  const cobro = await cobrosRepo.obtenerCobroPorId(cobroId);
  if (!cobro) {
    throw new ErrorApp('El cobro por unidad no existe.', 404);
  }

  const transicionesValidas = {
    pendiente: ['pagado', 'moroso'],
    moroso: ['pendiente', 'pagado'],
    pagado: ['pendiente']
  };

  if (!transicionesValidas[cobro.estado_pago]?.includes(estado_pago)) {
    throw new ErrorApp(
      `No se puede cambiar de '${cobro.estado_pago}' a '${estado_pago}'.`,
      400
    );
  }

  const actualizado = await cobrosRepo.actualizarEstadoCobro(cobroId, estado_pago);

  return {
    id: actualizado.id,
    estado_pago: actualizado.estado_pago,
    updated_at: actualizado.updated_at
  };
};
