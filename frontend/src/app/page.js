// =============================================================================
// SUMA — Página Principal (Landing / Login)
// Placeholder para que Open Code implemente la pantalla de login completa.
// =============================================================================

import styles from './page.module.css';

/**
 * Página de inicio / Landing.
 * Open Code implementará aquí:
 * - Formulario de login con Firebase Auth.
 * - Validación de RUT en el registro.
 * - Redirección al dashboard post-login.
 */
export default function PaginaInicio() {
  return (
    <main className={styles.principal}>
      <div className={styles.contenedor}>
        {/* --- Hero / Branding --- */}
        <div className={styles.hero}>
          <div className={styles.logoContenedor}>
            <span className={styles.logoIcono}>🏢</span>
            <h1 className={styles.logoTexto}>SUMA</h1>
          </div>
          <p className={styles.subtitulo}>
            Gestión y Cohesión Comunitaria
          </p>
          <p className={styles.descripcion}>
            Plataforma PropTech para condominios en Arica, Chile.
            Administra gastos comunes, conecta con tus vecinos y fortalece tu comunidad.
          </p>
        </div>

        {/* --- Card de Login (Placeholder) --- */}
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitulo}>Iniciar Sesión</h2>
          <p className={styles.loginSubtitulo}>
            Ingresa con tu cuenta para acceder al panel de tu condominio.
          </p>

          {/* TODO (Open Code): Implementar formulario de login con Firebase Auth. */}
          <div className={styles.loginPlaceholder}>
            <p>🔧 Formulario de login — pendiente de implementación por Open Code.</p>
          </div>

          <div className={styles.separador}>
            <span>Módulos del sistema</span>
          </div>

          <div className={styles.modulosGrid}>
            <div className={styles.moduloItem}>
              <span className={styles.moduloIcono}>📊</span>
              <span className={styles.moduloNombre}>Administración</span>
              <span className={styles.moduloDesc}>Gastos comunes y cobranza</span>
            </div>
            <div className={styles.moduloItem}>
              <span className={styles.moduloIcono}>🏘️</span>
              <span className={styles.moduloNombre}>Comunidad</span>
              <span className={styles.moduloDesc}>Red social vecinal</span>
            </div>
            <div className={styles.moduloItem}>
              <span className={styles.moduloIcono}>🛒</span>
              <span className={styles.moduloNombre}>Mercadito</span>
              <span className={styles.moduloDesc}>Economía circular local</span>
            </div>
            <div className={styles.moduloItem}>
              <span className={styles.moduloIcono}>🐾</span>
              <span className={styles.moduloNombre}>Mascotas</span>
              <span className={styles.moduloDesc}>Registro pet-friendly</span>
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <footer className={styles.footer}>
          <p>SUMA © 2026 — ComunidApp · Arica, Chile 🇨🇱</p>
        </footer>
      </div>
    </main>
  );
}
