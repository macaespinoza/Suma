// =============================================================================
// SUMA — Pantalla Comunidad (Muro Social)
// Nueva pantalla con 2 tabs: Feed vecinal | Mercadito
// 100% mock data. WCAG 2.2 AA: role="tablist", aria-selected, aria-controls.
// =============================================================================

'use client';

import { useState } from 'react';
import {
  Megaphone,
  CalendarBlank,
  HandHeart,
  Heart,
  Chat,
  ShoppingBag,
  Plus,
} from '@phosphor-icons/react';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Mock data — Condominio Chinchorro
// ---------------------------------------------------------------------------
const MOCK_FEED = [
  {
    id: 1,
    tipo: 'aviso',
    autor: 'Administración',
    unidad: 'Adm.',
    tiempo: 'hace 2h',
    contenido:
      'Se recuerda a los residentes que el corte de agua programado será el jueves 13 de junio entre las 9:00 y las 13:00 hrs. Bloques A y B.',
    reacciones: 14,
    comentarios: 3,
    color: 'amarillo',
  },
  {
    id: 2,
    tipo: 'comunidad',
    autor: 'Carolina Reyes',
    unidad: 'B-204',
    tiempo: 'hace 5h',
    contenido:
      '¡Hola vecinos! Estoy organizando una feria de intercambio este sábado 15 en el patio central 🌱 Trae lo que ya no usas y llévate algo nuevo. ¡Todos bienvenidos!',
    reacciones: 31,
    comentarios: 11,
    color: 'verde',
  },
  {
    id: 3,
    tipo: 'ayuda',
    autor: 'Roberto Díaz',
    unidad: 'A-301',
    tiempo: 'ayer',
    contenido:
      'Busco a alguien que me ayude a cargar unas cajas al auto esta tarde. A cambio le invito un café ☕ ¡Muchas gracias!',
    reacciones: 8,
    comentarios: 4,
    color: 'rosa',
  },
  {
    id: 4,
    tipo: 'aviso',
    autor: 'Administración',
    unidad: 'Adm.',
    tiempo: 'hace 3 días',
    contenido:
      'Recordatorio: La cuota de gastos comunes de junio tiene plazo de pago hasta el 5 de julio. Pueden pagar en línea desde la sección Finanzas.',
    reacciones: 6,
    comentarios: 1,
    color: 'amarillo',
  },
];

const MOCK_MERCADITO = [
  {
    id: 1,
    titulo: 'Bicicleta de montaña',
    descripcion: 'Poco uso, talla M. Incluye casco.',
    precio: '$80.000',
    unidad: 'A-105',
    emoji: '🚲',
  },
  {
    id: 2,
    titulo: 'Clases de yoga',
    descripcion: 'Grupal o individual. Lunes y miércoles.',
    precio: '$5.000/clase',
    unidad: 'B-302',
    emoji: '🧘',
  },
  {
    id: 3,
    titulo: 'Sillón en buenas cond.',
    descripcion: 'Color gris, 2 plazas. Retiro en depto.',
    precio: '$45.000',
    unidad: 'A-212',
    emoji: '🛋️',
  },
];


const TIPO_ICONO = {
  aviso:     <Megaphone size={16} weight="fill" aria-hidden="true" />,
  comunidad: <CalendarBlank size={16} weight="fill" aria-hidden="true" />,
  ayuda:     <HandHeart size={16} weight="fill" aria-hidden="true" />,
};

const TIPO_LABEL = {
  aviso: 'Aviso',
  comunidad: 'Comunidad',
  ayuda: 'Ayuda',
};

const TABS = [
  { id: 'feed',      label: 'Feed',      panel: 'panel-feed' },
  { id: 'mercadito', label: 'Mercadito', panel: 'panel-mercadito' },
];

