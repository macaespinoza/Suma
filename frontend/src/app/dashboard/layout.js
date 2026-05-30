// =============================================================================
// SUMA — Layout del Dashboard (con Sidebar)
// Estructura de layout para las páginas internas post-login.
// Open Code implementará el sidebar completo y la navegación.
// =============================================================================

import styles from './layout.module.css';

export const metadata = {
  title: 'Dashboard',
};

/**
 * Layout del Dashboard.
 * Envuelve las páginas internas con sidebar + header.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido de la página del dashboard.
 */
export default function LayoutDashboard({ children }) {
  return (
    <div className={styles.layoutDashboard}>
      {/* --- Sidebar --- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🏢</span>
          <span className={styles.sidebarTitulo}>SUMA</span>
        </div>

        <nav className={styles.sidebarNav}>
          {/* TODO (Open Code): Implementar navegación dinámica con Link de Next.js */}
          <ul className={styles.navLista}>
            <li className={`${styles.navItem} ${styles.navItemActivo}`}>
              <span className={styles.navIcono}>📊</span>
              <span>Dashboard</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>🏘️</span>
              <span>Condominios</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>🏠</span>
              <span>Unidades</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>👥</span>
              <span>Usuarios</span>
            </li>

            <li className={styles.navSeparador}>Administración</li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>💰</span>
              <span>Gastos Comunes</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>📄</span>
              <span>Cobros</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>💳</span>
              <span>Pagos</span>
            </li>

            <li className={styles.navSeparador}>Comunidad</li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>📢</span>
              <span>Muro Social</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>🛒</span>
              <span>Mercadito</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>📅</span>
              <span>Eventos</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navIcono}>🐾</span>
              <span>Mascotas</span>
            </li>
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.usuarioInfo}>
            <div className={styles.usuarioAvatar}>👤</div>
            <div>
              <p className={styles.usuarioNombre}>Admin</p>
              <p className={styles.usuarioRol}>Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Contenido Principal --- */}
      <div className={styles.contenidoPrincipal}>
        {/* --- Header --- */}
        <header className={styles.header}>
          <div className={styles.headerIzquierda}>
            <h2 className={styles.headerTitulo}>Dashboard</h2>
          </div>
          <div className={styles.headerDerecha}>
            {/* TODO (Open Code): Notificaciones, búsqueda, perfil */}
            <span className={styles.headerIcono}>🔔</span>
          </div>
        </header>

        {/* --- Área de Contenido --- */}
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
