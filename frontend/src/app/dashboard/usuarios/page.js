// =============================================================================
// SUMA — Página de Lista de Usuarios
// Muestra tabla de usuarios activos con acciones CRUD.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUsuarios } from '../../../lib/hooks/useUsuarios.js';
import Tabla from '../../../componentes/ui/Tabla.jsx';
import Boton from '../../../componentes/ui/Boton.jsx';
import Modal from '../../../componentes/ui/Modal.jsx';
import styles from './page.module.css';

/**
 * Columnas de la tabla de usuarios.
 */
const columnas = [
  { clave: 'nombre_completo', etiqueta: 'Nombre' },
  { clave: 'email', etiqueta: 'Email' },
  { clave: 'rut', etiqueta: 'RUT' },
  {
    clave: 'telefono',
    etiqueta: 'Teléfono',
    render: (valor) => valor || '—',
  },
  {
    clave: 'rol',
    etiqueta: 'Rol',
    render: (valor) => {
      const colores = {
        admin: 'var(--color-error)',
        propietario: 'var(--color-primario)',
        arrendatario: 'var(--color-acento)',
        conserje: 'var(--color-advertencia)',
      };
      return (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: `${colores[valor]}15`,
            color: colores[valor],
          }}
        >
          {valor}
        </span>
      );
    },
  },
];

/**
 * Página de listado de usuarios.
 */
export default function PaginaUsuarios() {
  const { usuarios, cargando, error, listar, eliminar } = useUsuarios();
  const [modalEliminar, setModalEliminar] = useState(null);

  useEffect(() => {
    listar();
  }, [listar]);

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await eliminar(modalEliminar.id);
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
          <h1 className={styles.titulo}>Usuarios</h1>
          <p className={styles.subtitulo}>
            Gestiona los usuarios registrados en la plataforma.
          </p>
        </div>
        <Link href="/dashboard/usuarios/nuevo">
          <Boton variante="primario">+ Nuevo Usuario</Boton>
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
        datos={usuarios}
        cargando={cargando}
        vacioTexto="No hay usuarios registrados."
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
        titulo="Eliminar Usuario"
        tamano="sm"
        acciones={
          <>
            <Boton variante="fantasma" onClick={() => setModalEliminar(null)}>
              Cancelar
            </Boton>
            <Boton variante="peligro" onClick={handleEliminar}>
              Eliminar
            </Boton>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar al usuario{' '}
          <strong>{modalEliminar?.nombre_completo}</strong>? Esta es una
          eliminación lógica (soft delete).
        </p>
      </Modal>
    </div>
  );
}
