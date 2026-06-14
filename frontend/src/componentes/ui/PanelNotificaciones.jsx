// =============================================================================
// SUMA — Panel de Notificaciones Desplegable
// Glassmorphismo + avisos comunitarios mock + framer-motion.
// Se abre desde el ícono Bell del TopAppBar.
// =============================================================================

'use client';

import { motion } from 'framer-motion';
import {
  X,
  Warning,
  CalendarCheck,
  Info,
  CheckCircle,
} from '@phosphor-icons/react';
import styles from './PanelNotificaciones.module.css';

// ---------------------------------------------------------------------------
// Mock data — Avisos importantes del Condominio Chinchorro, Junio 2026
// ---------------------------------------------------------------------------
const AVISOS = [
  {
    id: 1,
    tipo: 'urgente',
    titulo: 'Corte de agua programado',
    descripcion: 'Jueves 13 jun., 9:00–13:00 hrs. Bloques A y B.',
    hora: 'Hace 2h',
    leido: false,
  },
  {
    id: 2,
    tipo: 'evento',
    titulo: 'Feria de intercambio vecinal',
    descripcion: 'Sábado 15 jun., 10:00 hrs. Patio central.',
    hora: 'Hace 5h',
    leido: false,
  },
  {
    id: 3,
    tipo: 'info',
    titulo: 'Actas asamblea disponibles',
    descripcion: 'Las actas de la asamblea ordinaria mayo 2026 ya están en Documentos.',
    hora: 'Ayer',
    leido: true,
  },
];

const ICONO_TIPO = {
  urgente: { Icono: Warning,       clase: styles.iconoUrgente  },
  evento:  { Icono: CalendarCheck, clase: styles.iconoEvento   },
  info:    { Icono: Info,          clase: styles.iconoInfo      },
  exito:   { Icono: CheckCircle,   clase: styles.iconoExito     },
};

/** Variantes de animación para el panel completo */
const variantesPanel = {
  oculto:  { opacity: 0, y: -8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 380, damping: 28, mass: 0.8 },
  },
  salida:  {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/** Variantes stagger para los ítems */
const variantesLista = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const variantesItem = {
  oculto:  { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

/**
 * Panel desplegable de notificaciones.
 * @param {{ onCerrar: () => void }} props
 */
export default function PanelNotificaciones({ onCerrar }) {
  const sinLeer = AVISOS.filter((a) => !a.leido).length;

  return (
    <motion.aside
      className={styles.panel}
      role="dialog"
      aria-label="Notificaciones del condominio"
      aria-modal="true"
      variants={variantesPanel}
      initial="oculto"
      animate="visible"
      exit="salida"
    >
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <div className={styles.encabezadoIzq}>
          <span className={styles.titulo}>Notificaciones</span>
          {sinLeer > 0 && (
            <span className={styles.countBadge} aria-label={`${sinLeer} sin leer`}>
              {sinLeer}
            </span>
          )}
        </div>
        <button
          className={styles.btnCerrar}
          onClick={onCerrar}
          aria-label="Cerrar panel de notificaciones"
          type="button"
        >
          <X size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {/* Lista de avisos */}
      <motion.ul
        className={styles.lista}
        role="list"
        variants={variantesLista}
        initial="oculto"
        animate="visible"
      >
        {AVISOS.map((aviso) => {
          const { Icono, clase } = ICONO_TIPO[aviso.tipo] ?? ICONO_TIPO.info;
          return (
            <motion.li
              key={aviso.id}
              className={`${styles.item} ${aviso.leido ? styles.itemLeido : styles.itemNoLeido}`}
              role="listitem"
              variants={variantesItem}
            >
              <span className={`${styles.iconoWrap} ${clase}`} aria-hidden="true">
                <Icono size={16} weight="fill" />
              </span>
              <div className={styles.itemTexto}>
                <p className={styles.itemTitulo}>{aviso.titulo}</p>
                <p className={styles.itemDesc}>{aviso.descripcion}</p>
                <time className={styles.itemHora}>{aviso.hora}</time>
              </div>
              {!aviso.leido && (
                <span className={styles.puntoDot} aria-label="No leído" />
              )}
            </motion.li>
          );
        })}
      </motion.ul>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.btnVerTodos} type="button">
          Ver todos los avisos
        </button>
      </div>
    </motion.aside>
  );
}
