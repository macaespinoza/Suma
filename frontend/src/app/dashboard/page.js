// =============================================================================
// SUMA — Dashboard Home (Vista del Residente)
// Mock data: María González, Unidad B-201, Condominio Chinchorro.
// Sin llamadas a API. 100% estático para el prototipo.
// =============================================================================

'use client';

import Link from 'next/link';
import {
  Coins,
  Buildings,
  Users,
  ShoppingBag,
  ArrowRight,
  Warning,
  CalendarCheck,
  CheckCircle,
} from '@phosphor-icons/react';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Mock data — Condominio Chinchorro, Junio 2026
// ---------------------------------------------------------------------------
const MOCK = {
  usuario: {
    nombre: 'María',
    apellido: 'González',
    rol: 'Administradora',
  },
  unidad: {
    numero: 'B-201',
    bloque: 'Bloque B',
    condominio: 'Condominio Chinchorro',
    metros_cuadrados: 68,
  },
  gastosComunes: {
    mes: 'Junio 2026',
    monto: 38333,
    estado: 'pendiente', // 'pagado' | 'pendiente' | 'moroso'
  },
  noticias: [
    {
      id: 1,
      tipo: 'aviso',
      titulo: 'Corte de agua programado',
      descripcion: 'Jueves 13 jun., 9:00–13:00 hrs. Bloque A y B.',
    },
    {
      id: 2,
      tipo: 'evento',
      titulo: 'Feria de intercambio vecinal',
      descripcion: 'Sábado 15 jun., 10:00 hrs. Patio central.',
    },
  ],
};

const ACCESOS = [
  {
    href: '/dashboard/finanzas',
    Icono: Coins,
    etiqueta: 'Finanzas',
    variante: 'verde',
  },
  {
    href: '/dashboard/condominios',
    Icono: Buildings,
    etiqueta: 'Condominios',
    variante: 'amarillo',
  },
  {
    href: '/dashboard/comunidad',
    Icono: Users,
    etiqueta: 'Comunidad',
    variante: 'rosa',
  },
  {
    href: '/dashboard/comunidad',
    Icono: ShoppingBag,
    etiqueta: 'Mercadito',
    variante: 'naranja',
  },
];

const ESTADOS = {
  pagado:    { texto: 'Al día ✓',  clase: 'exito' },
  pendiente: { texto: 'Pendiente', clase: 'advertencia' },
  moroso:    { texto: 'Moroso',    clase: 'error' },
};

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);

/** Página Home del dashboard — Vista del residente/administrador */
export default function PaginaDashboard() {
  const { usuario, unidad, gastosComunes, noticias } = MOCK;
  const estadoGC = ESTADOS[gastosComunes.estado];
  const iniciales = `${usuario.nombre[0]}${usuario.apellido[0]}`;

  return (
    <div className={styles.pagina}>

      {/* ===== Saludo ===== */}
      <section className={styles.saludo} aria-label="Información del usuario">
        <div>
          <p className={styles.saludoHola}>Hola, {usuario.nombre} 👋</p>
          <p className={styles.saludoUnidad}>
            {unidad.numero} · {unidad.bloque}
          </p>
          <p className={styles.saludoCondominio}>{unidad.condominio}</p>
        </div>
        <div className={styles.avatarCirculo} aria-hidden="true" title={`${usuario.nombre} ${usuario.apellido}`}>
          {iniciales}
        </div>
      </section>

      {/* ===== Tarjeta de Gastos Comunes ===== */}
      <section
        aria-label={`Estado de gastos comunes de ${gastosComunes.mes}`}
        className={styles.seccion}
      >
        <div className={styles.tarjetaGC}>
          <div className={styles.tarjetaGCHeader}>
            <div>
              <p className={styles.tarjetaGCLabel}>Gastos Comunes</p>
              <p className={styles.tarjetaGCMes}>{gastosComunes.mes}</p>
            </div>
            <span
              className={`${styles.badge} ${styles[`badge--${estadoGC.clase}`]}`}
              aria-label={`Estado: ${estadoGC.texto}`}
            >
              {estadoGC.texto}
            </span>
          </div>
          <p className={styles.tarjetaGCMonto} aria-label={`Monto: ${formatCLP(gastosComunes.monto)}`}>
            {formatCLP(gastosComunes.monto)}
          </p>
          <Link
            href="/dashboard/finanzas"
            className={styles.btnDetalle}
            aria-label="Ver detalle completo en finanzas"
          >
            <Coins size={16} weight="fill" aria-hidden="true" />
            <span>Ver detalle de finanzas</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ===== Accesos Rápidos ===== */}
      <section aria-label="Accesos rápidos a módulos" className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Accesos Rápidos</h2>
        <div className={styles.gridAccesos} role="list">
          {ACCESOS.map(({ href, Icono, etiqueta, variante }) => (
            <Link
              key={etiqueta}
              href={href}
              className={`${styles.accesoItem} ${styles[`acceso--${variante}`]}`}
              role="listitem"
              aria-label={`Acceder a ${etiqueta}`}
            >
              <span className={styles.accesoIcono} aria-hidden="true">
                <Icono size={28} weight="fill" />
              </span>
              <span className={styles.accesoLabel}>{etiqueta}</span>
              <ArrowRight size={14} className={styles.accesoFlecha} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Novedades del condominio ===== */}
      <section aria-label="Novedades del condominio" className={styles.seccion}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Novedades</h2>
          <Link
            href="/dashboard/comunidad"
            className={styles.verTodo}
            aria-label="Ver todas las novedades en Comunidad"
          >
            <span>Ver todo</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.listaNoticias} role="feed" aria-label="Últimas novedades">
          {noticias.map((n, i) => (
            <article
              key={n.id}
              className={styles.noticiaCard}
              aria-label={n.titulo}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span
                className={`${styles.noticiaIcono} ${
                  n.tipo === 'aviso' ? styles.noticiaIconoAviso : styles.noticiaIconoEvento
                }`}
                aria-hidden="true"
              >
                {n.tipo === 'aviso'
                  ? <Warning size={18} weight="fill" />
                  : <CalendarCheck size={18} weight="fill" />
                }
              </span>
              <div className={styles.noticiaTexto}>
                <p className={styles.noticiaTitulo}>{n.titulo}</p>
                <p className={styles.noticiaDesc}>{n.descripcion}</p>
              </div>
              <ArrowRight
                size={15}
                className={styles.noticiaFlecha}
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
