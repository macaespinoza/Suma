// =============================================================================
// SUMA — Página Principal del Dashboard
// Vista de resumen con tarjetas de métricas y accesos rápidos.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import styles from './page.module.css';

/**
 * Dashboard principal post-login.
 * Muestra un resumen de métricas del condominio y accesos rápidos.
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

        // Contar unidades sumando cantidad_unidades de cada condominio.
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
          Aquí tienes un resumen de tu condominio.
        </p>
      </div>

      {/* --- Grid de Métricas --- */}
      <div className={styles.metricasGrid}>
        <div className={`${styles.metricaCard} ${styles.metricaPrimario}`}>
          <div className={styles.metricaIcono}>🏘️</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>
              {cargando ? '...' : metricas.condominios}
            </span>
            <span className={styles.metricaEtiqueta}>Condominios</span>
          </div>
        </div>
        <div className={`${styles.metricaCard} ${styles.metricaExito}`}>
          <div className={styles.metricaIcono}>🏠</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>
              {cargando ? '...' : metricas.unidades}
            </span>
            <span className={styles.metricaEtiqueta}>Unidades</span>
          </div>
        </div>
        <div className={`${styles.metricaCard} ${styles.metricaAdvertencia}`}>
          <div className={styles.metricaIcono}>👥</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>
              {cargando ? '...' : metricas.usuarios}
            </span>
            <span className={styles.metricaEtiqueta}>Usuarios</span>
          </div>
        </div>
        <div className={`${styles.metricaCard} ${styles.metricaInfo}`}>
          <div className={styles.metricaIcono}>📊</div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaValor}>
              {cargando ? '...' : metricas.condominios}
            </span>
            <span className={styles.metricaEtiqueta}>Activos</span>
          </div>
        </div>
      </div>

      {/* --- Secciones de contenido --- */}
      <div className={styles.contenidoGrid}>
        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}>Accesos Rápidos</h3>
          <div className={styles.accesosRapidos}>
            <a href="/dashboard/condominios" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>🏘️</span>
              <span className={styles.accesoTexto}>Gestionar Condominios</span>
            </a>
            <a href="/dashboard/unidades" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>🏠</span>
              <span className={styles.accesoTexto}>Gestionar Unidades</span>
            </a>
            <a href="/dashboard/usuarios" className={styles.accesoRapido}>
              <span className={styles.accesoIcono}>👥</span>
              <span className={styles.accesoTexto}>Gestionar Usuarios</span>
            </a>
          </div>
        </div>
        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}>Módulos Próximamente</h3>
          <div className={styles.placeholder}>
            <p>Gastos comunes, cobros y pagos — en desarrollo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
