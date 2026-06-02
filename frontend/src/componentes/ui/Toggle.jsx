// =============================================================================
// SUMA — Componente Toggle Reutilizable
// Interruptor switch con animación suave al estilo SUMA.
// =============================================================================

import styles from './Toggle.module.css';

/**
 * Componente Toggle (switch) con etiqueta y color primario.
 *
 * @param {object} props
 * @param {string} props.nombre - Nombre del campo (name attribute).
 * @param {string} [props.etiqueta] - Texto descriptivo al lado del toggle.
 * @param {boolean} [props.activado=false] - Estado del toggle.
 * @param {function} [props.onChange] - Handler de cambio (recibe evento).
 * @param {boolean} [props.deshabilitado=false] - Si está deshabilitado.
 * @param {string} [props.variante='primario'] - 'primario' | 'exito' | 'peligro'.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export default function Toggle({
  nombre,
  etiqueta,
  activado = false,
  onChange,
  deshabilitado = false,
  variante = 'primario',
  className = '',
}) {
  const varianteClase = styles[`toggle--${variante}`] || '';

  return (
    <label className={`${styles.contenedor} ${className} ${deshabilitado ? styles['contenedor--deshabilitado'] : ''}`}>
      <div className={styles.toggleWrapper}>
        <input
          type="checkbox"
          name={nombre}
          id={nombre}
          checked={activado}
          onChange={onChange}
          disabled={deshabilitado}
          className={styles.input}
        />
        <span className={`${styles.pista} ${activado ? styles['pista--activa'] : ''} ${varianteClase}`}>
          <span className={`${styles.thumb} ${activado ? styles['thumb--activo'] : ''}`} />
        </span>
      </div>
      {etiqueta && <span className={styles.etiqueta}>{etiqueta}</span>}
    </label>
  );
}
