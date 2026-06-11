// =============================================================================
// SUMA — Pantalla Perfil (Placeholder para prototipo)
// =============================================================================

'use client';

import Logo from '../../../componentes/ui/Logo.jsx';
import { User, SignOut, Bell, Lock, Question } from '@phosphor-icons/react';
import styles from './page.module.css';

const MOCK_PERFIL = {
  nombre: 'María González',
  email: 'mgonzalez@chinchorro.cl',
  unidad: 'B-201',
  rol: 'Administradora',
  condominio: 'Condominio Chinchorro',
};

const OPCIONES = [
  { Icono: Bell,       label: 'Notificaciones',         desc: 'Configurar alertas' },
  { Icono: Lock,       label: 'Seguridad',               desc: 'Contraseña y acceso' },
  { Icono: Question, label: 'Ayuda y soporte',         desc: 'Centro de ayuda SUMA' },
];

export default function PaginaPerfil() {
  const p = MOCK_PERFIL;

  return (
    <div className={styles.pagina}>

      {/* Avatar y datos del usuario */}
      <section aria-label="Datos del perfil" className={styles.perfilHero}>
        <div className={styles.avatarGrande} aria-hidden="true">
          {p.nombre.split(' ').map(n => n[0]).join('').slice(0,2)}
        </div>
        <h2 className={styles.perfilNombre}>{p.nombre}</h2>
        <p className={styles.perfilEmail}>{p.email}</p>
        <div className={styles.perfilBadges}>
          <span className={styles.badge}>{p.rol}</span>
          <span className={styles.badgeUnidad}>Unidad {p.unidad}</span>
        </div>
        <p className={styles.perfilCondominio}>{p.condominio}</p>
      </section>

      {/* Logo SUMA */}
      <div className={styles.logoSuma} aria-label="Aplicación SUMA">
        <Logo className={styles.logoSumaImg} />
        <p className={styles.logoVersion}>Versión 1.0.0 — Prototipo</p>
      </div>

      {/* Opciones */}
      <section aria-label="Opciones de perfil" className={styles.seccion}>
        {OPCIONES.map(({ Icono, label, desc }) => (
          <button
            key={label}
            className={styles.opcionItem}
            type="button"
            aria-label={`${label}: ${desc}`}
          >
            <span className={styles.opcionIcono} aria-hidden="true">
              <Icono size={20} weight="fill" />
            </span>
            <div className={styles.opcionTexto}>
              <span className={styles.opcionLabel}>{label}</span>
              <span className={styles.opcionDesc}>{desc}</span>
            </div>
          </button>
        ))}
      </section>

      {/* Cerrar sesión */}
      <button
        className={styles.btnCerrarSesion}
        type="button"
        aria-label="Cerrar sesión de la aplicación"
      >
        <SignOut size={18} weight="bold" aria-hidden="true" />
        <span>Cerrar Sesión</span>
      </button>

    </div>
  );
}
