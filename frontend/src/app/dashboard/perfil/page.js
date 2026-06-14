// =============================================================================
// SUMA — Pantalla Perfil (Notificaciones, Seguridad, Ayuda y Soporte)
// 100% mock data basado en API_SPEC_PERFIL.md
// WCAG 2.2 AA
// =============================================================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  SignOut,
  Bell,
  Lock,
  Question,
  ArrowLeft,
  Check,
  Desktop,
  DeviceMobile,
  Eye,
  EyeSlash,
  CaretRight,
  Warning,
  Info,
  Chat,
  Ticket,
  Article,
  EnvelopeSimple,
  Phone,
} from '@phosphor-icons/react';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Mock data — Basado en API_SPEC_PERFIL.md
// ---------------------------------------------------------------------------
const MOCK_PERFIL = {
  nombre: 'María González',
  email: 'mgonzalez@chinchorro.cl',
  unidad: 'B-201',
  rol: 'Administradora',
  condominio: 'Condominio Chinchorro',
};

const MOCK_NOTIFICACIONES = {
  alertas_gastos_comunes: true,
  alertas_nuevos_comunicados: true,
  alertas_mercadito: false,
  notificaciones_email: true,
  notificaciones_push: true,
};

const MOCK_SESIONES = [
  {
    id: 'sesion-1',
    dispositivo: 'Chrome en Windows',
    ip: '190.164.2.1',
    ultima_actividad: '2026-06-11T19:50:00Z',
    es_actual: true,
  },
  {
    id: 'sesion-2',
    dispositivo: 'Safari en iPhone',
    ip: '190.164.2.1',
    ultima_actividad: '2026-06-10T08:15:00Z',
    es_actual: false,
  },
  {
    id: 'sesion-3',
    dispositivo: 'Firefox en Linux',
    ip: '190.164.2.45',
    ultima_actividad: '2026-06-05T14:30:00Z',
    es_actual: false,
  },
];

