// =============================================================================
// SUMA — Página de Lista de Unidades Vecinales
// Muestra tabla de unidades con responsable de pago y estado financiero.
// =============================================================================

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api.js';
import { useUnidades } from '../../../lib/hooks/useUnidades.js';
import Tabla from '../../../componentes/ui/Tabla.jsx';
import Boton from '../../../componentes/ui/Boton.jsx';
import Modal from '../../../componentes/ui/Modal.jsx';
import Select from '../../../componentes/ui/Select.jsx';
import styles from './page.module.css';

/**
 * Mapea el estado_pago a configuración visual (color, etiqueta).
 */
const CONFIG_ESTADO = {
  pagado:    { color: 'var(--color-exito)', fondo: 'hsla(142, 71%, 35%, 0.1)', etiqueta: 'Al día' },
  pendiente: { color: 'var(--color-advertencia)', fondo: 'hsla(33, 95%, 54%, 0.1)', etiqueta: 'Pendiente' },
  moroso:    { color: 'var(--color-error)', fondo: 'hsla(17, 92%, 50%, 0.1)', etiqueta: 'Moroso' },
};

const obtenerConfigEstado = (estadoPago) => {
  return CONFIG_ESTADO[estadoPago] || { color: 'var(--color-texto-terciario)', fondo: 'rgba(0,0,0,0.04)', etiqueta: 'Sin registro' };
};

/**
 * Columnas de la tabla de unidades.
 */
const columnas = [
  {
    clave: 'condominio_nombre',
    etiqueta: 'Condominio',
    render: (valor) => valor || '—',
  },
  {
    clave: 'bloque_edificio',
    etiqueta: 'Bloque/Torre',
    render: (valor) => valor || '—',
  },
  { clave: 'numero', etiqueta: 'N°' },
  {
    clave: 'responsable_nombre',
    etiqueta: 'Responsable del Pago',
    render: (_valor, fila) => {
      const nombre = fila.responsable_nombre;
      const tipo = fila.responsable_tipo;
      const rut = fila.responsable_rut;
      const telefono = fila.responsable_telefono;
      const email = fila.responsable_email;

      if (!nombre) return <span style={{ color: 'var(--color-texto-terciario)', fontStyle: 'italic', fontSize: '0.8rem' }}>Sin responsable</span>;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-texto)' }}>{nombre}</span>
            {tipo && (
              <span style={{
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                background: tipo === 'propietario' ? 'hsla(279, 38%, 50%, 0.12)' : 'hsla(33, 95%, 54%, 0.12)',
                color: tipo === 'propietario' ? 'var(--color-info)' : 'var(--color-advertencia)',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}>
                {tipo}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--color-texto-terciario)' }}>
            {rut && <span>{rut}</span>}
            {telefono && <span>{telefono}</span>}
            {email && <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</span>}
          </div>
        </div>
      );
    },
  },
  {
    clave: 'estado_pago',
    etiqueta: 'Estado',
    render: (valor) => {
      const cfg = obtenerConfigEstado(valor);
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: cfg.fondo,
          fontWeight: 600,
          fontSize: '0.78rem',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: cfg.color,
            flexShrink: 0,
          }} />
          <span style={{ color: cfg.color }}>{cfg.etiqueta}</span>
        </span>
      );
    },
  },
];

/**
 * Página de listado de unidades vecinales.
 */
export default function PaginaUnidades() {
  return (
    <Suspense fallback={<div className={styles.pagina}><p>Cargando...</p></div>}>
      <ContenidoUnidades />
    </Suspense>
  );
}

