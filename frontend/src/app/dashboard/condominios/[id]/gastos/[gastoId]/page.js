// =============================================================================
// SUMA — Detalle de Gasto Común
// Vista completa: egresos por categoría rápida, subida de documentos y previsualización.
// =============================================================================

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../../lib/api.js';
import Boton from '../../../../../../componentes/ui/Boton.jsx';
import Input from '../../../../../../componentes/ui/Input.jsx';
import Select from '../../../../../../componentes/ui/Select.jsx';
import Modal from '../../../../../../componentes/ui/Modal.jsx';
import ImportadorExcel from '../../../../../../componentes/ui/ImportadorExcel.jsx';
import styles from './detalle.module.css';

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(valor || 0);

const formatearMes = (fecha) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  });
};

const CATEGORIAS_RAPIDAS = [
  { nombre: 'Agua', icono: '💧' },
  { nombre: 'Luz', icono: '⚡' },
  { nombre: 'Aseo', icono: '🧹' },
  { nombre: 'Conserjería', icono: '🛡️' },
  { nombre: 'Administración', icono: '📋' },
  { nombre: 'Mantención', icono: '🔧' },
  { nombre: 'Reparación', icono: '🔨' },
  { nombre: 'Emergencia', icono: '🚨' },
  { nombre: 'Otros', icono: '📦' }
];

const CATEGORIAS_COMPLETAS = [
  'Agua', 'Luz', 'Aseo', 'Conserjería', 'Administración',
  'Mantención', 'Reparación', 'Otros', 'Emergencia',
  'Electricidad', 'Gas', 'Portería', 'Seguridad', 'Seguros', 'Otro'
];

const AGRUPACIONES = {
  'Agua': 'Servicios Básicos',
  'Luz': 'Servicios Básicos',
  'Electricidad': 'Servicios Básicos',
  'Gas': 'Servicios Básicos',
  'Conserjería': 'Personal',
  'Portería': 'Personal',
  'Seguridad': 'Personal',
  'Administración': 'Personal',
  'Mantención': 'Operación',
  'Reparación': 'Operación',
  'Aseo': 'Operación',
  'Emergencia': 'Operación',
  'Seguros': 'Administración',
  'Otros': 'Varios',
  'Otro': 'Varios',
};

const ICONOS_CATEGORIA = {
  'Agua': '💧',
  'Luz': '⚡',
  'Electricidad': '⚡',
  'Gas': '🔥',
  'Conserjería': '🛡️',
  'Portería': '🛡️',
  'Seguridad': '🔒',
  'Administración': '📋',
  'Mantención': '🔧',
  'Reparación': '🔨',
  'Aseo': '🧹',
  'Emergencia': '🚨',
  'Seguros': '🛡️',
  'Otros': '📦',
  'Otro': '📦',
};