const MOCK_FAQS = [
  {
    id: 'faq-1',
    pregunta: '¿Cómo recupero mi contraseña?',
    respuesta: 'Puedes recuperar tu contraseña desde la pantalla de inicio de sesión. Haz clic en "¿Olvidaste tu contraseña?" e ingresa tu correo electrónico registered. Recibirás un enlace para restablecer tu contraseña en tu bandeja de entrada.',
  },
  {
    id: 'faq-2',
    pregunta: '¿Cómo contacto a mi administrador?',
    respuesta: 'En el módulo de Condominio encontrarás la información de contacto de tu administrador. También puedes enviar mensajes directos a través del Muro comunitario.',
  },
  {
    id: 'faq-3',
    pregunta: '¿Cómo reporto un problema técnico?',
    respuesta: 'Para reportar problemas técnicos puedes crear un ticket de soporte desde la sección "Ayuda y Soporte" en tu perfil. Nuestro equipo técnico responderá en menos de 24 horas hábiles.',
  },
  {
    id: 'faq-4',
    pregunta: '¿Puedo ver el historial de mis pagos?',
    respuesta: 'Sí, en la sección "Finanzas" de tu dashboard puedes ver el historial completo de pagos de tu unidad, incluyendo períodos pendientes y morosos.',
  },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const formatearFechaSesion = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const diffHoras = Math.floor((ahora - fecha) / (1000 * 60 * 60));
  if (diffHoras < 1) return 'Hace pocos minutos';
  if (diffHoras < 24) return `Hace ${diffHoras} horas`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias} días`;
  return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ---------------------------------------------------------------------------
// Componente: Toggle Switch
// ---------------------------------------------------------------------------
function ToggleSwitch({ checked, onChange, label, desc }) {
  return (
    <div className={styles.toggleItem}>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        {desc && <span className={styles.toggleDesc}>{desc}</span>}
      </div>
      <button
        className={`${styles.toggleSwitch} ${checked ? styles.toggleActivo : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Sesión de dispositivo
// ---------------------------------------------------------------------------
function SesionItem({ sesion }) {
  const esMobil = sesion.dispositivo.toLowerCase().includes('iphone') || sesion.dispositivo.toLowerCase().includes('android');
  const IconoDispositivo = esMobil ? Mobile : Desktop;

  return (
    <div className={`${styles.sesionItem} ${sesion.es_actual ? styles.sesionActual : ''}`}>
      <div className={styles.sesionIcono}>
        <IconoDispositivo size={20} weight="fill" />
      </div>
      <div className={styles.sesionInfo}>
        <div className={styles.sesionHeader}>
          <span className={styles.sesionDispositivo}>{sesion.dispositivo}</span>
          {sesion.es_actual && (
            <span className={styles.sesionBadgeActual}>Actual</span>
          )}
        </div>
        <span className={styles.sesionIp}>IP: {sesion.ip}</span>
        <span className={styles.sesionTiempo}>{formatearFechaSesion(sesion.ultima_actividad)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: FAQ Item
// ---------------------------------------------------------------------------
function FaqItem({ faq }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className={`${styles.faqItem} ${expandido ? styles.faqExpandido : ''}`}>
      <button
        className={styles.faqPregunta}
        onClick={() => setExpandido(!expandido)}
        aria-expanded={expandido}
      >
        <span>{faq.pregunta}</span>
        <CaretRight size={16} weight="bold" className={`${styles.faqFlecha} ${expandido ? styles.faqFlechaAbierta : ''}`} />
      </button>
      <AnimatePresence>
        {expandido && (
          <motion.div
            className={styles.faqRespuesta}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p>{faq.respuesta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista: Notificaciones
// ---------------------------------------------------------------------------
function VistaNotificaciones({ config, onUpdate }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [guardado, setGuardado] = useState(false);

  const handleToggle = (key) => {
    const nuevo = { ...localConfig, [key]: !localConfig[key] };
    setLocalConfig(nuevo);
    onUpdate(nuevo);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <motion.div
      className={styles.vista}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className={styles.vistaHeader}>
        <h2 className={styles.vistaTitulo}>
          <Bell size={20} weight="fill" />
          Preferencias de Notificación
        </h2>
        <p className={styles.vistaDesc}>
          Configura cómo y cuándo quieres recibir alertas de SUMA.
        </p>
      </div>

      {guardado && (
        <div className={styles.mensajeExito}>
          <Check size={16} weight="bold" />
          Cambios guardados correctamente
        </div>
      )}

      <div className={styles.tarjeta}>
        <h3 className={styles.tarjetaSubtitulo}>Alertas dentro de la App</h3>
        <ToggleSwitch
          label="Gastos Comunes"
          desc="Recibe alertas cuando se publiquen nuevos gastos comunes"
          checked={localConfig.alertas_gastos_comunes}
          onChange={() => handleToggle('alertas_gastos_comunes')}
        />
        <ToggleSwitch
          label="Comunicados"
          desc="Notificaciones de la administración del condominio"
          checked={localConfig.alertas_nuevos_comunicados}
          onChange={() => handleToggle('alertas_nuevos_comunicados')}
        />
        <ToggleSwitch
          label="Mercadito"
          desc="Preguntas y respuestas sobre productos que te interesan"
          checked={localConfig.alertas_mercadito}
          onChange={() => handleToggle('alertas_mercadito')}
        />
      </div>

      <div className={styles.tarjeta}>
        <h3 className={styles.tarjetaSubtitulo}>Canales de Comunicación</h3>
        <ToggleSwitch
          label="Notificaciones Push"
          desc="Alertas en tu dispositivo móvil"
          checked={localConfig.notificaciones_push}
          onChange={() => handleToggle('notificaciones_push')}
        />
        <ToggleSwitch
          label="Correo Electrónico"
          desc="Resumen periódoco a tu email"
          checked={localConfig.notificaciones_email}
          onChange={() => handleToggle('notificaciones_email')}
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Vista: Seguridad
// ---------------------------------------------------------------------------
function VistaSeguridad({ sesiones }) {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const handleCambiarPassword = (e) => {
    e.preventDefault();
    if (passwordNueva !== confirmarPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    if (passwordNueva.length < 8) {
      setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    setMensaje({ tipo: 'exito', texto: 'Contraseña actualizada correctamente.' });
    setPasswordActual('');
    setPasswordNueva('');
    setConfirmarPassword('');
  };

  return (
    <motion.div
      className={styles.vista}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className={styles.vistaHeader}>
        <h2 className={styles.vistaTitulo}>
          <Lock size={20} weight="fill" />
          Seguridad y Acceso
        </h2>
        <p className={styles.vistaDesc}>
          Gestiona tus sesiones activas y cambia tu contraseña.
        </p>
      </div>

      <div className={styles.tarjeta}>
        <h3 className={styles.tarjetaSubtitulo}>Sesiones Activas</h3>
        <p className={styles.seguridadDesc}>
          Dispositivos donde tu cuenta está actualmente abierta. Cierra las sesiones que no reconozcas.
        </p>
        <div className={styles.listaSesiones}>
          {sesiones.map((sesion) => (
            <SesionItem key={sesion.id} sesion={sesion} />
          ))}
        </div>
        <button className={styles.btnCerrarSesiones}>
          Cerrar todas las demás sesiones
        </button>
      </div>

      <div className={styles.tarjeta}>
        <h3 className={styles.tarjetaSubtitulo}>Cambiar Contraseña</h3>
        <form onSubmit={handleCambiarPassword} className={styles.formPassword}>
          <div className={styles.campoPassword}>
            <label className={styles.label}>Contraseña Actual</label>
            <div className={styles.inputWrapper}>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className={styles.input}
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                className={styles.btnVerPassword}
                onClick={() => setMostrarPassword(!mostrarPassword)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.campoPassword}>
            <label className={styles.label}>Nueva Contraseña</label>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              className={styles.input}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className={styles.campoPassword}>
            <label className={styles.label}>Confirmar Nueva Contraseña</label>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className={styles.input}
              placeholder="Repite la nueva contraseña"
            />
          </div>

          {mensaje && (
            <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`}>
              {mensaje.tipo === 'exito' ? <Check size={16} weight="bold" /> : <Warning size={16} weight="fill" />}
              {mensaje.texto}
            </div>
          )}

          <button type="submit" className={styles.btnActualizarPassword}>
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Vista: Ayuda y Soporte
// ---------------------------------------------------------------------------
function VistaAyuda() {
  const [categoria, setCategoria] = useState('Error Técnico');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ticketEnviado, setTicketEnviado] = useState(false);

  const categorias = ['Error Técnico', 'Consulta General', 'Sugerencia', 'Otro'];

  const handleEnviarTicket = (e) => {
    e.preventDefault();
    if (!asunto.trim() || !descripcion.trim()) return;
    setTicketEnviado(true);
    setTimeout(() => {
      setTicketEnviado(false);
      setAsunto('');
      setDescripcion('');
      setCategoria('Error Técnico');
    }, 3000);
  };

  return (
    <motion.div
      className={styles.vista}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className={styles.vistaHeader}>
        <h2 className={styles.vistaTitulo}>
          <Question size={20} weight="fill" />
          Ayuda y Soporte
        </h2>
        <p className={styles.vistaDesc}>
          Encuentra respuestas a preguntas frecuentes o crea un ticket de soporte.
        </p>
      </div>

      <div className={styles.infoBox}>
        <Info size={18} weight="fill" />
        <p>Nuestro equipo técnico responde en menos de 24 horas hábiles.</p>
      </div>

      <div className={styles.tarjeta}>
        <h3 className={styles.tarjetaSubtitulo}>
          <Article size={18} weight="fill" />
          Preguntas Frecuentes
        </h3>
        <div className={styles.listaFaqs}>
          {MOCK_FAQS.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
      </div>

      <div className={styles.tarjeta}>
        <h3 className={styles.tarjetaSubtitulo}>
          <Ticket size={18} weight="fill" />
          Crear Ticket de Soporte
        </h3>
        <p className={styles.seguridadDesc}>
          ¿Encontraste un problema que no está en las FAQs? Cuéntanos y te ayudaremos.
        </p>

        {ticketEnviado ? (
          <div className={styles.mensajeExito}>
            <Check size={16} weight="bold" />
            Ticket enviado exitosamente. Te responderemos pronto.
          </div>
        ) : (
          <form onSubmit={handleEnviarTicket} className={styles.formTicket}>
            <div className={styles.campoForm}>
              <label className={styles.label}>Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={styles.select}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.campoForm}>
              <label className={styles.label}>Asunto</label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className={styles.input}
                placeholder="Ej: Problema al cargar el comprobante"
                required
              />
            </div>

            <div className={styles.campoForm}>
              <label className={styles.label}>Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className={styles.textarea}
                placeholder="Describe el problema con el mayor detalle posible..."
                rows={4}
                required
              />
            </div>

            <button type="submit" className={styles.btnEnviarTicket}>
              <Ticket size={16} weight="fill" />
              Enviar Ticket
            </button>
          </form>
        )}
      </div>

      <div className={styles.tarjeta}>
        <h3 className={styles.tarjetaSubtitulo}>Otros Canales de Soporte</h3>
        <div className={styles.canalesSoporte}>
          <a href="mailto:soporte@comunidapp.cl" className={styles.canalItem}>
            <EnvelopeSimple size={20} weight="fill" />
            <div>
              <span className={styles.canalLabel}>Correo Electrónico</span>
              <span className={styles.canalValor}>soporte@comunidapp.cl</span>
            </div>
          </a>
          <a href="tel:+56912345678" className={styles.canalItem}>
            <Phone size={20} weight="fill" />
            <div>
              <span className={styles.canalLabel}>Teléfono</span>
              <span className={styles.canalValor}>+56 9 1234 5678</span>
            </div>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Opción de menú
// ---------------------------------------------------------------------------
function OpcionMenu({ icono: Icono, label, desc, activa, onClick }) {
  return (
    <button
      className={`${styles.opcionItem} ${activa ? styles.opcionActiva : ''}`}
      onClick={onClick}
    >
      <span className={styles.opcionIcono} aria-hidden="true">
        <Icono size={20} weight="fill" />
      </span>
      <div className={styles.opcionTexto}>
        <span className={styles.opcionLabel}>{label}</span>
        <span className={styles.opcionDesc}>{desc}</span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Página Principal
// ---------------------------------------------------------------------------
export default function PaginaPerfil() {
  const [vistaActiva, setVistaActiva] = useState(null);
  const [configNotif, setConfigNotif] = useState(MOCK_NOTIFICACIONES);
  const p = MOCK_PERFIL;

  const volverAPerfil = () => setVistaActiva(null);

  return (
    <div className={styles.pagina}>

      {/* ===== Vista: Perfil Principal ===== */}
      <AnimatePresence mode="wait">
        {!vistaActiva && (
          <motion.div
            key="perfil"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Avatar y datos del usuario */}
            <section aria-label="Datos del perfil" className={styles.perfilHero}>
              <div className={styles.avatarGrande} aria-hidden="true">
                <img src="/images/maria.jpg" alt={p.nombre} className={styles.avatarImagen} />
              </div>
              <h2 className={styles.perfilNombre}>{p.nombre}</h2>
              <p className={styles.perfilEmail}>{p.email}</p>
              <div className={styles.perfilBadges}>
                <span className={styles.badge}>{p.rol}</span>
                <span className={styles.badgeUnidad}>Unidad {p.unidad}</span>
              </div>
              <p className={styles.perfilCondominio}>{p.condominio}</p>
            </section>

            {/* Opciones */}
            <section aria-label="Opciones de perfil" className={styles.seccion}>
              <OpcionMenu
                icono={Bell}
                label="Notificaciones"
                desc="Configurar alertas"
                onClick={() => setVistaActiva('notificaciones')}
              />
              <OpcionMenu
                icono={Lock}
                label="Seguridad"
                desc="Contraseña y acceso"
                onClick={() => setVistaActiva('seguridad')}
              />
              <OpcionMenu
                icono={Question}
                label="Ayuda y soporte"
                desc="Centro de ayuda SUMA"
                onClick={() => setVistaActiva('ayuda')}
              />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Vista: Notificaciones ===== */}
      <AnimatePresence>
        {vistaActiva === 'notificaciones' && (
          <VistaNotificaciones
            key="notificaciones"
            config={configNotif}
            onUpdate={setConfigNotif}
          />
        )}
      </AnimatePresence>

      {/* ===== Vista: Seguridad ===== */}
      <AnimatePresence>
        {vistaActiva === 'seguridad' && (
          <VistaSeguridad key="seguridad" sesiones={MOCK_SESIONES} />
        )}
      </AnimatePresence>

      {/* ===== Vista: Ayuda ===== */}
      <AnimatePresence>
        {vistaActiva === 'ayuda' && (
          <VistaAyuda key="ayuda" />
        )}
      </AnimatePresence>

      {/* Botón Volver (visible en sub-vistas) */}
      <AnimatePresence>
        {vistaActiva && (
          <motion.button
            key="volver"
            className={styles.btnVolver}
            onClick={volverAPerfil}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ArrowLeft size={16} weight="bold" />
            Volver al Perfil
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}