// =============================================================================
// SUMA — Componente BottomNav (Barra de Navegación Inferior)
// Patrón Android / Material Design 3.
// WCAG 2.2: role="navigation", aria-label, aria-current="page", tap target 44px.
// =============================================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  Coins,
  Users,
  Buildings,
  User,
} from '@phosphor-icons/react';
import styles from './BottomNav.module.css';

/** Definición de ítems de la barra de navegación inferior. */
const ITEMS_NAV = [
  { href: '/dashboard',              Icono: House,     etiqueta: 'Inicio',       exacto: true },
  { href: '/dashboard/finanzas',     Icono: Coins,     etiqueta: 'Finanzas',     exacto: false },
  { href: '/dashboard/comunidad',    Icono: Users,     etiqueta: 'Comunidad',    exacto: false },
  { href: '/dashboard/condominios',  Icono: Buildings, etiqueta: 'Condominios',  exacto: false },
  { href: '/dashboard/perfil',       Icono: User,      etiqueta: 'Perfil',       exacto: false },
];

/**
 * Barra de navegación inferior fija.
 * Cumple con WCAG 2.2 AA: indicador visible de ítem activo, tap targets ≥ 44px.
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={styles.nav}
      role="navigation"
      aria-label="Navegación principal de la aplicación"
    >
      {ITEMS_NAV.map(({ href, Icono, etiqueta, exacto }) => {
        const activo = exacto ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`${styles.item} ${activo ? styles.itemActivo : ''}`}
            aria-label={etiqueta}
            aria-current={activo ? 'page' : undefined}
          >
            {/* Indicador visual superior (línea pill) */}
            <span className={styles.indicador} aria-hidden="true" />

            {/* Ícono Phosphor */}
            <span className={styles.icono} aria-hidden="true">
              <Icono
                size={24}
                weight={activo ? 'fill' : 'regular'}
              />
            </span>

            {/* Etiqueta de texto */}
            <span className={styles.etiqueta}>{etiqueta}</span>
          </Link>
        );
      })}
    </nav>
  );
}
