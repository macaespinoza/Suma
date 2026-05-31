// =============================================================================
// SUMA — Página de Lista de Condominios
// Muestra tabla de condominios activos con acciones CRUD.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCondominios } from '../../../lib/hooks/useCondominios.js';
import Tabla from '../../../componentes/ui/Tabla.jsx';
import Boton from '../../../componentes/ui/Boton.jsx';
import Modal from '../../../componentes/ui/Modal.jsx';
import styles from './page.module.css';

/**
 * Columnas de la tabla de condominios.
 */
const columnas = [
  { clave: 'nombre', etiqueta: 'Nombre' },
  { clave: 'direccion', etiqueta: 'Dirección' },
  { clave: 'rut_comunidad', etiqueta: 'RUT Comunidad' },
  {
    clave: 'cantidad_unidades',
    etiqueta: 'Unidades',
    render: (valor) => `${valor} unidades`,
  },
];

/**
 * Página de listado de condominios.
 */
export default function PaginaCondominios() {
  const { condominios, cargando, error, listar, desactivar } = useCondominios();
  const [modalEliminar, setModalEliminar] = useState(null);

  useEffect(() => {
    listar();
  }, [listar]);

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await desactivar(modalEliminar.id);
      setModalEliminar(null);
    } catch {
      // El error ya se maneja en el hook.
    }
  };

  return (
    <div className={styles.pagina}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Condominios</h1>
          <p className={styles.subtitulo}>
            Gestiona los condominios registrados en el sistema.
          </p>
        </div>
        <Link href="/dashboard/condominios/nuevo">
          <Boton variante="primario">+ Nuevo Condominio</Boton>
        </Link>
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
        datos={condominios}
        cargando={cargando}
        vacioTexto="No hay condominios registrados. Crea uno nuevo para comenzar."
        onFilaClick={(fila) => window.location.href = `/dashboard/condominios/${fila.id}`}
        acciones={[
          {
            etiqueta: 'Editar',
            variante: 'fantasma',
            onClick: (fila) => window.location.href = `/dashboard/condominios/${fila.id}`,
          },
          {
            etiqueta: 'Eliminar',
            variante: 'peligro',
            onClick: (fila) => setModalEliminar(fila),
          },
        ]}
      />

      {/* Modal de confirmación de eliminación */}
      <Modal
        abierto={!!modalEliminar}
        onCerrar={() => setModalEliminar(null)}
        titulo="Desactivar Condominio"
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
          ¿Estás seguro de que deseas desactivar el condominio{' '}
          <strong>{modalEliminar?.nombre}</strong>? Esta acción es reversible
          desde la base de datos.
        </p>
      </Modal>
    </div>
  );
}
