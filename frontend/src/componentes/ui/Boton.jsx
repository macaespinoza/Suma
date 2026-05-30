// =============================================================================
// SUMA — Componente Botón Reutilizable
// Botón con variantes de estilo, tamaños y estados.
// =============================================================================

import styles from './Boton.module.css';

/**
 * Componente de botón con soporte para variantes y tamaños.
 *
 * @param {object} props
 * @param {'primario'|'secundario'|'outline'|'fantasma'|'peligro'} [props.variante='primario']
 * @param {'sm'|'md'|'lg'} [props.tamano='md']
 * @param {boolean} [props.ancho] - Si true, ocupa todo el ancho disponible.
 * @param {boolean} [props.cargando] - Si true, muestra indicador de carga.
 * @param {boolean} [props.deshabilitado]
 * @param {string} [props.tipo='button']
 * @param {React.ReactNode} props.children
 * @param {function} [props.onClick]
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export default function Boton({
  variante = 'primario',
  tamano = 'md',
  ancho = false,
  cargando = false,
  deshabilitado = false,
  tipo = 'button',
  children,
  onClick,
  className = '',
  ...rest
}) {
  const clases = [
    styles.boton,
    styles[`boton--${variante}`],
    styles[`boton--${tamano}`],
    ancho ? styles['boton--ancho'] : '',
    cargando ? styles['boton--cargando'] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={tipo}
      className={clases}
      disabled={deshabilitado || cargando}
      onClick={onClick}
      {...rest}
    >
      {cargando && <span className={styles.spinner} aria-hidden="true" />}
      <span className={cargando ? styles.textoOculto : ''}>
        {children}
      </span>
    </button>
  );
}
