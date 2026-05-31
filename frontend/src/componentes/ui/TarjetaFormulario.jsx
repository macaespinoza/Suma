// =============================================================================
// SUMA — Componente TarjetaFormulario
// Wrapper estilizado para formularios dentro de tarjetas.
// =============================================================================

import styles from './TarjetaFormulario.module.css';

/**
 * Componente wrapper para formularios con estilo de tarjeta.
 *
 * @param {object} props
 * @param {string} [props.titulo] - Título del formulario.
 * @param {string} [props.subtitulo] - Subtítulo descriptivo.
 * @param {React.ReactNode} props.children - Contenido del formulario.
 * @param {React.ReactNode} [props.acciones] - Botones de acción (footer).
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export default function TarjetaFormulario({
  titulo,
  subtitulo,
  children,
  acciones,
  className = '',
}) {
  return (
    <div className={`${styles.tarjeta} ${className}`}>
      {(titulo || subtitulo) && (
        <div className={styles.cabecera}>
          {titulo && <h2 className={styles.titulo}>{titulo}</h2>}
          {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
        </div>
      )}
      <div className={styles.contenido}>
        {children}
      </div>
      {acciones && (
        <div className={styles.acciones}>
          {acciones}
        </div>
      )}
    </div>
  );
}
