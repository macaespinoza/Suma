// =============================================================================
// SUMA — Página Principal del Dashboard
// Vista de resumen con tarjetas de métricas y accesos rápidos.
// Open Code implementará los datos reales desde la API.
// =============================================================================

import styles from './page.module.css';

/**
 * Dashboard principal post-login.
 * Muestra un resumen de métricas del condominio y accesos rápidos.
 */
export default function PaginaDashboard() {
  return (
    <div className={styles.dashboard}>
      {/* --- Saludo --- */}
      <div className={styles.saludo}>
        <h1 className={styles.saludoTitulo}>Bienvenido a SUMA 👋</h1>
        <p className={styles.saludoSubtitulo}>
          Aquí tienes un resumen de tu condominio.
        </p>
      </div>

      {/* --- Grid de Métricas --- */}
      <div className={styles.metricasGrid}>
        <div className={`${styles.metricaCard} ${styles.metricaPrimario}`}>
          <div className={styles.metricaIcono}>🏠</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>24</span>
            <span className={styles.metricaEtiqueta}>Unidades</span>
          </div>
        </div>
        <div className={`${styles.metricaCard} ${styles.metricaExito}`}>
          <div className={styles.metricaIcono}>✅</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>18</span>
            <span className={styles.metricaEtiqueta}>Pagos al día</span>
          </div>
        </div>
        <div className={`${styles.metricaCard} ${styles.metricaAdvertencia}`}>
          <div className={styles.metricaIcono}>⚠️</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>4</span>
            <span className={styles.metricaEtiqueta}>Pendientes</span>
          </div>
        </div>
        <div className={`${styles.metricaCard} ${styles.metricaError}`}>
          <div className={styles.metricaIcono}>🔴</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>2</span>
            <span className={styles.metricaEtiqueta}>Morosos</span>
          </div>
        </div>
      </div>

      {/* --- Secciones de contenido --- */}
      <div className={styles.contenidoGrid}>
        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}>📢 Últimas publicaciones</h3>
          <div className={styles.placeholder}>
            <p>Contenido del muro social — pendiente de implementación.</p>
          </div>
        </div>
        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}>📅 Próximos eventos</h3>
          <div className={styles.placeholder}>
            <p>Calendario de eventos comunitarios — pendiente de implementación.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
