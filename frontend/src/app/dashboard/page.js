// =============================================================================
// SUMA — Pagina Principal del Dashboard (Bento Grid)
// Vista de resumen con tarjetas de metricas, accesos rapidos y placeholders
// para modulos futuros (Comunidad Civica, Economia Circular, Infraestructura).
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api.js';
import styles from './page.module.css';

/**
 * Dashboard principal post-login con patron Bento Grid.
 * Incluye placeholders para modulos en desarrollo.
 */
export default function PaginaDashboard() {
  const [metricas, setMetricas] = useState({
    condominios: 0,
    unidades: 0,
    usuarios: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const [resCondominios, resUsuarios] = await Promise.all([
          api.get('/condominios'),
          api.get('/usuarios'),
        ]);

        const condominios = resCondominios.datos;
        const usuarios = resUsuarios.datos;

        const totalUnidades = condominios.reduce(
          (acc, c) => acc + (c.cantidad_unidades || 0),
          0
        );

        setMetricas({
          condominios: condominios.length,
          unidades: totalUnidades,
          usuarios: usuarios.length,
        });
      } catch {
        // Silenciar errores en el dashboard.
      } finally {
        setCargando(false);
      }
    };

    cargarMetricas();
  }, []);

  return (
    <div className={styles.dashboard}>
      {/* --- Saludo --- */}
      <div className={styles.saludo}>
        <h1 className={styles.saludoTitulo}>Bienvenido a SUMA</h1>
        <p className={styles.saludoSubtitulo}>
          Resumen estructural de tu comunidad.
        </p>
      </div>

      {/* --- Bento Grid: Metricas + Modulos --- */}
      <div className={styles.bentoGrid}>
        {/* Metrica: Condominios */}
        <Link href="/dashboard/condominios" className={`${styles.metricaCard} ${styles.metricaPrimario}`}>
          <div className={styles.metricaIcono}>🏘️</div>
          <div className={styles.metricaDetalle}>
            <span className={styles.metricaValor}>
              {cargando ? '—' : metricas.condominios}
            </span>
            <span className={styles.metricaEtiqueta}>Condominios</span>
          </div>
        </Link>

        {/* Metrica: Unidades */}
        <Link href="/dashboard/unidades" className={`${styles.metricaCard} ${styles.metricaExito}`}>
          <div className={styles.metricaIcono}>🏠</div>
          <div className={styles.metricaDetalle}>
            <span className={styles.metricaValor}>
              {cargando ? '—' : metricas.unidades}
            </span>
            <span className={styles.metricaEtiqueta}>Unidades</span>
          </div>
        </Link>

        {/* Metrica: Usuarios */}
        <Link href="/dashboard/usuarios" className={`${styles.metricaCard} ${styles.metricaAdvertencia}`}>
          <div className={styles.metricaIcono}>👥</div>
          <div className={styles.metricaDetalle}>
            <span className={styles.metricaValor}>
              {cargando ? '—' : metricas.usuarios}
            </span>
            <span className={styles.metricaEtiqueta}>Usuarios</span>
          </div>
        </Link>

        {/* Metrica: Activos */}
        <Link href="/dashboard/condominios" className={`${styles.metricaCard} ${styles.metricaInfo}`}>
          <div className={styles.metricaIcono}>📊</div>
          <div className={styles.metricaDetalle}>
            <span className={styles.metricaValor}>
              {cargando ? '—' : metricas.condominios}
            </span>
            <span className={styles.metricaEtiqueta}>Activos</span>
          </div>
        </Link>

        {/* --- Modulo Comunidad Civica (Votaciones) — STAND BY --- */}
        <div className={`${styles.moduloBento} ${styles.moduloCivico}`}>
          <div className={styles.moduloHeader}>
            <h3 className={styles.moduloTitulo}>Comunidad Civica</h3>
            <span className={styles.moduloBadge}>En desarrollo</span>
          </div>
          <div className={styles.moduloContenido}>
            <div className={styles.moduloPlaceholder}>
              <span className={styles.moduloPlaceholderIcono}>🗳️</span>
              <span className={styles.moduloPlaceholderTexto}>
                Votaciones comunitarias, asambleas y decisiones vecinales.
              </span>
            </div>
          </div>
        </div>

        {/* --- Modulo Economia Circular — STAND BY --- */}
        <div className={`${styles.moduloBento} ${styles.moduloEconomia}`}>
          <div className={styles.moduloHeader}>
            <h3 className={styles.moduloTitulo}>Economia Circular</h3>
            <span className={styles.moduloBadge}>En desarrollo</span>
          </div>
          <div className={styles.moduloContenido}>
            <div className={styles.moduloPlaceholder}>
              <span className={styles.moduloPlaceholderIcono}>♻️</span>
              <span className={styles.moduloPlaceholderTexto}>
                Marketplace local, trueque y sustentabilidad.
              </span>
            </div>
          </div>
        </div>

        {/* --- Modulo Infraestructura / Propiedad — STAND BY --- */}
        <div className={`${styles.moduloBento} ${styles.moduloInfraestructura}`}>
          <div className={styles.moduloHeader}>
            <h3 className={styles.moduloTitulo}>Infraestructura</h3>
            <span className={styles.moduloBadge}>En desarrollo</span>
          </div>
          <div className={styles.moduloContenido}>
            <div className={styles.moduloPlaceholder}>
              <span className={styles.moduloPlaceholderIcono}>🏗️</span>
              <span className={styles.moduloPlaceholderTexto}>
                Estado de propiedades, mantencion y activos.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Secciones de contenido --- */}
      <div className={styles.contenidoGrid}>
        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}>Accesos Rapidos</h3>
          <div className={styles.accesosRapidos}>
            <Link href="/dashboard/condominios" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>🏘️</span>
              <span className={styles.accesoTexto}>Gestionar Condominios</span>
            </Link>
            <Link href="/dashboard/unidades" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>🏠</span>
              <span className={styles.accesoTexto}>Gestionar Unidades</span>
            </Link>
            <Link href="/dashboard/usuarios" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>👥</span>
              <span className={styles.accesoTexto}>Gestionar Usuarios</span>
            </Link>
            <Link href="/dashboard/finanzas" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>💰</span>
              <span className={styles.accesoTexto}>Dashboard Financiero</span>
            </Link>
          </div>
        </div>

        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}>Administracion</h3>
          <div className={styles.accesosRapidos}>
            <Link href="/dashboard/finanzas" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>💰</span>
              <span className={styles.accesoTexto}>Dashboard Financiero</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
