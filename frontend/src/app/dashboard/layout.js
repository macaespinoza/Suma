'use client';
// =============================================================================
// SUMA — Layout del Dashboard (con Sidebar)
// Estructura de layout para las páginas internas post-login.
// =============================================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

/**
 * Definición de navegación del sidebar.
 */
const navegacion = [
  { href: '/dashboard', icono: '📊', etiqueta: 'Dashboard' },
  { href: '/dashboard/condominios', icono: '🏘️', etiqueta: 'Condominios' },
  { href: '/dashboard/unidades', icono: '🏠', etiqueta: 'Unidades' },
  { href: '/dashboard/usuarios', icono: '👥', etiqueta: 'Usuarios' },
];

/**
 * Layout del Dashboard.
 * Envuelve las páginas internas con sidebar + header.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido de la página del dashboard.
 */
export default function LayoutDashboard({ children }) {
  const pathname = usePathname();

  return (
    <div className={styles.layoutDashboard}>
      {/* --- Blobs decorativos de fondo --- */}
      <div className={`blob blob--primario ${styles.blobDecorativo1}`} />
      <div className={`blob blob--secundario ${styles.blobDecorativo2}`} />
      <div className={`blob blob--acento ${styles.blobDecorativo3}`} />

      {/* --- Sidebar --- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.sidebarLogoLink}>
            <span className={styles.sidebarLogo}>🏢</span>
            <span className={styles.sidebarTitulo}>SUMA</span>
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <ul className={styles.navLista}>
            {/* Módulo Core */}
            {navegacion.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${pathname === item.href ? styles.navItemActivo : ''}`}
                >
                  <span className={styles.navIcono}>{item.icono}</span>
                  <span>{item.etiqueta}</span>
                </Link>
              </li>
            ))}

            <li className={styles.navSeparador}>Administración</li>
            <li>
              <Link
                href="/dashboard/condominios"
                className={styles.navItem}
              >
                <span className={styles.navIcono}>💰</span>
                <span>Gastos Comunes</span>
              </Link>
            </li>
            <li className={`${styles.navItem} ${styles.navItemDeshabilitado}`}>
              <span className={styles.navIcono}>📄</span>
              <span>Cobros</span>
            </li>
            <li className={`${styles.navItem} ${styles.navItemDeshabilitado}`}>
              <span className={styles.navIcono}>💳</span>
              <span>Pagos</span>
            </li>

            <li className={styles.navSeparador}>Comunidad</li>
            <li className={`${styles.navItem} ${styles.navItemDeshabilitado}`}>
              <span className={styles.navIcono}>📢</span>
              <span>Muro Social</span>
            </li>
            <li className={`${styles.navItem} ${styles.navItemDeshabilitado}`}>
              <span className={styles.navIcono}>🛒</span>
              <span>Mercadito</span>
            </li>
            <li className={`${styles.navItem} ${styles.navItemDeshabilitado}`}>
              <span className={styles.navIcono}>📅</span>
              <span>Eventos</span>
            </li>
            <li className={`${styles.navItem} ${styles.navItemDeshabilitado}`}>
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
