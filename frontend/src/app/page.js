'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { mockAuth } from '../lib/auth-mock.js';

function GoogleIcon() {
  return (
    <svg className={styles.googleIcono} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function PaginaInicio() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await mockAuth.signInWithEmailAndPassword(email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err.message === 'auth/invalid-credential') {
        setError('Credenciales inválidas. Intenta con demo@suma.cl / demo123');
      } else {
        setError('Error al iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className={styles.principal}>
      {/* --- Panel Izquierdo: Branding Evocador --- */}
      <div className={styles.panelBranding}>
        <div className={styles.brandingContenido}>
          <div className={styles.brandingLogo}>
            <div className={styles.brandingIcono}>🏢</div>
            <span className={styles.brandingNombre}>SUMA</span>
          </div>
          <h1 className={styles.brandingTitulo}>Gestión y Cohesión Comunitaria</h1>
          <p className={styles.brandingDescripcion}>
            Plataforma integral para administrar tu condominio, conectar con tus vecinos
            y construir comunidad en Arica, Chile.
          </p>
          <div className={styles.brandingFeatures}>
            <div className={styles.brandingFeature}>
              <span className={styles.brandingFeatureIcono}>📊</span>
              <span>Gastos comunes y cobranza inteligente</span>
            </div>
            <div className={styles.brandingFeature}>
              <span className={styles.brandingFeatureIcono}>🤝</span>
              <span>Red vecinal y apoyo mutuo</span>
            </div>
            <div className={styles.brandingFeature}>
              <span className={styles.brandingFeatureIcono}>🛒</span>
              <span>Economía circular local</span>
            </div>
          </div>
          <p className={styles.brandingTagline}>Hecho en Arica · Para Chile 🇨🇱</p>
        </div>
      </div>

      {/* --- Panel Derecho: Formulario --- */}
      <div className={styles.panelFormulario}>
        <div className={styles.formularioContenedor}>
          <div className={styles.formularioHeader}>
            <span className={styles.formularioLogo}>🏢</span>
            <h2 className={styles.formularioTitulo}>Iniciar Sesión</h2>
            <p className={styles.formularioSubtitulo}>
              Accede al panel de tu condominio
            </p>
          </div>

          <form className={styles.formLogin} onSubmit={manejarSubmit}>
            <div className={styles.campoForm}>
              <label htmlFor="email" className={styles.etiquetaCampo}>Correo electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                className={styles.entradaCampo}
                placeholder="tu@correo.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className={styles.campoForm}>
              <label htmlFor="password" className={styles.etiquetaCampo}>Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                className={styles.entradaCampo}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className={styles.errorMensaje} role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className={styles.botonAccion} disabled={cargando}>
              {cargando ? (
                <span>Entrando...</span>
              ) : (
                <>
                  <span>Entrar</span>
                  <span className={styles.botonAccionIcono}>→</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.separador}>
            <span>o continúa con</span>
          </div>

          <button type="button" className={styles.botonGoogle} disabled aria-label="Iniciar sesión con Google (próximamente)">
            <GoogleIcon />
            <span>Google</span>
          </button>

          <div className={styles.credencialesDemo}>
            <p className={styles.credencialesTitulo}>Modo desarrollo — Credenciales de prueba:</p>
            <code className={styles.credencialCodigo}>demo@suma.cl / demo123</code>
          </div>

          <div className={styles.formularioFooter}>
            <a href="#" className={styles.enlaceRecuperar}>¿Olvidaste tu contraseña?</a>
          </div>

          <div className={styles.modulosSeccion}>
            <p className={styles.modulosTitulo}>Módulos del sistema</p>
            <div className={styles.modulosGrid}>
              <div className={styles.moduloItem}>
                <span className={styles.moduloIcono}>📊</span>
                <span className={styles.moduloNombre}>Administración</span>
              </div>
              <div className={styles.moduloItem}>
                <span className={styles.moduloIcono}>🏘️</span>
                <span className={styles.moduloNombre}>Comunidad</span>
              </div>
              <div className={styles.moduloItem}>
                <span className={styles.moduloIcono}>🛒</span>
                <span className={styles.moduloNombre}>Mercadito</span>
              </div>
              <div className={styles.moduloItem}>
                <span className={styles.moduloIcono}>🐾</span>
                <span className={styles.moduloNombre}>Mascotas</span>
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <p>SUMA © 2026 — ComunidApp · Arica, Chile 🇨🇱</p>
          </footer>
        </div>
      </div>
    </main>
  );
}