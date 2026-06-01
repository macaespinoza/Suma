// =============================================================================
// SUMA — Controlador de Gastos Comunes
// Capa HTTP: recibe request, llama al servicio, devuelve response.
// =============================================================================

import * as servicio from '../servicios/gastos.servicio.js';
import * as condominiosRepo from '../repositorios/condominios.repositorio.js';
import { respuestaExitosa, respuestaCreado, respuestaSinContenido } from '../utilidades/respuesta.js';
import { generarLiquidacionPDF } from '../utilidades/liquidacionPdf.js';

export const listar = async (req, res, next) => {
  try {
    const { id: condominioId } = req.params;
    const { pagina = 1, por_pagina: porPagina = 12, estado } = req.query;

    const resultado = await servicio.listarGastos(condominioId, {
      pagina: parseInt(pagina, 10),
      porPagina: parseInt(porPagina, 10),
      estado
    });

    return respuestaExitosa(res, resultado.datos, 200, resultado.meta);
  } catch (error) {
    next(error);
  }
};

export const obtenerDetalle = async (req, res, next) => {
  try {
    const { gastoId } = req.params;
    const detalle = await servicio.obtenerDetalleGasto(gastoId);
    return respuestaExitosa(res, detalle);
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { id: condominioId } = req.params;
    const { mes_anio, total_gastos } = req.body;

    const gasto = await servicio.crearGasto(condominioId, { mes_anio, total_gastos });
    return respuestaCreado(res, gasto);
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { gastoId } = req.params;
    const { total_gastos } = req.body;

    const gasto = await servicio.actualizarGasto(gastoId, { total_gastos });
    return respuestaExitosa(res, gasto);
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { gastoId } = req.params;
    await servicio.eliminarGasto(gastoId);
    return respuestaSinContenido(res);
  } catch (error) {
    next(error);
  }
};

export const publicar = async (req, res, next) => {
  try {
    const { gastoId } = req.params;
    const resultado = await servicio.publicarGasto(gastoId);
    return respuestaExitosa(res, resultado);
  } catch (error) {
    next(error);
  }
};

export const listarEgresos = async (req, res, next) => {
  try {
    const { gastoId } = req.params;
    const resultado = await servicio.listarEgresos(gastoId);
    return respuestaExitosa(res, resultado.datos, 200, resultado.meta);
  } catch (error) {
    next(error);
  }
};

export const agregarEgreso = async (req, res, next) => {
  try {
    const { gastoId } = req.params;
    const { categoria, descripcion, monto } = req.body;

    const egreso = await servicio.agregarEgreso(gastoId, { categoria, descripcion, monto });
    return respuestaCreado(res, egreso);
  } catch (error) {
    next(error);
  }
};

export const listarCobros = async (req, res, next) => {
  try {
    const { gastoId } = req.params;
    const { pagina = 1, por_pagina: porPagina = 20, estado, bloque } = req.query;

    const resultado = await servicio.listarCobros(gastoId, {
      pagina: parseInt(pagina, 10),
      porPagina: parseInt(porPagina, 10),
      estado,
      bloque
    });

    return respuestaExitosa(res, resultado.datos, 200, resultado.meta);
  } catch (error) {
    next(error);
  }
};

export const obtenerDetalleCobro = async (req, res, next) => {
  try {
    const { cobroId } = req.params;
    const detalle = await servicio.obtenerDetalleCobro(cobroId);
    return respuestaExitosa(res, detalle);
  } catch (error) {
    next(error);
  }
};

export const actualizarEstadoCobro = async (req, res, next) => {
  try {
    const { cobroId } = req.params;
    const { estado_pago, nota } = req.body;

    const resultado = await servicio.actualizarEstadoCobro(cobroId, { estado_pago, nota });
    return respuestaExitosa(res, resultado);
  } catch (error) {
    next(error);
  }
};

export const generarLiquidacionPdf = async (req, res, next) => {
  try {
    const { gastoId } = req.params;

    const gasto = await servicio.obtenerDetalleGasto(gastoId);

    const condominio = await condominiosRepo.obtenerPorId(gasto.condominio_id);
    if (!condominio) {
      return res.status(404).json({
        exito: false,
        error: { codigo: 404, mensaje: 'Condominio no encontrado.' }
      });
    }

    const cobrosResumen = {
      total_cobrado: gasto.resumen_unidades.total_cobrado,
      total_pagado: gasto.resumen_unidades.total_pagado,
      total_pendiente: gasto.resumen_unidades.total_pendiente,
      unidades_activas: gasto.resumen_unidades.total_unidades,
    };

    const pdfBuffer = await generarLiquidacionPDF({
      condominio,
      gasto,
      egresos: gasto.egresos_operativos,
      cobrosResumen,
    });

    const nombreArchivo = `liquidacion-gasto-comun-${condominio.nombre.replace(/\s+/g, '-').toLowerCase()}-${new Date(gasto.mes_anio).toISOString().slice(0, 7)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
