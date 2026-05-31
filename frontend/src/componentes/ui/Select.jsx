// =============================================================================
// SUMA — Componente Select Reutilizable
// Dropdown select con label y mensaje de error.
// =============================================================================

import styles from './Select.module.css';

/**
 * Componente de select con soporte para label, error y opciones.
 *
 * @param {object} props
 * @param {string} props.nombre - Nombre del campo (name attribute).
 * @param {string} [props.etiqueta] - Texto del label.
 * @param {string} [props.valor] - Valor controlado.
 * @param {function} [props.onChange] - Handler de cambio.
 * @param {Array<{valor: string, etiqueta: string}>} props.opciones - Opciones del select.
 * @param {string} [props.placeholder] - Texto de la opción por defecto.
 * @param {string} [props.error] - Mensaje de error.
 * @param {boolean} [props.requerido] - Si es obligatorio.
 * @param {boolean} [props.deshabilitado] - Si está deshabilitado.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export default function Select({
  nombre,
  etiqueta,
  valor,
  onChange,
  opciones = [],
  placeholder = 'Seleccionar...',
  error,
  requerido = false,
  deshabilitado = false,
  className = '',
  ...rest
}) {
  return (
    <div className={`${styles.campo} ${className}`}>
      {etiqueta && (
        <label htmlFor={nombre} className={styles.etiqueta}>
          {etiqueta}
          {requerido && <span className={styles.requerido}>*</span>}
        </label>
      )}
      <select
        id={nombre}
        name={nombre}
        value={valor}
        onChange={onChange}
        disabled={deshabilitado}
        required={requerido}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        {...rest}
      >
        <option value="" disabled>{placeholder}</option>
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
