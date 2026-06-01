// =============================================================================
// SUMA — Servicio de Importación de Egresos desde Excel
// Lógica de negocio: parseo, validación, detección de meses y batch insert.
// =============================================================================

import * as gastosRepo from '../repositorios/gastos.repositorio.js';
import * as unidadesRepo from '../repositorios/condominios.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';
import pkg from 'xlsx';
const { XLSX } = pkg;

const CATEGORIAS_VALIDAS = [
  'Agua', 'Electricidad', 'Gas', 'Portería', 'Mantención',
  'Aseo', 'Seguridad', 'Administración', 'Seguros', 'Otro'
];

const MESES_ES = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
  'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
  'septiembre': 9, 'setiembre': 9, 'octubre': 10,
  'noviembre': 11, 'diciembre': 12
};

const PATRONES_MES = [
  /^(\d{1,2})\/(\d{4})$/,
  /^(\d{1,2})-(\d{4})$/,
  /^(\d{4})-(\d{2})$/,
  /^(\d{4})\/(\d{1,2})$/
];

const extraerMesAnio = (valor) => {
  if (!valor) return null;
  const str = String(valor).toLowerCase().trim();

  for (const [nombre, numero] of Object.entries(MESES_ES)) {
    const idx = str.indexOf(nombre);
    if (idx !== -1) {
      const antes = str.substring(0, idx).trim();
      const despues = str.substring(idx + nombre.length).trim();
      let anio = null;
      if (/\d{4}/.test(antes)) {
        const match = antes.match(/(\d{4})/);
        anio = parseInt(match[1], 10);
      } else if (/\d{4}/.test(despues)) {
        const match = despues.match(/(\d{4})/);
        anio = parseInt(match[1], 10);
      }
      if (anio) {
        return { mes: numero, anio };
      }
    }
  }

  for (const patron of PATRONES_MES) {
    const match = str.match(patron);
    if (match) {
      const a = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      if (a > 12) {
        return { mes: b, anio: a };
      } else {
        return { mes: a, anio: b };
      }
    }
  }

  return null;
};

const detectarMesAnioGlobal = (filas) => {
  for (const fila of filas) {
    for (const celda of Object.values(fila)) {
      if (celda && typeof celda === 'string') {
        const resultado = extraerMesAnio(celda);
        if (resultado) return resultado;
      }
      if (celda && typeof celda === 'number') {
        const fecha = new Date(celda);
        if (!isNaN(fecha.getTime()) && fecha.getFullYear() > 2000) {
          return { mes: fecha.getMonth() + 1, anio: fecha.getFullYear() };
        }
      }
    }
  }
  return null;
};

const detectarCategoria = (valor) => {
  if (!valor) return null;
  const str = String(valor).toLowerCase().trim();

  const mapa = {
    'agua': 'Agua',
    'electricidad': 'Electricidad',
    'luz': 'Electricidad',
    'gas': 'Gas',
    'porteria': 'Portería',
    'portería': 'Portería',
    'conserje': 'Portería',
    'mantencion': 'Mantención',
    'mantención': 'Mantención',
    'mantenimiento': 'Mantención',
    'aseo': 'Aseo',
    'limpieza': 'Aseo',
    'seguridad': 'Seguridad',
    'camara': 'Seguridad',
    'camaras': 'Seguridad',
    'administracion': 'Administración',
    'administración': 'Administración',
    'admin': 'Administración',
    'seguros': 'Seguros',
    'seguro': 'Seguros',
    'otro': 'Otro',
    'varios': 'Otro',
    'general': 'Otro'
  };

  for (const [key, categoria] of Object.entries(mapa)) {
    if (str.includes(key)) return categoria;
  }

  for (const cat of CATEGORIAS_VALIDAS) {
    if (str.includes(cat.toLowerCase())) return cat;
  }

  return null;
};

const extraerMonto = (valor) => {
  if (typeof valor === 'number') return valor;
  if (!valor) return null;

  const str = String(valor).replace(/\s/g, '').replace(/[#$]/g, '');

  const match = str.match(/^[\d.,]+$/);
  if (!match) return null;

  let limpio = str;
  const puntos = (str.match(/\./g) || []).length;
  const comas = (str.match(/,/g) || []).length;

  if (puntos > 0 && comas > 0) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      limpio = str.replace(/\./g, '').replace(',', '.');
    } else {
      limpio = str.replace(/,/g, '');
    }
  } else if (comas === 1 && !str.includes('.')) {
    limpio = str.replace(',', '.');
  }

  const num = parseFloat(limpio);
  return isNaN(num) ? null : Math.round(num * 100) / 100;
};