function ContenidoUnidades() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const condominioIdParam = searchParams.get('condominio_id');

  const { cargando, error, desactivar } = useUnidades();
  const [unidades, setUnidades] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [condominioFiltro, setCondominioFiltro] = useState(condominioIdParam || '');
  const [modalEliminar, setModalEliminar] = useState(null);
  const [cargandoLista, setCargandoLista] = useState(false);

  const cargarCondominios = useCallback(async () => {
    try {
      const respuesta = await api.get('/condominios');
      setCondominios(respuesta.datos);
    } catch {
      // Silenciar error.
    }
  }, []);

  const cargarUnidades = useCallback(async (condominioId) => {
    setCargandoLista(true);
    try {
      if (condominioId) {
        const respuesta = await api.get(`/condominios/${condominioId}/unidades`);
        setUnidades(respuesta.datos);
      } else {
        const respCondominios = await api.get('/condominios');
        const todas = [];
        for (const cond of respCondominios.datos) {
          try {
            const resp = await api.get(`/condominios/${cond.id}/unidades`);
            todas.push(...resp.datos.map((u) => ({ ...u, condominio_nombre: cond.nombre })));
          } catch {
            // Silenciar error individual.
          }
        }
        setUnidades(todas);
      }
    } catch {
      // Silenciar error.
    } finally {
      setCargandoLista(false);
    }
  }, []);

  useEffect(() => {
    cargarCondominios();
  }, [cargarCondominios]);

  useEffect(() => {
    cargarUnidades(condominioFiltro);
  }, [condominioFiltro, cargarUnidades]);

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await desactivar(modalEliminar.id);
      setModalEliminar(null);
      cargarUnidades(condominioFiltro);
    } catch {
      // El error ya se maneja en el hook.
    }
  };

  const opcionesCondominio = [
    { valor: '', etiqueta: 'Todos los condominios' },
    ...condominios.map((c) => ({ valor: c.id, etiqueta: c.nombre })),
  ];

  return (
    <div className={styles.pagina}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Unidades Vecinales</h1>
          <p className={styles.subtitulo}>
            Panorama general de salud financiera por unidad.
          </p>
        </div>
        <Link href="/dashboard/unidades/nueva">
          <Boton variante="primario">+ Nueva Unidad</Boton>
        </Link>
      </div>

      {/* Filtro por condominio */}
      <div className={styles.filtros}>
        <Select
          nombre="condominio_filtro"
          etiqueta="Filtrar por Condominio"
          valor={condominioFiltro}
          onChange={(e) => setCondominioFiltro(e.target.value)}
          opciones={opcionesCondominio}
        />
      </div>

      {/* Resumen de estados */}
      <div className={styles.resumenBarra}>
        {['pagado', 'pendiente', 'moroso'].map((estado) => {
          const cfg = CONFIG_ESTADO[estado];
          const count = unidades.filter((u) => u.estado_pago === estado).length;
          return (
            <div key={estado} className={styles.resumenItem}>
              <span className={styles.resumenPunto} style={{ background: cfg.color }} />
              <span className={styles.resumenEtiqueta}>{cfg.etiqueta}</span>
              <span className={styles.resumenNumero}>{count}</span>
            </div>
          );
        })}
        <div className={styles.resumenItem}>
          <span className={styles.resumenPunto} style={{ background: 'var(--color-texto-terciario)' }} />
          <span className={styles.resumenEtiqueta}>Sin registro</span>
          <span className={styles.resumenNumero}>{unidades.filter((u) => !u.estado_pago).length}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error}>
          <span>Error al cargar: {error}</span>
        </div>
      )}

      {/* Tabla */}
      <Tabla
        columnas={columnas}
        datos={unidades}
        cargando={cargando || cargandoLista}
        vacioTexto="No hay unidades registradas para este condominio."
        acciones={[
          {
            etiqueta: 'Ver Ficha',
            variante: 'primario',
            onClick: (fila) => router.push(`/dashboard/unidades/${fila.id}`),
          },
          {
            etiqueta: 'Editar',
            variante: 'secundario',
            onClick: (fila) => router.push(`/dashboard/condominios/${fila.condominio_id}/unidades/${fila.id}`),
          },
          {
            etiqueta: 'Eliminar',
            variante: 'peligro',
            onClick: (fila) => setModalEliminar(fila),
          },
        ]}
      />

      {/* Modal de confirmación */}
      <Modal
        abierto={!!modalEliminar}
        onCerrar={() => setModalEliminar(null)}
        titulo="Desactivar Unidad"
        tamano="sm"
        acciones={
          <>
            <Boton variante="fantasma" onClick={() => setModalEliminar(null)}>
              Cancelar
            </Boton>
            <Boton variante="peligro" onClick={handleEliminar}>
              Desactivar
            </Boton>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas desactivar la unidad{' '}
          <strong>{modalEliminar?.numero}</strong>?
        </p>
      </Modal>
    </div>
  );
}
