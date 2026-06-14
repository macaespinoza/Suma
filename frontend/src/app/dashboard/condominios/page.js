// =============================================================================
// SUMA — Pantalla Condominios (Mobile-First, 100% Mock Data)
// Muestra el Condominio Chinchorro con sus 2 bloques y estadísticas.
// Sin llamadas a API. WCAG 2.2 AA: landmarks, aria-labels.
// =============================================================================

'use client';

import {
  Buildings,
  House,
  User,
  MapPin,
  CheckCircle,
  Clock,
  Warning,
  Plus,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Mock data — Condominio Chinchorro
// ---------------------------------------------------------------------------
const MOCK_CONDOMINIO = {
  id: '1',
  nombre: 'Condominio Chinchorro',
  direccion: 'Av. Chinchorro 1850',
  ciudad: 'Arica',
  region: 'Región de Arica y Parinacota',
  estado: 'activo',
  unidades_total: 48,
  administrador: 'María González',
  telefono: '+56 9 8765 4321',
  bloques: [
    {
      id: 'A',
      nombre: 'Bloque A',
      pisos: 6,
      unidades_total: 24,
      estado_pago: { pagadas: 20, pendientes: 3, morosas: 1 },
    },
    {
      id: 'B',
      nombre: 'Bloque B',
      pisos: 6,
      unidades_total: 24,
      estado_pago: { pagadas: 18, pendientes: 4, morosas: 2 },
    },
  ],
};

/** Indicador de estado de pago de un bloque */
function EstadoPago({ pagadas, pendientes, morosas, total }) {
  return (
    <div className={styles.bloquePago} aria-label={`${pagadas} pagadas, ${pendientes} pendientes, ${morosas} morosas`}>
      <span className={`${styles.pagoBadge} ${styles.pagoVerde}`}>
        <CheckCircle size={12} weight="fill" aria-hidden="true" />
        {pagadas}
      </span>
      <span className={`${styles.pagoBadge} ${styles.pagoAmarillo}`}>
        <Clock size={12} weight="fill" aria-hidden="true" />
        {pendientes}
      </span>
      <span className={`${styles.pagoBadge} ${styles.pagoRojo}`}>
        <Warning size={12} weight="fill" aria-hidden="true" />
        {morosas}
      </span>
    </div>
  );
}

/** Pantalla de gestión de condominios — prototipo estático */
export default function PaginaCondominios() {
  const c = MOCK_CONDOMINIO;
  const totalPagadas = c.bloques.reduce((s, b) => s + b.estado_pago.pagadas, 0);

  return (
    <div className={styles.pagina}>

      {/* ===== Tarjeta principal del condominio ===== */}
      <section
        aria-label={`Información del condominio: ${c.nombre}`}
        className={styles.tarjetaHero}
      >
        {/* Icono decorativo */}
        <div className={styles.heroIcono} aria-hidden="true">
          <Buildings size={40} weight="fill" />
        </div>

        <div className={styles.heroInfo}>
          <div className={styles.heroHeader}>
            <h2 className={styles.heroNombre}>{c.nombre}</h2>
            <span className={styles.badgeActivo} aria-label="Estado: Activo">
              Activo
            </span>
          </div>

          <p className={styles.heroDireccion}>
            <MapPin size={13} weight="fill" aria-hidden="true" />
            {c.direccion}, {c.ciudad}
          </p>
          <p className={styles.heroRegion}>{c.region}</p>
        </div>

        {/* Stats rápidas */}
        <div className={styles.heroStats} role="group" aria-label="Estadísticas del condominio">
          <div className={styles.statItem}>
            <span className={styles.statNum}>{c.unidades_total}</span>
            <span className={styles.statLabel}>Unidades</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{c.bloques.length}</span>
            <span className={styles.statLabel}>Bloques</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{totalPagadas}</span>
            <span className={styles.statLabel}>Al día</span>
          </div>
        </div>
      </section>

      {/* ===== Administrador ===== */}
      <section aria-label="Información del administrador" className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Administración</h2>
        <div className={styles.adminCard}>
          <div className={styles.adminAvatar} aria-hidden="true">
            <img src="/images/maria.jpg" alt={c.administrador} className={styles.avatarImagen} />
          </div>
          <div className={styles.adminInfo}>
            <p className={styles.adminNombre}>{c.administrador}</p>
            <p className={styles.adminRol}>Administradora General</p>
            <p className={styles.adminTel}>{c.telefono}</p>
          </div>
          <div className={styles.adminIcono} aria-hidden="true">
            <User size={20} />
          </div>
        </div>
      </section>

      {/* ===== Bloques ===== */}
      <section aria-label="Bloques del condominio" className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Bloques</h2>
        <motion.div
          className={styles.bloquesList}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {c.bloques.map((bloque, i) => {
            const { pagadas, pendientes, morosas } = bloque.estado_pago;
            const total = bloque.unidades_total;
            const tasaPago = Math.round((pagadas / total) * 100);

            return (
              <motion.article
                key={bloque.id}
                className={styles.bloqueCard}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
                aria-label={`${bloque.nombre}: ${total} unidades, ${bloque.pisos} pisos, tasa de pago ${tasaPago}%`}
              >
                <div className={styles.bloqueHeader}>
                  <div className={styles.bloqueIcono} aria-hidden="true">
                    <House size={22} weight="fill" />
                  </div>
                  <div className={styles.bloqueInfo}>
                    <p className={styles.bloqueNombre}>{bloque.nombre}</p>
                    <p className={styles.bloqueMeta}>
                      {bloque.unidades_total} unidades · {bloque.pisos} pisos
                    </p>
                  </div>
                  <span
                    className={`${styles.bloqueTasa} ${
                      tasaPago >= 80 ? styles.tasaVerde : tasaPago >= 60 ? styles.tasaAmarillo : styles.tasaRojo
                    }`}
                    aria-label={`Tasa de pago: ${tasaPago}%`}
                  >
                    {tasaPago}%
                  </span>
                </div>

                {/* Estado de pago de unidades */}
                <EstadoPago
                  pagadas={pagadas}
                  pendientes={pendientes}
                  morosas={morosas}
                  total={total}
                />

                {/* Barra de progreso */}
                <div className={styles.barraProgreso} aria-hidden="true">
                  <motion.div
                    className={styles.barraRelleno}
                    initial={{ width: 0 }}
                    animate={{ width: `${tasaPago}%` }}
                    transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      {/* FAB Agregar condominio */}
      <button
        className={styles.fab}
        type="button"
        aria-label="Agregar nuevo condominio"
      >
        <Plus size={22} weight="bold" aria-hidden="true" />
      </button>

    </div>
  );
}
