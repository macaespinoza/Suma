// =============================================================================
// SUMA — Componente Importador Excel para Egresos
// Permite subir un archivo, mapear columnas, previsualizar y confirmar.
// =============================================================================

'use client';

import { useState, useRef } from 'react';
import api from '../../lib/api.js';
import Input from './Input.jsx';
import Select from './Select.jsx';
import Boton from './Boton.jsx';
import styles from './ImportadorExcel.module.css';

const CATEGORIAS_VALIDAS = [
  'Agua', 'Electricidad', 'Gas', 'Portería', 'Mantención',
  'Aseo', 'Seguridad', 'Administración', 'Seguros', 'Otro'
];

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(valor || 0);

export default function ImportadorExcel({ condominioId, gastoId, gastoMesAnio, onCerrar, onImportado }) {
  const [paso, setPaso] = useState(1);
  const [archivo, setArchivo] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [cargandoImportar, setCargandoImportar] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [erroresServidor, setErroresServidor] = useState([]);

  const [mapeo, setMapeo] = useState({
    columnaCategoria: '',
    columnaDescripcion: '',
    columnaMonto: '',
    columnaMes: ''
  });

  const inputFileRef = useRef(null);

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Solo se permiten archivos .xlsx, .xls o .csv');
      return;
    }

    setArchivo(file);
    setNombreArchivo(file.name);
    setError(null);
    setPreview(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Solo se permiten archivos .xlsx, .xls o .csv');
      return;
    }

    setArchivo(file);
    setNombreArchivo(file.name);
    setError(null);
    setPreview(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const generarPreview = async () => {
    if (!archivo) return;

    setCargandoPreview(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('mapeo', JSON.stringify(mapeo));
      formData.append('mes_anio', gastoMesAnio);

      const respuesta = await fetch(
        `http://localhost:3003/api/v1/condominios/${condominioId}/gastos/${gastoId}/egresos/importar`,
        {
          method: 'POST',
          body: formData
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error?.mensaje || 'Error al procesar el archivo');
      }

      setPreview(datos.datos);
      setErroresServidor(datos.datos.errores || []);
      setPaso(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoPreview(false);
    }
  };

  const confirmarImportacion = async () => {
    if (!preview?.preview) return;

    setCargandoImportar(true);
    setError(null);

    try {
      const egresosAImportar = preview.preview
        .filter(e => e.esValido)
        .map(e => ({
          fila: e.fila,
          categoria: e.categoria,
          descripcion: e.descripcion,
          monto: e.monto,
          mes_anio: e.mes_anio,
          esValido: true
        }));

      const respuesta = await api.post(
        `/condominios/${condominioId}/gastos/${gastoId}/egresos/importar/confirmar`,
        { egresos: egresosAImportar }
      );

      if (onImportado) {
        onImportado(respuesta.datos);
      }
      setPaso(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoImportar(false);
    }
  };

  const seleccionarColumnas = [
    { valor: '', etiqueta: '— No asignar —' },
    { valor: 'A', etiqueta: 'Columna A' },
    { valor: 'B', etiqueta: 'Columna B' },
    { valor: 'C', etiqueta: 'Columna C' },
    { valor: 'D', etiqueta: 'Columna D' },
    { valor: 'E', etiqueta: 'Columna E' },
    { valor: 'F', etiqueta: 'Columna F' },
    { valor: 'G', etiqueta: 'Columna G' },
    { valor: 'H', etiqueta: 'Columna H' },
  ];

  const renderPaso1 = () => (
    <div className={styles.paso1}>
      <div className={styles.instrucciones}>
        <h4>¿Cómo funciona?</h4>
        <ol>
          <li>Sube tu archivo Excel (.xlsx, .xls o .csv)</li>
          <li>Indica qué columna contiene la <strong>categoría</strong> y el <strong>monto</strong></li>
          <li>Previsualiza los datos detectados</li>
          <li>Confirma la importación</li>
        </ol>
        <p className={styles.nota}>
          <strong>Categorías válidas:</strong> {CATEGORIAS_VALIDAS.join(', ')}
        </p>
      </div>

      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputFileRef.current?.click()}
      >
        <input
          ref={inputFileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleArchivoChange}
          className={styles.fileInput}
        />

        {nombreArchivo ? (
          <div className={styles.archivoSeleccionado}>
            <span className={styles.iconoArchivo}>📄</span>
            <span className={styles.nombreArchivo}>{nombreArchivo}</span>
            <span className={styles.cambiarArchivo}>Cambiar</span>
          </div>
        ) : (
          <>
            <span className={styles.dropzoneIcono}>📂</span>
            <p className={styles.dropzoneTexto}>
              Arrastra tu archivo aquí o <strong>haz clic para seleccionar</strong>
            </p>
            <p className={styles.dropzoneExtensiones}>.xlsx, .xls, .csv</p>
          </>
        )}
      </div>

      {archivo && (
        <div className={styles.mapeoColumnas}>
          <h4>Asignación de columnas</h4>
          <p className={styles.mapeoDescripcion}>
            Indica qué letra corresponde a cada dato en tu archivo Excel.
          </p>

          <div className={styles.mapeoGrid}>
            <Select
              nombre="columnaCategoria"
              etiqueta="Categoría *"
              valor={mapeo.columnaCategoria}
              onChange={(e) => setMapeo(prev => ({ ...prev, columnaCategoria: e.target.value }))}
              opciones={seleccionarColumnas.filter(o => o.valor !== '')}
              placeholder="Seleccionar columna..."
              requerido
            />

            <Select
              nombre="columnaDescripcion"
              etiqueta="Descripción"
              valor={mapeo.columnaDescripcion}
              onChange={(e) => setMapeo(prev => ({ ...prev, columnaDescripcion: e.target.value }))}
              opciones={seleccionarColumnas}
              placeholder="— No asignar —"
            />

            <Select
              nombre="columnaMonto"
              etiqueta="Monto *"
              valor={mapeo.columnaMonto}
              onChange={(e) => setMapeo(prev => ({ ...prev, columnaMonto: e.target.value }))}
              opciones={seleccionarColumnas.filter(o => o.valor !== '')}
              placeholder="Seleccionar columna..."
              requerido
            />

            <Select
              nombre="columnaMes"
              etiqueta="Mes/Año (opcional)"
              valor={mapeo.columnaMes}
              onChange={(e) => setMapeo(prev => ({ ...prev, columnaMes: e.target.value }))}
              opciones={seleccionarColumnas}
              placeholder="— Usar mes del gasto —"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderPaso2 = () => {
    if (!preview) return null;

    const previewItems = preview.preview || [];
    const totalMonto = previewItems.reduce((sum, e) => sum + (e.monto || 0), 0);
    const erroresCount = previewItems.filter(e => !e.esValido).length;

    return (
      <div className={styles.paso2}>
        <div className={styles.resumenPreview}>
          <div className={styles.resumenItem}>
            <span className={styles.resumenNumero}>{preview.filas_con_datos}</span>
            <span className={styles.resumenLabel}>filas con datos</span>
          </div>
          <div className={styles.resumenItem}>
            <span className={styles.resumenNumero}>{formatoMoneda(totalMonto)}</span>
            <span className={styles.resumenLabel}>total detectado</span>
          </div>
          {erroresCount > 0 && (
            <div className={`${styles.resumenItem} ${styles.resumenItemError}`}>
              <span className={styles.resumenNumero}>{erroresCount}</span>
              <span className={styles.resumenLabel}>con errores</span>
            </div>
          )}
        </div>

        {preview.mes_detectado && (
          <div className={styles.mesDetectado}>
            <span>📅 Mes/Año detectado: <strong>{preview.mes_detectado.mes}/{preview.mes_detectado.anio}</strong></span>
          </div>
        )}

        <div className={styles.tablaPreview}>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.slice(0, 30).map((item, idx) => (
                  <tr key={idx} className={!item.esValido ? styles.filaError : ''}>
                    <td>{item.fila}</td>
                    <td>
                      {item.categoria || <span className={styles.sinValor}>—</span>}
                    </td>
                    <td className={styles.descripcionCell}>
                      {item.descripcion || <span className={styles.sinValor}>—</span>}
                    </td>
                    <td className={styles.montoCell}>
                      {item.monto ? formatoMoneda(item.monto) : (
                        <span className={styles.montoInvalido}>{item.montoOriginal || '—'}</span>
                      )}
                    </td>
                    <td>
                      {item.esValido ? (
                        <span className={styles.tagOk}>✓</span>
                      ) : (
                        <span className={styles.tagError} title={item.errores?.join(', ')}>
                          ✗ {item.errores?.[0]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewItems.length > 30 && (
            <p className={styles.masResultados}>
              Mostrando 30 de {previewItems.length} filas
            </p>
          )}
        </div>

        {erroresCount > 0 && (
          <div className={styles.advertencia}>
            <span>⚠️</span>
            <p>
              {erroresCount} fila(s) tienen errores y <strong>no se importarán</strong>.
              Puedes corregir el archivo Excel y subirlo de nuevo.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderPaso3 = () => (
    <div className={styles.paso3}>
      <div className={styles.exito}>
        <span className={styles.exitoIcono}>✅</span>
        <h3>¡Importación completada!</h3>
        <p>Los egresos se han agregado al período de gasto.</p>
      </div>
    </div>
  );

  return (
    <div className={styles.importador}>
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {paso === 1 && renderPaso1()}
      {paso === 2 && renderPaso2()}
      {paso === 3 && renderPaso3()}

      <div className={styles.acciones}>
        {paso === 1 && (
          <>
            <Boton variante="fantasma" onClick={onCerrar}>
              Cancelar
            </Boton>
            <Boton
              variante="primario"
              onClick={generarPreview}
              disabled={!archivo || !mapeo.columnaCategoria || !mapeo.columnaMonto}
              cargando={cargandoPreview}
            >
              Previsualizar →
            </Boton>
          </>
        )}

        {paso === 2 && (
          <>
            <Boton variante="fantasma" onClick={() => setPaso(1)}>
              ← Volver
            </Boton>
            <Boton
              variante="primario"
              onClick={confirmarImportacion}
              cargando={cargandoImportar}
              disabled={preview?.preview?.filter(e => e.esValido).length === 0}
            >
              Importar {preview?.preview?.filter(e => e.esValido).length || 0} egresos
            </Boton>
          </>
        )}

        {paso === 3 && (
          <Boton variante="primario" onClick={onCerrar}>
            Cerrar
          </Boton>
        )}
      </div>
    </div>
  );
}