export const parsearExcelYPreview = async (buffer, mapeo, mesAnioDefecto) => {
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  } catch {
    throw new ErrorApp('No se pudo leer el archivo Excel. Asegúrate de que sea un archivo .xlsx o .csv válido.', 400);
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new ErrorApp('El archivo Excel no contiene hojas.', 400);
  }

  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const filasRaw = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' });

  if (filasRaw.length < 2) {
    throw new ErrorApp('El archivo debe contener al menos una fila de encabezados y una fila de datos.', 400);
  }

  const encabezados = filasRaw[0];
  const datos = filasRaw.slice(1);

  const colCat = mapeo.columnaCategoria ? mapeo.columnaCategoria.toUpperCase().charCodeAt(0) - 65 : null;
  const colDesc = mapeo.columnaDescripcion ? mapeo.columnaDescripcion.toUpperCase().charCodeAt(0) - 65 : null;
  const colMonto = mapeo.columnaMonto ? mapeo.columnaMonto.toUpperCase().charCodeAt(0) - 65 : null;
  const colMes = mapeo.columnaMes ? mapeo.columnaMes.toUpperCase().charCodeAt(0) - 65 : null;

  if (colCat === null || colMonto === null) {
    throw new ErrorApp('Las columnas de Categoría y Monto son obligatorias.', 400);
  }

  const detectarMesGlobal = datos.some(f => {
    for (let i = 0; i < f.length; i++) {
      if (i !== colCat && i !== colDesc && i !== colMonto) {
        if (extraerMesAnio(f[i])) return true;
      }
    }
    return false;
  });

  const mesAnioDetectado = detectarMesGlobal ? detectarMesAnioGlobal(datos) : null;

  const mesAnioBase = mesAnioDefecto || (
    mesAnioDetectado
      ? `${mesAnioDetectado.anio}-${String(mesAnioDetectado.mes).padStart(2, '0')}-01`
      : null
  );

  const egresos = [];
  const errores = [];

  for (let i = 0; i < datos.length; i++) {
    const fila = datos[i];
    const numeroFila = i + 2;

    if (fila.every(c => !c || c === '')) continue;

    const rawCategoria = colCat !== null ? fila[colCat] : '';
    const rawDescripcion = colDesc !== null ? fila[colDesc] : '';
    const rawMonto = colMonto !== null ? fila[colMonto] : '';
    const rawMes = colMes !== null ? fila[colMes] : (detectarMesGlobal ? null : undefined);

    const categoriaDetectada = detectarCategoria(rawCategoria);
    const montoExtraido = extraerMonto(rawMonto);

    let mesAnioFila = mesAnioBase;
    if (rawMes !== undefined && rawMes !== '' && rawMes !== null) {
      const detectado = extraerMesAnio(rawMes);
      if (detectado) {
        mesAnioFila = `${detectado.anio}-${String(detectado.mes).padStart(2, '0')}-01`;
      }
    } else if (!mesAnioBase && detectarMesGlobal) {
      const detectado = detectarMesGlobal;
      mesAnioFila = `${detectado.anio}-${String(detectado.mes).padStart(2, '0')}-01`;
    }

    const erroresFila = [];

    if (!rawCategoria || String(rawCategoria).trim() === '') {
      erroresFila.push('Categoría vacía');
    } else if (!categoriaDetectada) {
      erroresFila.push(`Categoría no reconocida: "${rawCategoria}"`);
    }

    if (!rawMonto || String(rawMonto).trim() === '') {
      erroresFila.push('Monto vacío');
    } else if (montoExtraido === null) {
      erroresFila.push(`Monto inválido: "${rawMonto}"`);
    } else if (montoExtraido <= 0) {
      erroresFila.push(`Monto debe ser mayor a 0`);
    }

    if (!mesAnioFila) {
      erroresFila.push('No se pudo determinar el mes/año');
    }

    egresos.push({
      fila: numeroFila,
      categoria: categoriaDetectada || '',
      descripcion: String(rawDescripcion || '').trim(),
      monto: montoExtraido,
      montoOriginal: rawMonto,
      mes_anio: mesAnioFila,
      errores: erroresFila,
      esValido: erroresFila.length === 0
    });

    if (erroresFila.length > 0) {
      errores.push({ fila: numeroFila, errores: erroresFila });
    }
  }

  if (egresos.length === 0) {
    throw new ErrorApp('No se encontraron datos válidos en el archivo.', 400);
  }

  return {
    total_filas: datos.length,
    filas_con_datos: egresos.length,
    errores_count: errores.length,
    mes_anio_defecto: mesAnioBase,
    mes_detectado: mesAnioDetectado,
    encabezados: encabezados.filter(h => h !== ''),
    preview: egresos.slice(0, 50),
    errores
  };
};

export const importarEgresos = async (gastoId, egresosValidados) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto común no existe.', 404);
  }

  if (gasto.estado !== 'borrador') {
    throw new ErrorApp('No se pueden importar egresos a un gasto ya publicado.', 400);
  }

  const condominio = await unidadesRepo.obtenerPorId(gasto.condominio_id);
  if (!condominio) {
    throw new ErrorApp('El condominio no existe.', 404);
  }

  const resultados = { exitosos: 0, fallidos: 0, detalles: [] };

  for (const egreso of egresosValidados) {
    if (!egreso.esValido) {
      resultados.fallidos++;
      resultados.detalles.push({
        fila: egreso.fila,
        categoria: egreso.categoria,
        monto: egreso.monto,
        error: egreso.errores?.[0] || 'Datos inválidos'
      });
      continue;
    }

    try {
      await gastosRepo.crearEgreso({
        gastoComunMesId: gastoId,
        categoria: egreso.categoria,
        descripcion: egreso.descripcion || null,
        monto: egreso.monto
      });
      resultados.exitosos++;
      resultados.detalles.push({
        fila: egreso.fila,
        categoria: egreso.categoria,
        monto: egreso.monto,
        exito: true
      });
    } catch {
      resultados.fallidos++;
      resultados.detalles.push({
        fila: egreso.fila,
        categoria: egreso.categoria,
        monto: egreso.monto,
        error: 'Error al insertar en base de datos'
      });
    }
  }

  await gastosRepo.actualizarTotalConSumaEgresos(gastoId);

  return resultados;
};

export const obtenerGastoContexto = async (condominioId, gastoId) => {
  const gasto = await gastosRepo.obtenerPorId(gastoId);
  if (!gasto) {
    throw new ErrorApp('El gasto no existe.', 404);
  }
  if (gasto.condominio_id !== condominioId) {
    throw new ErrorApp('El gasto no pertenece a este condominio.', 400);
  }
  return gasto;
};