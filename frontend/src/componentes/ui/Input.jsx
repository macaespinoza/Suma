// =============================================================================
// SUMA — Componente Input Reutilizable
// Campo de texto con label, mensaje de error e ícono opcional.
// =============================================================================

import styles from './Input.module.css';

/**
 * Componente de campo de entrada con soporte para label, error e ícono.
 *
 * @param {object} props
 * @param {string} props.nombre - Nombre del campo (name attribute).
 * @param {string} [props.etiqueta] - Texto del label.
 * @param {string} [props.tipo='text'] - Tipo de input HTML.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {string} [props.valor] - Valor controlado.
 * @param {function} [props.onChange] - Handler de cambio.
 * @param {string} [props.error] - Mensaje de error a mostrar.
 * @param {boolean} [props.requerido] - Si es obligatorio.
 * @param {boolean} [props.deshabilitado] - Si está deshabilitado.
 * @param {string} [props.ayuda] - Texto de ayuda debajo del input.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export default function Input({
  nombre,
  etiqueta,
  tipo = 'text',
  placeholder,
  valor,
  onChange,
  error,
  requerido = false,
  deshabilitado = false,
  ayuda,
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
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        placeholder={placeholder}
        value={valor}
        onChange={onChange}
        disabled={deshabilitado}
        required={requerido}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...rest}
      />
      {ayuda && !error && <p className={styles.ayuda}>{ayuda}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
