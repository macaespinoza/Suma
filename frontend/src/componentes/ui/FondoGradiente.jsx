// =============================================================================
// SUMA — Fondo con Gradientes Dinámicos
// Renderiza blobs de color animados sobre el fondo Onyx para darle vida a la UI.
// =============================================================================

import styles from './FondoGradiente.module.css';

export default function FondoGradiente() {
  return (
    <div className={styles.fondo} aria-hidden="true">
      <div className={`${styles.blob} ${styles.blobAureo}`} />
      <div className={`${styles.blob} ${styles.blobRosa}`} />
      <div className={`${styles.blob} ${styles.blobVerde}`} />
      <div className={`${styles.blob} ${styles.blobDetalle}`} />
    </div>
  );
}
