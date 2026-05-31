// =============================================================================
// SUMA — Componente Modal Reutilizable
// Diálogo modal con overlay, cabecera y acciones.
// =============================================================================

import { useEffect } from 'react';
import styles from './Modal.module.css';

/**
 * Componente de modal con overlay.
 *
 * @param {object} props
 * @param {boolean} props.abierto - Si el modal está visible.
 * @param {function} props.onCerrar - Handler para cerrar el modal.
 * @param {string} props.titulo - Título del modal.
 * @param {React.ReactNode} props.children - Contenido del modal.
 * @param {React.ReactNode} [props.acciones] - Botones de acción (footer).
 * @param {string} [props.tamano='md'] - Tamaño del modal: 'sm', 'md', 'lg'.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export default function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
  acciones,
  tamano = 'md',
  className = '',
}) {
  // Cerrar con tecla Escape.
  useEffect(() => {
    if (!abierto) return;
    const manejarEscape = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', manejarEscape);
    return () => document.removeEventListener('keydown', manejarEscape);
  }, [abierto, onCerrar]);

  // Prevenir scroll del body cuando el modal está abierto.
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div
        className={`${styles.modal} ${styles[`modal--${tamano}`]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className={styles.cabecera}>
          <h3 className={styles.titulo}>{titulo}</h3>
          <button className={styles.cerrarBtn} onClick={onCerrar} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {/* Contenido */}
        <div className={styles.contenido}>
          {children}
        </div>

        {/* Acciones */}
        {acciones && (
          <div className={styles.acciones}>
            {acciones}
          </div>
        )}
      </div>
    </div>
  );
}