/** Pantalla de Comunidad — Muro social del Condominio Chinchorro */
export default function PaginaComunidad() {
  const [tabActiva, setTabActiva] = useState(0);

  return (
    <div className={styles.pagina}>

      {/* ===== Tabs ===== */}
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Secciones de comunidad"
      >
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={tabActiva === i}
            aria-controls={tab.panel}
            className={`${styles.tab} ${tabActiva === i ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Panel: Feed ===== */}
      {tabActiva === 0 && (
        <div
          id="panel-feed"
          role="tabpanel"
          aria-labelledby="tab-feed"
          className={styles.panel}
        >
          {MOCK_FEED.map((pub, i) => (
            <article
              key={pub.id}
              className={styles.publicacionCard}
              style={{ animationDelay: `${i * 0.07}s` }}
              aria-label={`Publicación de ${pub.autor}: ${pub.contenido.slice(0, 50)}…`}
            >
              {/* Cabecera */}
              <div className={styles.pubHeader}>
                <div
                  className={`${styles.pubAvatar} ${styles[`avatar--${pub.color}`]}`}
                  aria-hidden="true"
                >
                  {pub.autor.charAt(0)}
                </div>
                <div className={styles.pubInfo}>
                  <p className={styles.pubAutor}>{pub.autor}</p>
                  <p className={styles.pubMeta}>
                    <span className={styles.pubUnidad}>{pub.unidad}</span>
                    <span aria-hidden="true">·</span>
                    <time>{pub.tiempo}</time>
                  </p>
                </div>
                <span
                  className={`${styles.tipoBadge} ${styles[`tipo--${pub.color}`]}`}
                  aria-label={`Tipo: ${TIPO_LABEL[pub.tipo]}`}
                >
                  {TIPO_ICONO[pub.tipo]}
                  {TIPO_LABEL[pub.tipo]}
                </span>
              </div>

              {/* Contenido */}
              <p className={styles.pubContenido}>{pub.contenido}</p>

              {/* Acciones */}
              <div className={styles.pubAcciones}>
                <button
                  className={styles.btnAccion}
                  aria-label={`${pub.reacciones} reacciones. Me gusta`}
                  type="button"
                >
                  <Heart size={16} weight="regular" aria-hidden="true" />
                  <span>{pub.reacciones}</span>
                </button>
                <button
                  className={styles.btnAccion}
                  aria-label={`${pub.comentarios} comentarios. Comentar`}
                  type="button"
                >
                  <Chat size={16} weight="regular" aria-hidden="true" />
                  <span>{pub.comentarios}</span>
                </button>
              </div>
            </article>
          ))}

          {/* FAB Publicar */}
          <button
            className={styles.fab}
            aria-label="Crear nueva publicación en el muro comunitario"
            type="button"
          >
            <Plus size={22} weight="bold" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ===== Panel: Mercadito ===== */}
      {tabActiva === 1 && (
        <div
          id="panel-mercadito"
          role="tabpanel"
          aria-labelledby="tab-mercadito"
          className={styles.panel}
        >
          <p className={styles.panelSubtitulo}>
            Compra, vende o intercambia con tus vecinos del Condominio Chinchorro.
          </p>
          {MOCK_MERCADITO.map((item, i) => (
            <article
              key={item.id}
              className={styles.mercaditoCard}
              style={{ animationDelay: `${i * 0.07}s` }}
              aria-label={`${item.titulo} — ${item.precio}, publicado por unidad ${item.unidad}`}
            >
              <div className={styles.mercaditoEmoji} aria-hidden="true">
                {item.emoji}
              </div>
              <div className={styles.mercaditoInfo}>
                <p className={styles.mercaditoTitulo}>{item.titulo}</p>
                <p className={styles.mercaditoDesc}>{item.descripcion}</p>
                <p className={styles.mercaditoMeta}>Unidad {item.unidad}</p>
              </div>
              <div className={styles.mercaditorDerecha}>
                <span className={styles.mercaditorPrecio}>{item.precio}</span>
                <button
                  className={styles.btnContactar}
                  type="button"
                  aria-label={`Contactar vecino de unidad ${item.unidad} por ${item.titulo}`}
                >
                  <Chat size={14} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}

          {/* FAB Publicar */}
          <button
            className={styles.fab}
            aria-label="Publicar nuevo artículo en el Mercadito"
            type="button"
          >
            <Plus size={22} weight="bold" aria-hidden="true" />
          </button>
        </div>
      )}


    </div>
  );
}
