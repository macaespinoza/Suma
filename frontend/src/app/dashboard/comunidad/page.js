// =============================================================================
// SUMA — Pantalla Comunidad (Muro Social y Mercadito)
// 100% mock data basado en API_SPEC_COMUNIDAD.md
// WCAG 2.2 AA: role="tablist", aria-selected, aria-controls.
// =============================================================================

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  CalendarBlank,
  HandHeart,
  Heart,
  Chat,
  ShoppingBag,
  Plus,
  Image,
  Users,
} from '@phosphor-icons/react';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Mock data — Muro (Basado en API_SPEC_COMUNIDAD.md)
// ---------------------------------------------------------------------------
const MOCK_PUBLICACIONES = [
  {
    id: 'pub-1',
    autor: {
      id: 'usr-admin',
      nombre: 'Administración',
      avatar: null,
    },
    contenido: 'Estimados vecinos, se informa que el corte de agua será a las 15:00 hrs. Bloques A y B.',
    fecha_creacion: '2026-06-11T10:00:00Z',
    cantidad_comentarios: 5,
    me_gusta: 12,
    tipo: 'aviso',
  },
  {
    id: 'pub-2',
    autor: {
      id: 'usr-carolina',
      nombre: 'Carolina Reyes',
      avatar: null,
    },
    contenido: '¡Hola vecinos! Estoy organizando una feria de intercambio este sábado 15 en el patio central. Trae lo que ya no usas y llévate algo nuevo. ¡Todos bienvenidos!',
    fecha_creacion: '2026-06-10T14:30:00Z',
    cantidad_comentarios: 11,
    me_gusta: 31,
    tipo: 'comunidad',
  },
  {
    id: 'pub-3',
    autor: {
      id: 'usr-roberto',
      nombre: 'Roberto Díaz',
      avatar: null,
    },
    contenido: 'Busco a alguien que me ayude a cargar unas cajas al auto esta tarde. A cambio le invito un café.',
    fecha_creacion: '2026-06-09T16:00:00Z',
    cantidad_comentarios: 4,
    me_gusta: 8,
    tipo: 'ayuda',
  },
];

const MOCK_COMENTARIOS_MURO = {
  'pub-1': [
    { id: 'com-1', autor: { id: 'usr-1', nombre: 'Pedro Rojas' }, contenido: 'Gracias por el aviso, tomaremos precauciones.', fecha_creacion: '2026-06-11T10:30:00Z' },
    { id: 'com-2', autor: { id: 'usr-2', nombre: 'Ana Silva' }, contenido: '¿El corte afecta también al bloque C?', fecha_creacion: '2026-06-11T10:45:00Z' },
    { id: 'com-3', autor: { id: 'usr-admin', nombre: 'Administración' }, contenido: 'Sí Ana, el corte afecta todos los bloques. Finaliza aproximadamente a las 17:00 hrs.', fecha_creacion: '2026-06-11T11:00:00Z' },
  ],
  'pub-2': [
    { id: 'com-4', autor: { id: 'usr-3', nombre: 'Luis Pérez' }, contenido: '¡Me encanta la idea!缺缺缺缺缺缺缺缺缺', fecha_creacion: '2026-06-10T15:00:00Z' },
    { id: 'com-5', autor: { id: 'usr-4', nombre: 'María Fernández' }, contenido: 'Voy a llevar algunas cosas de la cocina que ya no uso.', fecha_creacion: '2026-06-10T15:30:00Z' },
  ],
};

