// =============================================================================
// SUMA — Detalle de Gasto Común
// Vista completa: egresos por categoría, cobros por unidad y acciones.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../../lib/api.js';
import TarjetaFormulario from '../../../../../../componentes/ui/TarjetaFormulario.jsx';
import Boton from '../../../../../../componentes/ui/Boton.jsx';
import Input from '../../../../../../componentes/ui/Input.jsx';
import Select from '../../../../../../componentes/ui/Select.jsx';
import Modal from '../../../../../../componentes/ui/Modal.jsx';
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

const CATEGORIAS_EGRESO = [
  'Agua', 'Electricidad', 'Gas', 'Portería', 'Mantención',
  'Aseo', 'Seguridad', 'Administración', 'Seguros', 'Otro'
];

const AGRUPACIONES = {
  'Agua': 'Servicios Básicos',
  'Electricidad': 'Servicios Básicos',
  'Gas': 'Servicios Básicos',
  'Portería': 'Personal',
  'Seguridad': 'Personal',
  'Administración': 'Personal',
  'Mantención': 'Operación',
  'Aseo': 'Operación',
  'Seguros': 'Administración',
  'Otro': 'Varios',
};

const ICONOS_CATEGORIA = {
  'Agua': '💧',
  'Electricidad': '⚡',
  'Gas': '🔥',
  'Portería': '🛡️',
  'Seguridad': '🔒',
  'Administración': '📋',
  'Mantención': '🔧',
  'Aseo': '🧹',
  'Seguros': '🛡️',
  'Otro': '📦',
};

const ESTADO_COLORES = {
  pendiente: styles.estadoPendiente,
  pagado: styles.estadoPagado,
  moroso: styles.estadoMoroso,
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
  const [egresoForm, setEgresoForm] = useState({ categoria: '', descripcion: '', monto: '' });
  const [guardandoEgreso, setGuardandoEgreso] = useState(false);

  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resGasto, resCondominio] = await Promise.all([
          api.get(`/condominios/${condominioId}/gastos/${gastoId}`),
          api.get(`/condominios/${condominioId}`),
        ]);
        setGasto(resGasto.datos);
        setCondominio(resCondominio.datos);
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

  const handleAgregarEgreso = async (e) => {
    e.preventDefault();
    if (!egresoForm.categoria || !egresoForm.monto) return;

    setGuardandoEgreso(true);
    try {
      await api.post(`/condominios/${condominioId}/gastos/${gastoId}/egresos`, {
        categoria: egresoForm.categoria,
        descripcion: egresoForm.descripcion || null,
        monto: parseFloat(egresoForm.monto),
      });
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
      setModalEgreso(false);
      setEgresoForm({ categoria: '', descripcion: '', monto: '' });
    } catch (err) {
      setError(err.message || 'No se pudo agregar el egreso.');
    } finally {
      setGuardandoEgreso(false);
    }
  };

  const handlePublicar = async () => {
    if (!confirm('¿Publicar este gasto? Se generarán los cobros para todas las unidades.')) return;

    setPublicando(true);
    try {
      await api.post(`/condominios/${condominioId}/gastos/${gastoId}/publicar`);
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setGasto(res.datos);
    } catch (err) {
      setError(err.message || 'No se pudo publicar el gasto.');
    } finally {
      setPublicando(false);
    }
  };

  const totalEgresos = gasto?.egresos_operativos?.reduce((sum, e) => sum + parseFloat(e.monto), 0) || 0;
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
            <Boton variante="primario" onClick={handlePublicar} cargando={publicando}>
              ✓ Publicar Gasto
            </Boton>
          )}
          {gasto.estado === 'publicado' && (
            <Boton
              variante="primario"
              onClick={() => window.open(`/api/v1/condominios/${condominioId}/gastos/${gastoId}/liquidacion`, '_blank')}
            >
              📄 Descargar Liquidación PDF
            </Boton>
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

      {/* Egresos */}
      <div className={styles.seccion}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>📑 Egresos por Categoría</h2>
          {gasto.estado === 'borrador' && (
            <Boton variante="outline" tamano="sm" onClick={() => setModalEgreso(true)}>
              + Agregar Egreso
            </Boton>
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
                      <span className={styles.egresoIcono}>{ICONOS_CATEGORIA[egreso.categoria]}</span>
                      <div>
                        <span className={styles.egresoNombre}>{egreso.categoria}</span>
                        {egreso.descripcion && (
                          <span className={styles.egresoDescripcion}>{egreso.descripcion}</span>
                        )}
                      </div>
                    </div>
                    <span className={styles.egresoMonto}>{formatoMoneda(parseFloat(egreso.monto))}</span>
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

      {/* Modal Agregar Egreso */}
      {modalEgreso && (
        <Modal
          titulo="Agregar Egreso"
          onCerrar={() => setModalEgreso(false)}
          acciones={
            <>
              <Boton variante="fantasma" onClick={() => setModalEgreso(false)}>Cancelar</Boton>
              <Boton variante="primario" onClick={handleAgregarEgreso} cargando={guardandoEgreso}>
                Agregar
              </Boton>
            </>
          }
        >
          <form onSubmit={handleAgregarEgreso} className={styles.formEgreso}>
            <Select
              nombre="categoria"
              etiqueta="Categoría"
              valor={egresoForm.categoria}
              onChange={(e) => setEgresoForm((prev) => ({ ...prev, categoria: e.target.value }))}
              requerido
            >
              <option value="">Seleccionar categoría...</option>
              {CATEGORIAS_EGRESO.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>

            <Input
              nombre="descripcion"
              etiqueta="Descripción (opcional)"
              valor={egresoForm.descripcion}
              onChange={(e) => setEgresoForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Ej: Factura ABC-123"
            />

            <Input
              nombre="monto"
              etiqueta="Monto (CLP)"
              tipo="number"
              valor={egresoForm.monto}
              onChange={(e) => setEgresoForm((prev) => ({ ...prev, monto: e.target.value }))}
              requerido
              placeholder="0"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}