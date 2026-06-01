// =============================================================================
// SUMA — Controlador de Importación Excel para Egresos
// Capa HTTP: recibe archivo, llama al servicio, devuelve preview o confirmación.
// =============================================================================

import * as servicio from '../servicios/importacionExcel.servicio.js';
import { respuestaExitosa, respuestaCreado } from '../utilidades/respuesta.js';
import { ErrorApp } from '../middlewares/errores.js';

export const parsearYPreview = async (req, res, next) => {
  try {
    const { condominioId, gastoId } = req.params;

    if (!req.file) {
      throw new ErrorApp('Debes subir un archivo Excel (.xlsx o .csv).', 400);
    }

    const { mapeo, mes_anio } = req.body;
    if (!mapeo || !mapeo.columnaCategoria || !mapeo.columnaMonto) {
      throw new ErrorApp('El mapeo de columnas es obligatorio. Debe incluir columnaCategoria y columnaMonto.', 400);
    }

    await servicio.obtenerGastoContexto(condominioId, gastoId);

    const resultado = await servicio.parsearExcelYPreview(
      req.file.buffer,
      mapeo,
      mes_anio || null
    );

    return respuestaExitosa(res, resultado);
  } catch (error) {
    next(error);
  }
};

export const confirmarImportacion = async (req, res, next) => {
  try {
    const { condominioId, gastoId } = req.params;
    const { egresos } = req.body;

    if (!egresos || !Array.isArray(egresos) || egresos.length === 0) {
      throw new ErrorApp('Debes proporcionar la lista de egresos a importar.', 400);
    }

    await servicio.obtenerGastoContexto(condominioId, gastoId);

    const resultados = await servicio.importarEgresos(gastoId, egresos);

    return respuestaCreado(res, {
      mensaje: `Importación completada: ${resultados.exitosos} egresos creados, ${resultados.fallidos} fallidos.`,
      exitosos: resultados.exitosos,
      fallidos: resultados.fallidos,
      detalles: resultados.detalles
    });
  } catch (error) {
    next(error);
  }
};