// ---------------------------------------------------------------------------
// Mock data — Mercadito (Basado en API_SPEC_COMUNIDAD.md)
// ---------------------------------------------------------------------------
const MOCK_PRODUCTOS = [
  {
    id: 'prod-1',
    vendedor: { id: 'usr-ana', nombre: 'Ana Silva', unidad: 'Depto 402' },
    titulo: 'Vendo Bicicleta Aro 26',
    descripcion: 'Bicicleta en excelente estado, poco uso. Incluye casco y candado.',
    precio: 85000,
    imagenes: ['/images/bicicleta.jpg'],
    fecha_publicacion: '2026-06-10T15:00:00Z',
    cantidad_comentarios: 2,
    estado: 'activo',
  },
  {
    id: 'prod-2',
    vendedor: { id: 'usr-carlos', nombre: 'Carlos Mendoza', unidad: 'Depto 205' },
    titulo: 'Clases de Yoga',
    descripcion: 'Grupal o individual. Lunes y miércoles 19:00 hrs. Primer clase gratis.',
    precio: 5000,
    imagenes: ['/images/yoga.jpg'],
    fecha_publicacion: '2026-06-09T10:00:00Z',
    cantidad_comentarios: 1,
    estado: 'activo',
  },
  {
    id: 'prod-3',
    vendedor: { id: 'usr-elena', nombre: 'Elena Torres', unidad: 'Depto 108' },
    titulo: 'Sillón en buenas condiciones',
    descripcion: 'Color gris, 2 plazas. Muy cómodo, retiro en depto.',
    precio: 45000,
    imagenes: ['/images/sillon.jpg'],
    fecha_publicacion: '2026-06-08T14:00:00Z',
    cantidad_comentarios: 3,
    estado: 'activo',
  },
  {
    id: 'prod-moto',
    vendedor: { id: 'usr-pedro', nombre: 'Pedro Rojas', unidad: 'Depto B-204' },
    titulo: 'Moto Honda XR 150',
    descripcion: 'Moto en excelente estado, papeles al día. Ideal para la ciudad.',
    precio: 1250000,
    imagenes: ['/images/moto.jpg'],
    fecha_publicacion: '2026-06-12T10:00:00Z',
    cantidad_comentarios: 1,
    estado: 'activo',
  },
];