export default function PaginaDetalleGasto() {
  const router = useRouter();
  const params = useParams();
  const condominioId = params.id;
  const gastoId = params.gastoId;

  const [gasto, setGasto] = useState(null);
  const [condominio, setCondominio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalEgreso, setModalEgreso] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [modalPrevisualizacion, setModalPrevisualizacion] = useState(false);

  const [egresoForm, setEgresoForm] = useState({ categoria: '', descripcion: '', monto: '', archivo_respaldo_url: '' });
  const [isCategoriaFija, setIsCategoriaFija] = useState(false);
  const [guardandoEgreso, setGuardandoEgreso] = useState(false);
  const [archivoSubiendo, setArchivoSubiendo] = useState(false);
  const inputArchivoRef = useRef(null);

  const [publicando, setPublicando] = useState(false);
  const [despublicando, setDespublicando] = useState(false);
  const [egresoAEditar, setEgresoAEditar] = useState(null);

  const [fondoReservaInput, setFondoReservaInput] = useState('');
  const [guardandoFondo, setGuardandoFondo] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resGasto, resCondominio] = await Promise.all([
          api.get(`/condominios/${condominioId}/gastos/${gastoId}`),
          api.get(`/condominios/${condominioId}`),
        ]);
        setGasto(resGasto.datos);
        setCondominio(resCondominio.datos);
        setFondoReservaInput(resGasto.datos.monto_fondo_reserva?.toString() || '');
      } catch (err) {
        setError(err.message || 'Error al cargar el gasto.');
      } finally {
        setCargando(false);
      }
    };

    if (condominioId && gastoId) {
      cargarDatos();
    }
  }, [condominioId, gastoId]);

  const agruparEgresos = (egresos) => {
    const agrupados = {};
    egresos.forEach((e) => {
      const grupo = AGRUPACIONES[e.categoria] || 'Varios';
      if (!agrupados[grupo]) agrupados[grupo] = { total: 0, items: [] };
      agrupados[grupo].total += parseFloat(e.monto);
      agrupados[grupo].items.push(e);
    });
    return agrupados;
  };

  const handleAbrirModalRapido = (categoriaSeleccionada) => {
    setEgresoAEditar(null);
    setEgresoForm({ categoria: categoriaSeleccionada, descripcion: '', monto: '', archivo_respaldo_url: '' });
    setIsCategoriaFija(!!categoriaSeleccionada);
    setModalEgreso(true);
  };

  const handleSubirArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setArchivoSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/condominios/${condominioId}/gastos/${gastoId}/subir-respaldo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.exito) {
        setEgresoForm(prev => ({ ...prev, archivo_respaldo_url: data.datos.url }));
      } else {
        alert(data.error?.mensaje || 'Error al subir documento');
      }
    } catch (err) {
      alert('Hubo un problema de conexión al subir el archivo.');
    } finally {
      setArchivoSubiendo(false);
    }
  };

  const handleAgregarEgreso = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!egresoForm.categoria || !egresoForm.monto) return;

    setGuardandoEgreso(true);
    setError(null);
    try {
      await api.post(`/condominios/${condominioId}/gastos/${gastoId}/egresos`, {
        categoria: egresoForm.categoria,
        descripcion: egresoForm.descripcion || null,
        monto: parseFloat(egresoForm.monto),
        archivo_respaldo_url: egresoForm.archivo_respaldo_url || null
      });
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
      setModalEgreso(false);
      setEgresoForm({ categoria: '', descripcion: '', monto: '', archivo_respaldo_url: '' });
    } catch (err) {
      setError(err.message || 'No se pudo agregar el egreso.');
    } finally {
      setGuardandoEgreso(false);
    }
  };

  const handleAbrirEditarEgreso = (egreso) => {
    setEgresoAEditar(egreso);
    setEgresoForm({
      categoria: egreso.categoria,
      descripcion: egreso.descripcion || '',
      monto: egreso.monto.toString(),
      archivo_respaldo_url: egreso.archivo_respaldo_url || ''
    });
    setIsCategoriaFija(true);
    setModalEgreso(true);
  };

  const handleEditarEgreso = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!egresoForm.categoria || !egresoForm.monto || !egresoAEditar) return;

    setGuardandoEgreso(true);
    setError(null);
    try {
      await api.patch(`/condominios/${condominioId}/gastos/${gastoId}/egresos/${egresoAEditar.id}`, {
        categoria: egresoForm.categoria,
        descripcion: egresoForm.descripcion || null,
        monto: parseFloat(egresoForm.monto),
        archivo_respaldo_url: egresoForm.archivo_respaldo_url || null
      });
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
      setModalEgreso(false);
      setEgresoAEditar(null);
      setEgresoForm({ categoria: '', descripcion: '', monto: '', archivo_respaldo_url: '' });
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el egreso.');
    } finally {
      setGuardandoEgreso(false);
    }
  };

  const handleEliminarEgreso = async (egresoId) => {
    if (!confirm('¿Estás seguro de eliminar este egreso? El total del período se recalculará automáticamente.')) {
      return;
    }
    setError(null);
    try {
      await api.delete(`/condominios/${condominioId}/gastos/${gastoId}/egresos/${egresoId}`);
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el egreso.');
    }
  };

  const confirmarPublicar = async () => {
    setPublicando(true);
    setError(null);
    try {
      await api.post(`/condominios/${condominioId}/gastos/${gastoId}/publicar`);
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
      setModalPrevisualizacion(false);
    } catch (err) {
      setError(err.message || 'No se pudo publicar el gasto.');
    } finally {
      setPublicando(false);
    }
  };

  const handleDespublicar = async () => {
    if (!confirm('¿Estás seguro de deshacer la publicación de este gasto? Se eliminarán todos los cobros de unidad generados.')) {
      return;
    }
    setDespublicando(true);
    setError(null);
    try {
      await api.post(`/condominios/${condominioId}/gastos/${gastoId}/despublicar`);
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
      // Al despublicar, refrescamos el condominio también por si afectó el saldo de reserva histórico.
      const resCond = await api.get(`/condominios/${condominioId}`);
      setCondominio(resCond.datos);
    } catch (err) {
      setError(err.message || 'No se pudo deshacer la publicación del gasto.');
    } finally {
      setDespublicando(false);
    }
  };

  const guardarFondoReserva = async () => {
    setGuardandoFondo(true);
    try {
      await api.patch(`/condominios/${condominioId}/gastos/${gastoId}`, {
        total_gastos: gasto.total_gastos,
        monto_fondo_reserva: parseFloat(fondoReservaInput || 0)
      });
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
      alert('Fondo de Reserva guardado correctamente.');
    } catch (err) {
      alert(err.message || 'Error al guardar el fondo de reserva.');
    } finally {
      setGuardandoFondo(false);
    }
  };

  const handleImportado = async () => {
    const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
    setGasto(res.datos);
    setModalImportar(false);
  };

  const egresosAgrupados = agruparEgresos(gasto?.egresos_operativos || []);

  if (cargando) {
    return (
      <div className={styles.cargando}>
        <div className={styles.cargandoSpinner} />
        <p>Cargando detalle del gasto...</p>
      </div>
    );
  }

  if (error || !gasto) {
    return (
      <div className={styles.error}>
        <h3>Error</h3>
        <p>{error || 'Gasto no encontrado.'}</p>
        <Boton variante="fantasma" onClick={() => router.push(`/dashboard/condominios/${condominioId}/gastos`)}>
          Volver a Gastos
        </Boton>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div className={styles.cabeceraNavegacion}>
          <Link href="/dashboard/condominios" className={styles.vinculoBreadcrumb}>Condominios</Link>
          <span className={styles.separadorBreadcrumb}>/</span>
          <Link href={`/dashboard/condominios/${condominioId}/gastos`} className={styles.vinculoBreadcrumb}>Gastos</Link>
          <span className={styles.separadorBreadcrumb}>/</span>
          <span className={styles.paginaActual}>{formatearMes(gasto.mes_anio)}</span>
        </div>
        <div className={styles.cabeceraAcciones}>
          <Boton variante="outline" onClick={() => router.push(`/dashboard/condominios/${condominioId}/gastos`)}>
            ← Volver
          </Boton>
          {gasto.estado === 'borrador' && (
            <Boton variante="primario" onClick={() => setModalPrevisualizacion(true)} cargando={publicando}>
              ✓ Publicar Gasto
            </Boton>
          )}
          {gasto.estado === 'publicado' && (
            <>
              <Boton variante="peligro" onClick={handleDespublicar} cargando={despublicando}>
                ↩ Deshacer Publicación
              </Boton>
              <Boton
                variante="primario"
                onClick={() => {
                  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
                  window.open(`${apiBaseUrl}/condominios/${condominioId}/gastos/${gastoId}/liquidacion?descargar=true`, '_blank');
                }}
              >
                📄 Descargar PDF
              </Boton>
            </>
          )}
        </div>
      </div>

      {/* Título */}
      <div className={styles.tituloSeccion}>
        <div className={styles.tituloRow}>
          <h1 className={styles.titulo}>{formatearMes(gasto.mes_anio)}</h1>
          <span className={`${styles.estadoBadge} ${gasto.estado === 'publicado' ? styles.estadoPublicado : styles.estadoBorrador}`}>
            {gasto.estado === 'publicado' ? '✓Publicado' : '⏳Borrador'}
          </span>
        </div>
        <p className={styles.subtitulo}>{condominio?.nombre}</p>
      </div>

      {/* Resumen */}
      <div className={styles.resumenGrid}>
        <div className={styles.resumenCard}>
          <span className={styles.resumenLabel}>Total Egresos</span>
          <span className={styles.resumenValor}>{formatoMoneda(gasto.total_gastos)}</span>
        </div>
        <div className={styles.resumenCard}>
          <span className={styles.resumenLabel}>Cobrado</span>
          <span className={styles.resumenValor}>{formatoMoneda(gasto.resumen_unidades?.total_cobrado)}</span>
        </div>
        <div className={`${styles.resumenCard} ${styles.resumenCardExito}`}>
          <span className={styles.resumenLabel}>Recaudado</span>
          <span className={styles.resumenValor}>{formatoMoneda(gasto.resumen_unidades?.total_pagado)}</span>
        </div>
        <div className={`${styles.resumenCard} ${styles.resumenCardAdvertencia}`}>
          <span className={styles.resumenLabel}>Pendiente</span>
          <span className={styles.resumenValor}>{formatoMoneda(gasto.resumen_unidades?.total_pendiente)}</span>
        </div>
      </div>

      {gasto.estado === 'borrador' && (
        <div className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Fondo de Reserva / Ahorro Comunitario</h2>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>
              Ahorro Comunitario: <span style={{ color: '#1a56db' }}>{formatoMoneda(gasto.monto_fondo_reserva || 0)}</span>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px', marginBottom: 0 }}>
              Calculado automáticamente como el {condominio?.porcentaje_fondo_reserva ? parseFloat(condominio.porcentaje_fondo_reserva) * 100 : 0}% del total de los egresos operacionales. Este porcentaje puede configurarse en los ajustes del condominio.
            </p>
          </div>
        </div>
      )}

      {/* Acciones Rápidas (Solo en borrador) */}
      {gasto.estado === 'borrador' && (
        <div className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Acciones Rápidas de Egreso</h2>
          <div className={styles.tarjetasRapidasGrid}>
            {CATEGORIAS_RAPIDAS.map((cat) => (
              <div 
                key={cat.nombre} 
                className={styles.tarjetaRapida} 
                onClick={() => handleAbrirModalRapido(cat.nombre)}
              >
                <span className={styles.tarjetaRapidaIcono}>{cat.icono}</span>
                <span className={styles.tarjetaRapidaNombre}>{cat.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Egresos */}
      <div className={styles.seccion}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>📑 Detalle de Egresos</h2>
          {gasto.estado === 'borrador' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Boton variante="fantasma" tamano="sm" onClick={() => setModalImportar(true)}>
                📥 Importar Excel
              </Boton>
              <Boton variante="outline" tamano="sm" onClick={() => handleAbrirModalRapido('')}>
                + Otro Egreso
              </Boton>
            </div>
          )}
        </div>

        <div className={styles.egresosGrid}>
          {Object.entries(egresosAgrupados).map(([grupo, data]) => (
            <div key={grupo} className={styles.grupoCard}>
              <div className={styles.grupoHeader}>
                <span className={styles.grupoNombre}>{grupo}</span>
                <span className={styles.grupoTotal}>{formatoMoneda(data.total)}</span>
              </div>
              <div className={styles.grupoItems}>
                {data.items.map((egreso) => (
                  <div key={egreso.id} className={styles.egresoItem}>
                    <div className={styles.egresoInfo}>
                      <span className={styles.egresoIcono}>{ICONOS_CATEGORIA[egreso.categoria] || '📦'}</span>
                      <div>
                        <span className={styles.egresoNombre}>{egreso.categoria}</span>
                        {egreso.descripcion && (
                          <span className={styles.egresoDescripcion}>{egreso.descripcion}</span>
                        )}
                        {egreso.archivo_respaldo_url && (
                          <a href={egreso.archivo_respaldo_url} target="_blank" rel="noopener noreferrer" className={styles.enlaceRespaldo}>
                            📎 Ver Comprobante
                          </a>
                        )}
                      </div>
                    </div>
                    <div className={styles.egresoMontoYAcciones}>
                      <span className={styles.egresoMonto}>{formatoMoneda(parseFloat(egreso.monto))}</span>
                      {gasto.estado === 'borrador' && (
                        <div className={styles.egresoAcciones}>
                          <button
                            className={styles.botonAccionEgreso}
                            onClick={() => handleAbrirEditarEgreso(egreso)}
                            title="Editar egreso"
                          >
                            ✏️
                          </button>
                          <button
                            className={styles.botonAccionEgreso}
                            onClick={() => handleEliminarEgreso(egreso.id)}
                            title="Eliminar egreso"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(egresosAgrupados).length === 0 && (
          <div className={styles.vacio}>
            <span>📭</span>
            <p>No hay egresos registrados.</p>
          </div>
        )}
      </div>

      {/* Cobros */}
      {gasto.estado === 'publicado' && (
        <div className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>💰 Cobros por Unidad</h2>
            <Boton
              variante="outline"
              tamano="sm"
              onClick={() => router.push(`/dashboard/condominios/${condominioId}/gastos/${gastoId}/cobros`)}
            >
              Ver Gestión de Cobros →
            </Boton>
          </div>
          <div className={styles.cobrosResumenMini}>
            <div className={styles.cobrosEstadistica}>
              <span className={styles.cobrosNumero}>{formatoMoneda(gasto.resumen_unidades?.total_cobrado || 0)}</span>
              <span className={styles.cobrosLabel}>Total a Cobrar</span>
            </div>
            <div className={`${styles.cobrosEstadistica} ${styles.cobrosEstadisticaExito}`}>
              <span className={styles.cobrosNumero}>{formatoMoneda(gasto.resumen_unidades?.total_pagado || 0)}</span>
              <span className={styles.cobrosLabel}>Recaudado</span>
            </div>
            <div className={`${styles.cobrosEstadistica} ${styles.cobrosEstadisticaAdvertencia}`}>
              <span className={styles.cobrosNumero}>{formatoMoneda(gasto.resumen_unidades?.total_pendiente || 0)}</span>
              <span className={styles.cobrosLabel}>Pendiente</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Egreso */}
      {modalEgreso && (
        <Modal
          abierto={modalEgreso}
          titulo={
            egresoAEditar 
              ? `Editar Egreso ${egresoForm.categoria}` 
              : isCategoriaFija 
                ? `Ingresar Gasto de ${egresoForm.categoria}` 
                : "Agregar Egreso"
          }
          onCerrar={() => {
            setModalEgreso(false);
            setEgresoAEditar(null);
            setEgresoForm({ categoria: '', descripcion: '', monto: '', archivo_respaldo_url: '' });
            setIsCategoriaFija(false);
          }}
          acciones={
            <>
              <Boton
                variante="fantasma"
                onClick={() => {
                  setModalEgreso(false);
                  setEgresoAEditar(null);
                  setEgresoForm({ categoria: '', descripcion: '', monto: '', archivo_respaldo_url: '' });
                  setIsCategoriaFija(false);
                }}
              >
                Cancelar
              </Boton>
              <Boton
                variante="primario"
                onClick={egresoAEditar ? handleEditarEgreso : handleAgregarEgreso}
                cargando={guardandoEgreso}
                disabled={archivoSubiendo}
              >
                {egresoAEditar ? "Guardar" : "Agregar"}
              </Boton>
            </>
          }
        >
          <form onSubmit={egresoAEditar ? handleEditarEgreso : handleAgregarEgreso} className={styles.formEgreso}>
            <div className={styles.montoGiganteContainer}>
              <label className={styles.montoGiganteLabel}>Monto a Ingresar (CLP)</label>
              <input
                type="number"
                className={styles.montoGiganteInput}
                value={egresoForm.monto}
                onChange={(e) => setEgresoForm((prev) => ({ ...prev, monto: e.target.value }))}
                required
                placeholder="0"
                autoFocus
              />
            </div>

            {!isCategoriaFija && (
              <Select
                nombre="categoria"
                etiqueta="Categoría"
                valor={egresoForm.categoria}
                onChange={(e) => setEgresoForm((prev) => ({ ...prev, categoria: e.target.value }))}
                opciones={CATEGORIAS_COMPLETAS.map((cat) => ({ valor: cat, etiqueta: cat }))}
                placeholder="Seleccionar categoría..."
                requerido
              />
            )}

            <Input
              nombre="descripcion"
              etiqueta="Descripción (opcional)"
              valor={egresoForm.descripcion}
              onChange={(e) => setEgresoForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Ej: Factura ABC-123"
            />

            <div className={styles.inputArchivoContainer}>
              <span className={styles.inputArchivoLabel}>Comprobante (opcional)</span>
              
              {!egresoForm.archivo_respaldo_url ? (
                <div 
                  className={styles.inputArchivoZona} 
                  onClick={() => inputArchivoRef.current && inputArchivoRef.current.click()}
                >
                  <input
                    type="file"
                    ref={inputArchivoRef}
                    className={styles.inputArchivo}
                    onChange={handleSubirArchivo}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <span style={{ fontSize: '2rem' }}>📎</span>
                  {archivoSubiendo ? (
                    <span className={styles.archivoTexto}>Subiendo archivo...⏳</span>
                  ) : (
                    <span className={styles.archivoTexto}>Haz clic para cargar documento (PDF, IMG)</span>
                  )}
                </div>
              ) : (
                <div className={styles.archivoBadge}>
                  <span>✅ Comprobante Adjunto</span>
                  <button 
                    type="button" 
                    onClick={() => setEgresoForm(prev => ({ ...prev, archivo_respaldo_url: '' }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}
                  >
                    ❌ Quitar
                  </button>
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Previsualización de Liquidación */}
      {modalPrevisualizacion && (
        <Modal
          abierto={modalPrevisualizacion}
          titulo="Vista Previa de la Liquidación"
          tamano="lg"
          onCerrar={() => setModalPrevisualizacion(false)}
          acciones={
            <>
              <Boton variante="outline" onClick={() => setModalPrevisualizacion(false)}>
                ✏️ Volver a Editar
              </Boton>
              <Boton variante="primario" onClick={confirmarPublicar} cargando={publicando}>
                ✓ Confirmar y Publicar
              </Boton>
            </>
          }
        >
          <div className={styles.previsualizacion} style={{ backgroundColor: '#fff', color: '#000', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#1a56db', margin: 0, fontSize: '1.5rem' }}>COMUNIDAD {condominio?.nombre.toUpperCase()}</h2>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <strong style={{ fontSize: '1.1rem' }}>1. DETALLE GASTOS COMUNES ({formatearMes(gasto.mes_anio).toUpperCase()})</strong>
            </div>

            <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>CONCEPTO</th>
                  <th style={{ textAlign: 'right', padding: '8px 0' }}>VALOR</th>
                </tr>
              </thead>
              <tbody>
                {(gasto.egresos_operativos || []).length > 0 ? (
                  gasto.egresos_operativos.map(e => (
                    <tr key={e.id}>
                      <td style={{ padding: '6px 0' }}>{e.categoria.toUpperCase()} {e.descripcion ? `- ${e.descripcion}` : ''}</td>
                      <td style={{ textAlign: 'right' }}>{formatoMoneda(e.monto)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ padding: '6px 0' }}>SIN EGRESOS REGISTRADOS</td>
                    <td style={{ textAlign: 'right' }}>{formatoMoneda(0)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px 0' }}>TOTAL GASTOS COMUNIDAD</td>
                  <td style={{ textAlign: 'right' }}>{formatoMoneda(gasto.total_gastos)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0 4px 0' }}>SUB TOTAL (Promedio 1/{gasto.resumen_unidades?.total_unidades || 1} unidades)</td>
                  <td style={{ textAlign: 'right' }}>{formatoMoneda(Math.round(gasto.total_gastos / (gasto.resumen_unidades?.total_unidades || 1)))}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0 8px 0' }}>FONDO DE RESERVA</td>
                  <td style={{ textAlign: 'right' }}>{formatoMoneda(Math.round((gasto.monto_fondo_reserva || 0) / (gasto.resumen_unidades?.total_unidades || 1)))}</td>
                </tr>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', fontWeight: 'bold', color: '#e02424' }}>
                  <td style={{ padding: '10px 0' }}>TOTAL A PAGAR (Promedio)</td>
                  <td style={{ textAlign: 'right' }}>{formatoMoneda(Math.round(gasto.total_gastos / (gasto.resumen_unidades?.total_unidades || 1)) + Math.round((gasto.monto_fondo_reserva || 0) / (gasto.resumen_unidades?.total_unidades || 1)))}</td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#666', marginBottom: '32px' }}>
              (*) El valor real a pagar por su unidad puede variar ligeramente según su porcentaje de alícuota legal estipulado en el reglamento de copropiedad.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.1rem' }}>2. FONDO DE RESERVA DE LA COMUNIDAD ({formatearMes(gasto.mes_anio).toUpperCase()})</strong>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', marginBottom: '16px' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>CONCEPTO</th>
                  <th style={{ textAlign: 'right', padding: '8px 0' }}>VALOR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0' }}>AHORRO ESTE MES</td>
                  <td style={{ textAlign: 'right' }}>{formatoMoneda(gasto.monto_fondo_reserva || 0)}</td>
                </tr>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px 0' }}>TOTAL FONDO RESERVA*</td>
                  <td style={{ textAlign: 'right' }}>{formatoMoneda(parseFloat(condominio?.saldo_fondo_reserva || 0))}</td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
              * El Total Fondo Reserva incluye todos los aportes cobrados y recaudados históricamente hasta la fecha de emisión de este documento.
            </p>
          </div>
        </Modal>
      )}

      {/* Modal Importar Excel */}
      {modalImportar && (
        <Modal
          abierto={modalImportar}
          titulo="Importar Egresos desde Excel"
          onCerrar={() => setModalImportar(false)}
          tamano="lg"
          acciones={
            <></>
          }
        >
          <ImportadorExcel
            condominioId={condominioId}
            gastoId={gastoId}
            gastoMesAnio={gasto?.mes_anio}
            onCerrar={() => setModalImportar(false)}
            onImportado={handleImportado}
          />
        </Modal>
      )}
    </div>
  );
}