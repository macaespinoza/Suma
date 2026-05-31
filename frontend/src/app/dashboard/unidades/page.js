// =============================================================================
// SUMA — Página de Lista de Unidades Vecinales
// Muestra tabla de unidades con filtro por condominio.
// =============================================================================

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '../../../lib/api.js';
import { useUnidades } from '../../../lib/hooks/useUnidades.js';
import Tabla from '../../../componentes/ui/Tabla.jsx';
import Boton from '../../../componentes/ui/Boton.jsx';
import Modal from '../../../componentes/ui/Modal.jsx';
import Select from '../../../componentes/ui/Select.jsx';
import styles from './page.module.css';

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
  { clave: 'numero', etiqueta: 'Número' },
  {
    clave: 'alicuota',
    etiqueta: 'Alícuota',
    render: (valor) => `${(parseFloat(valor) * 100).toFixed(2)}%`,
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
        // Cargar unidades de todos los condominios.
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
            Gestiona las departamentos, casas y unidades de cada condominio.
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