const MOCK_COMENTARIOS_MERCADITO = {
  'prod-1': [
    { id: 'mcom-1', autor: { id: 'usr-5', nombre: 'Luis Pérez' }, contenido: '¿Aún está disponible? ¿El precio es conversable?', fecha_creacion: '2026-06-11T09:00:00Z', respuesta_vendedor: null },
    { id: 'mcom-2', autor: { id: 'usr-ana', nombre: 'Ana Silva' }, contenido: 'Sí, está disponible. El precio es por la calidad del equipo.', fecha_creacion: '2026-06-11T09:30:00Z', respuesta_vendedor: '¡Hola Luis! Sí, está disponible. Podemos conversar el precio.' },
  ],
  'prod-2': [
    { id: 'mcom-3', autor: { id: 'usr-6', nombre: 'Rosa Hernández' }, contenido: '¿Hacés entregas en la portería?', fecha_creacion: '2026-06-10T18:00:00Z', respuesta_vendedor: null },
  ],
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const TIPO_ICONO = {
  aviso: <Megaphone size={16} weight="fill" aria-hidden="true" />,
  comunidad: <CalendarBlank size={16} weight="fill" aria-hidden="true" />,
  ayuda: <HandHeart size={16} weight="fill" aria-hidden="true" />,
};

const TIPO_LABEL = {
  aviso: 'Aviso',
  comunidad: 'Comunidad',
  ayuda: 'Ayuda',
};

const COLOR_AVATAR = {
  aviso: 'amarillo',
  comunidad: 'verde',
  ayuda: 'rosa',
};

const TABS = [
  { id: 'muro', label: 'Muro', panel: 'panel-muro', Icon: Users },
  { id: 'mercadito', label: 'Mercadito', panel: 'panel-mercadito', Icon: ShoppingBag },
];

const formatearFecha = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const diffHoras = Math.floor((ahora - fecha) / (1000 * 60 * 60));
  if (diffHoras < 1) return 'hace几分钟';
  if (diffHoras < 24) return `hace ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'ayer';
  return `hace ${diffDias} días`;
};

const formatearPrecio = (precio) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(precio);

// ---------------------------------------------------------------------------
// Componente: Comentario
// ---------------------------------------------------------------------------
function ComentarioItem({ comentario }) {
  return (
    <div className={styles.comentarioItem}>
      <div className={styles.comentarioAvatar} aria-hidden="true">
        {comentario.autor.nombre.charAt(0)}
      </div>
      <div className={styles.comentarioContenido}>
        <div className={styles.comentarioHeader}>
          <span className={styles.comentarioAutor}>{comentario.autor.nombre}</span>
          <span className={styles.comentarioTiempo}>{formatearFecha(comentario.fecha_creacion)}</span>
        </div>
        <p className={styles.comentarioTexto}>{comentario.contenido}</p>
        {comentario.respuesta_vendedor && (
          <div className={styles.respuestaVendedor}>
            <span className={styles.respuestaLabel}>Respuesta del vendedor:</span>
            <p className={styles.respuestaTexto}>{comentario.respuesta_vendedor}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Publicación del Muro
// ---------------------------------------------------------------------------
function PublicacionMuro({ publicacion, comentarios }) {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);

  return (
    <motion.article
      className={styles.publicacionCard}
      aria-label={`Publicación de ${publicacion.autor.nombre}: ${publicacion.contenido.slice(0, 50)}…`}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <div className={styles.pubHeader}>
        <div className={`${styles.pubAvatar} ${styles[`avatar--${COLOR_AVATAR[publicacion.tipo]}`]}`} aria-hidden="true">
          {publicacion.autor.nombre.charAt(0)}
        </div>
        <div className={styles.pubInfo}>
          <p className={styles.pubAutor}>{publicacion.autor.nombre}</p>
          <p className={styles.pubMeta}>
            <time>{formatearFecha(publicacion.fecha_creacion)}</time>
          </p>
        </div>
        <span className={`${styles.tipoBadge} ${styles[`tipo--${COLOR_AVATAR[publicacion.tipo]}`]}`} aria-label={`Tipo: ${TIPO_LABEL[publicacion.tipo]}`}>
          {TIPO_ICONO[publicacion.tipo]}
          {TIPO_LABEL[publicacion.tipo]}
        </span>
      </div>

      <p className={styles.pubContenido}>{publicacion.contenido}</p>

      <div className={styles.pubEstadisticas}>
        <span className={styles.estadistica}>
          <Heart size={14} weight="fill" aria-hidden="true" />
          {publicacion.me_gusta}
        </span>
        <button
          className={styles.btnVerComentarios}
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          aria-expanded={mostrarComentarios}
          aria-label={`${publicacion.cantidad_comentarios} comentarios`}
        >
          <Chat size={14} weight="fill" aria-hidden="true" />
          {publicacion.cantidad_comentarios} comentarios
        </button>
      </div>

      <AnimatePresence>
        {mostrarComentarios && (
          <motion.div
            className={styles.seccionComentarios}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.listaComentarios}>
              {comentarios.map((c) => (
                <ComentarioItem key={c.id} comentario={c} />
              ))}
            </div>
            <div className={styles.inputComentario}>
              <input
                type="text"
                placeholder="Escribe un comentario..."
                className={styles.input}
                aria-label="Escribir un comentario"
              />
              <button className={styles.btnEnviar} aria-label="Enviar comentario">
                <Chat size={16} weight="fill" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Componente: Producto del Mercadito
// ---------------------------------------------------------------------------
function ProductoMercadito({ producto, comentarios }) {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);

  return (
    <motion.article
      className={styles.mercaditoCard}
      aria-label={`${producto.titulo} — ${formatearPrecio(producto.precio)}, publicado por ${producto.vendedor.nombre}`}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <div className={styles.mercaditoImagen}>
        <img
          src={producto.imagenes[0]}
          alt={`Imagen de ${producto.titulo}`}
          className={styles.imagenProducto}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className={styles.placeholderImagen} style={{ display: 'none' }}>
          <Image size={32} weight="light" aria-hidden="true" />
        </div>
      </div>

      <div className={styles.mercaditoInfo}>
        <p className={styles.mercaditoTitulo}>{producto.titulo}</p>
        <p className={styles.mercaditoDesc}>{producto.descripcion}</p>
        <p className={styles.mercaditoVendedor}>
          <span>{producto.vendedor.nombre}</span>
          <span className={styles.mercaditoUnidad}> · {producto.vendedor.unidad}</span>
        </p>
        <button
          className={styles.btnVerComentarios}
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          aria-expanded={mostrarComentarios}
        >
          <Chat size={14} weight="fill" aria-hidden="true" />
          {producto.cantidad_comentarios} preguntas
        </button>
      </div>

      <div className={styles.mercaditoDerecha}>
        <span className={styles.mercaditoPrecio}>{formatearPrecio(producto.precio)}</span>
        <button
          className={styles.btnContactar}
          type="button"
          aria-label={`Contactar a ${producto.vendedor.nombre} por ${producto.titulo}`}
        >
          <Chat size={14} aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {mostrarComentarios && (
          <motion.div
            className={styles.seccionComentariosMercadito}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.listaComentarios}>
              {comentarios.length === 0 ? (
                <p className={styles.sinComentarios}>Aún no hay preguntas sobre este producto.</p>
              ) : (
                comentarios.map((c) => (
                  <ComentarioItem key={c.id} comentario={c} />
                ))
              )}
            </div>
            <div className={styles.inputComentario}>
              <input
                type="text"
                placeholder="Haz una pregunta al vendedor..."
                className={styles.input}
                aria-label="Hacer una pregunta"
              />
              <button className={styles.btnEnviar} aria-label="Enviar pregunta">
                <Chat size={16} weight="fill" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Contenido de la Página (Usa useSearchParams)
// ---------------------------------------------------------------------------
function ComunidadContenido() {
  const searchParams = useSearchParams();
  const tabInicial = searchParams.get('tab') === 'mercadito' ? 1 : 0;
  const [tabActiva, setTabActiva] = useState(tabInicial);

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
            <tab.Icon size={18} weight={tabActiva === i ? 'fill' : 'regular'} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Panel: Muro ===== */}
      <AnimatePresence mode="wait">
        {tabActiva === 0 && (
          <motion.div
            id="panel-muro"
            role="tabpanel"
            aria-labelledby="tab-muro"
            className={styles.panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {MOCK_PUBLICACIONES.map((pub) => (
              <PublicacionMuro
                key={pub.id}
                publicacion={pub}
                comentarios={MOCK_COMENTARIOS_MURO[pub.id] || []}
              />
            ))}

            <button
              className={styles.fab}
              aria-label="Crear nueva publicación en el muro comunitario"
              type="button"
            >
              <Plus size={22} weight="bold" aria-hidden="true" />
            </button>
          </motion.div>
        )}

        {/* ===== Panel: Mercadito ===== */}
        {tabActiva === 1 && (
          <motion.div
            id="panel-mercadito"
            role="tabpanel"
            aria-labelledby="tab-mercadito"
            className={styles.panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            <p className={styles.panelSubtitulo}>
              Compra, vende o intercambia con tus vecinos del Condominio Chinchorro.
            </p>
            {MOCK_PRODUCTOS.map((prod) => (
              <ProductoMercadito
                key={prod.id}
                producto={prod}
                comentarios={MOCK_COMENTARIOS_MERCADITO[prod.id] || []}
              />
            ))}

            <button
              className={styles.fab}
              aria-label="Publicar nuevo artículo en el Mercadito"
              type="button"
            >
              <Plus size={22} weight="bold" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Página Principal (Export) con Suspense
// ---------------------------------------------------------------------------
export default function PaginaComunidad() {
  return (
    <Suspense fallback={<div className={styles.pagina}><p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-texto-secundario)' }}>Cargando comunidad...</p></div>}>
      <ComunidadContenido />
    </Suspense>
  );
}