// =============================================================================
// SUMA — Componente Tabla Reutilizable
// Tabla genérica con encabezados, filas y acciones.
// =============================================================================

import styles from './Tabla.module.css';

/**
 * Componente de tabla genérica.
 *
 * @param {object} props
 * @param {Array<{clave: string, etiqueta: string, render?: function}>} props.columnas - Definición de columnas.
 * @param {Array<object>} props.datos - Filas de datos.
 * @param {function} [props.onFilaClick] - Handler al hacer clic en una fila.
 * @param {Array<{etiqueta: string, onClick: function, variante?: string}>} [props.acciones] - Acciones por fila.
 * @param {string} [props.vacioTexto] - Texto cuando no hay datos.
 * @param {boolean} [props.cargando] - Estado de carga.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export default function Tabla({
  columnas = [],
  datos = [],
  onFilaClick,
  acciones,
  vacioTexto = 'No hay registros para mostrar.',
  cargando = false,
  className = '',
}) {
  if (cargando) {
    return (
      <div className={styles.contenedor}>
        <div className={styles.cargando}>
          <span className={styles.spinner} />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className={styles.contenedor}>
        <div className={styles.vacio}>{vacioTexto}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.contenedor} ${className}`}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col.clave} className={styles.th}>
                {col.etiqueta}
              </th>
            ))}
            {acciones && <th className={styles.th}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, indice) => (
            <tr
              key={fila.id || indice}
              className={`${styles.tr} ${onFilaClick ? styles.trClickable : ''}`}
              onClick={() => onFilaClick?.(fila)}
            >
              {columnas.map((col) => (
                <td key={col.clave} className={styles.td}>
                  {col.render ? col.render(fila[col.clave], fila) : fila[col.clave]}
                </td>
              ))}
              {acciones && (
                <td className={`${styles.td} ${styles.acciones}`}>
                  {acciones.map((accion, i) => (
                    <button
                      key={i}
                      className={`${styles.accionBtn} ${styles[`accion--${accion.variante || 'fantasma'}`]}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        accion.onClick(fila);
                      }}
                    >
                      {accion.etiqueta}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
