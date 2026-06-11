// =============================================================================
// SUMA — Layout del Dashboard (Mobile-First, Material Design 3)
// Reemplaza el sidebar lateral por TopAppBar + BottomNav de Android.
// =============================================================================

'use client';

import { usePathname } from 'next/navigation';
import { Bell } from '@phosphor-icons/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './layout.module.css';
import Logo from '../../componentes/ui/Logo.jsx';
import BottomNav from '../../componentes/ui/BottomNav.jsx';

/**
 * Títulos de página para el TopAppBar.
 * Si no hay título, se muestra el logo (en el Home).
 */
const TITULOS_PAGINA = {
  '/dashboard':              null,              // Muestra logo en home
  '/dashboard/finanzas':     'Finanzas',
  '/dashboard/comunidad':    'Comunidad',
  '/dashboard/condominios':  'Condominios',
  '/dashboard/perfil':       'Mi Perfil',
};

/**
 * Layout principal del dashboard post-login.
 * Estructura: TopAppBar (fija) + main (scrollable) + BottomNav (fija).
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function LayoutDashboard({ children }) {
  const pathname = usePathname();
  const esHome = pathname === '/dashboard';

  // Buscar el título exacto primero, luego por prefijo para sub-rutas
  let titulo = TITULOS_PAGINA[pathname];
  if (titulo === undefined) {
    const prefijo = Object.keys(TITULOS_PAGINA)
      .filter((k) => k !== '/dashboard')
      .find((k) => pathname.startsWith(k));
    titulo = prefijo ? TITULOS_PAGINA[prefijo] : '';
  }

  return (
    <div className={styles.shell}>

      {/* ===== Top App Bar ===== */}
      <header className={styles.topBar} role="banner">
        <div className={styles.topBarContenido}>
          <div className={styles.topBarIzquierda}>
            {esHome ? (
              <Link
                href="/dashboard"
                className={styles.logoLink}
                aria-label="SUMA — Ir al inicio"
              >
                <Logo className={styles.logoTop} />
              </Link>
            ) : (
              <h1 className={styles.topBarTitulo}>{titulo}</h1>
            )}
          </div>

          <div className={styles.topBarAcciones}>
            <button
              className={styles.btnIcono}
              aria-label="Notificaciones — 2 sin leer"
              type="button"
            >
              <Bell size={22} weight="fill" aria-hidden="true" />
              <span className={styles.badgeNotif} aria-hidden="true">2</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Contenido principal scrollable ===== */}
      <main
        className={styles.main}
        role="main"
        id="contenido-principal"
        tabIndex={-1}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ===== Bottom Navigation Bar ===== */}
      <BottomNav />

    </div>
  );
}
