// =============================================================================
// SUMA — Layout del Dashboard (Mobile-First, Material Design 3)
// v3: Panel de notificaciones desplegable + click-outside + AnimatePresence.
// =============================================================================

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from '@phosphor-icons/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './layout.module.css';
import Logo from '../../componentes/ui/Logo.jsx';
import BottomNav from '../../componentes/ui/BottomNav.jsx';
import PanelNotificaciones from '../../componentes/ui/PanelNotificaciones.jsx';

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

/** Número total de notificaciones sin leer (mock) */
const NOTIFS_SIN_LEER = 2;

/**
 * Layout principal del dashboard post-login.
 * Estructura: TopAppBar (fija) + main (scrollable) + BottomNav (fija).
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function LayoutDashboard({ children }) {
  const pathname = usePathname();
  const esHome = pathname === '/dashboard';

  // Estado del panel de notificaciones
  const [panelAbierto, setPanelAbierto] = useState(false);
  const panelRef = useRef(null);
  const btnRef  = useRef(null);

  // Estado para mostrar/ocultar el top bar al hacer scroll
  const [mostrarTopBar, setMostrarTopBar] = useState(true);
  const ultimoScrollY = useRef(0);

  // Buscar el título exacto primero, luego por prefijo para sub-rutas
  let titulo = TITULOS_PAGINA[pathname];
  if (titulo === undefined) {
    const prefijo = Object.keys(TITULOS_PAGINA)
      .filter((k) => k !== '/dashboard')
      .find((k) => pathname.startsWith(k));
    titulo = prefijo ? TITULOS_PAGINA[prefijo] : '';
  }

  /** Cierra el panel al hacer click fuera de él */
  const manejarClickFuera = useCallback((e) => {
    if (
      panelRef.current  && !panelRef.current.contains(e.target) &&
      btnRef.current    && !btnRef.current.contains(e.target)
    ) {
      setPanelAbierto(false);
    }
  }, []);

  /** Cierra el panel al presionar Escape */
  const manejarTeclado = useCallback((e) => {
    if (e.key === 'Escape' && panelAbierto) {
      setPanelAbierto(false);
      btnRef.current?.focus();
    }
  }, [panelAbierto]);

  useEffect(() => {
    if (panelAbierto) {
      document.addEventListener('mousedown', manejarClickFuera);
      document.addEventListener('keydown',   manejarTeclado);
    }
    return () => {
      document.removeEventListener('mousedown', manejarClickFuera);
      document.removeEventListener('keydown',   manejarTeclado);
    };
  }, [panelAbierto, manejarClickFuera, manejarTeclado]);

  /** Cierra el panel al cambiar de ruta */
  useEffect(() => {
    setPanelAbierto(false);
  }, [pathname]);

  /** Lógica para ocultar el TopBar en scroll hacia abajo */
  useEffect(() => {
    const handleScroll = () => {
      const actualScrollY = window.scrollY;

      // Si el panel de notificaciones está abierto, no ocultar la barra
      if (panelAbierto) return;

      if (actualScrollY > ultimoScrollY.current && actualScrollY > 64) {
        // Scroll hacia abajo
        setMostrarTopBar(false);
      } else if (actualScrollY < ultimoScrollY.current) {
        // Scroll hacia arriba
        setMostrarTopBar(true);
      }
      ultimoScrollY.current = Math.max(0, actualScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [panelAbierto]);

  return (
    <div className={styles.shell}>

      {/* ===== Top App Bar ===== */}
      <header className={`${styles.topBar} ${!mostrarTopBar ? styles.topBarOculta : ''}`} role="banner">
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

          {/* Acciones — contenedor de referencia para el panel */}
          <div className={styles.topBarAcciones}>
            <button
              ref={btnRef}
              className={styles.btnIcono}
              aria-label={`Notificaciones — ${NOTIFS_SIN_LEER} sin leer. ${panelAbierto ? 'Cerrar panel' : 'Abrir panel'}`}
              aria-expanded={panelAbierto}
              aria-haspopup="dialog"
              type="button"
              onClick={() => setPanelAbierto((prev) => !prev)}
            >
              <Bell size={22} weight={panelAbierto ? 'fill' : 'bold'} aria-hidden="true" />
              {NOTIFS_SIN_LEER > 0 && (
                <span className={styles.badgeNotif} aria-hidden="true">
                  {NOTIFS_SIN_LEER}
                </span>
              )}
            </button>

            {/* Panel desplegable con AnimatePresence para entrada/salida suave */}
            <AnimatePresence>
              {panelAbierto && (
                <div ref={panelRef}>
                  <PanelNotificaciones onCerrar={() => setPanelAbierto(false)} />
                </div>
              )}
            </AnimatePresence>
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
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
