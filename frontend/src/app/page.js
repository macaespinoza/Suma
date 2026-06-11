// =============================================================================
// SUMA — Pantalla de Login (Mobile-First, Material Design 3)
// Logo SVG centrado, hero con gradiente spring-green,
// card inferior con formulario de acceso.
// WCAG 2.2 AA: aria-required, role="alert", aria-busy, aria-label.
// =============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Warning, Eye, EyeSlash } from '@phosphor-icons/react';
import styles from './page.module.css';
import { mockAuth } from '../lib/auth-mock.js';
import Logo from '../componentes/ui/Logo.jsx';

/** Pantalla de inicio de sesión, diseño 100% mobile-first. */
export default function PaginaInicio() {
  const router = useRouter();
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [error, setError]                     = useState('');
  const [cargando, setCargando]               = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await mockAuth.signInWithEmailAndPassword(email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err.message === 'auth/invalid-credential') {
        setError('Credenciales inválidas. Usa demo@suma.cl / demo123');
      } else {
        setError('Error al iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.pantalla}>

      {/* ===== Hero / Branding ===== */}
      <div className={styles.hero}>
        <div className={styles.heroOrbe} aria-hidden="true" />
        <div className={styles.heroParticulas} aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
        <div className={styles.heroContenido}>
          <Logo
            className={styles.heroLogo}
            aria-label="Logo SUMA"
          />
          <p className={styles.heroTagline}>Gestión y Cohesión Comunitaria</p>
          <span className={styles.heroSubtexto}>🌊 Arica, Chile</span>
        </div>
      </div>

      {/* ===== Tarjeta de login ===== */}
      <div className={styles.tarjetaLogin} role="main">
        <h1 className={styles.titulo}>Bienvenido/a</h1>
        <p className={styles.subtitulo}>Ingresa a tu condominio</p>

        <form
          className={styles.formulario}
          onSubmit={manejarSubmit}
          noValidate
          aria-label="Formulario de inicio de sesión"
        >
          {/* Email */}
          <div className={styles.campo}>
            <label htmlFor="login-email" className={styles.etiqueta}>
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              className={styles.entrada}
              placeholder="tu@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>

          {/* Contraseña */}
          <div className={styles.campo}>
            <label htmlFor="login-password" className={styles.etiqueta}>
              Contraseña
            </label>
            <div className={styles.entradaGrupo}>
              <input
                id="login-password"
                type={mostrarPassword ? 'text' : 'password'}
                name="password"
                className={`${styles.entrada} ${styles.entradaConIcono}`}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                aria-required="true"
              />
              <button
                type="button"
                className={styles.btnOjito}
                onClick={() => setMostrarPassword(!mostrarPassword)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword
                  ? <EyeSlash size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className={styles.error}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <Warning size={16} weight="fill" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de acción */}
          <button
            id="btn-iniciar-sesion"
            type="submit"
            className={styles.botonAccion}
            disabled={cargando}
            aria-busy={cargando}
            aria-label={cargando ? 'Iniciando sesión, espera...' : 'Ingresar al sistema'}
          >
            {cargando ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : (
              <>
                <span>Ingresar</span>
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Credenciales de demo */}
        <div
          className={styles.credencialesDemo}
          role="note"
          aria-label="Credenciales de demostración para el prototipo"
        >
          <p className={styles.credencialesTitulo}>Modo demostración</p>
          <code className={styles.credencialCodigo}>demo@suma.cl</code>
          <code className={styles.credencialCodigo}>demo123</code>
        </div>

        {/* Recuperar contraseña */}
        <a
          href="#"
          className={styles.olvidaste}
          aria-label="Recuperar contraseña olvidada"
        >
          ¿Olvidaste tu contraseña?
        </a>

        <footer className={styles.footer}>
          <p>© 2026 ComunidApp SpA · Arica, Chile</p>
        </footer>
      </div>
    </div>
  );
}
