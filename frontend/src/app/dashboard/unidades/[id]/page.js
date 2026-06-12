// =============================================================================
// SUMA — Página de Detalle de Unidad (Standalone)
// Muestra la ficha completa de una unidad con mock data rico.
// =============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUnidades } from '../../../../lib/hooks/useUnidades.js';
import Boton from '../../../../componentes/ui/Boton.jsx';
import Input from '../../../../componentes/ui/Input.jsx';
import { ArrowLeft, Car, Package, PawPrint, Clock, CheckCircle, Warning, CurrencyDollar, EnvelopeSimple, Phone, User } from '@phosphor-icons/react';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ---------------------------------------------------------------------------
// Componente: Historial de Pagos
// ---------------------------------------------------------------------------
function SeccionHistorialPagos({ historial }) {
  if (!historial || historial.length === 0) {
    return <p className={styles.vacio}>Sin historial de pagos registrado.</p>;
  }

  return (
    <div className={styles.listaHistorial}>
      {historial.map((h, i) => (
        <div key={i} className={`${styles.itemHistorial} ${styles[`estado--${h.estado}`]}`}>
          <div className={styles.itemHistorialHeader}>
            <span className={styles.itemPeriodo}>{h.periodo}</span>
            <span className={`${styles.estadoBadge} ${styles[`badge--${h.estado}`]}`}>
              {h.estado === 'pagado' && <CheckCircle size={12} weight="fill" />}
              {h.estado === 'pendiente' && <Clock size={12} weight="fill" />}
              {h.estado === 'moroso' && <Warning size={12} weight="fill" />}
              {h.estado.charAt(0).toUpperCase() + h.estado.slice(1)}
            </span>
          </div>
          <div className={styles.itemHistorialDetalle}>
            <span className={styles.itemMonto}>{formatCLP(h.monto)}</span>
            {h.fecha_pago && (
              <span className={styles.itemFecha}>Pagado el {formatearFecha(h.fecha_pago)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Deudas Pendientes
// ---------------------------------------------------------------------------
function SeccionDeudas({ deudas }) {
  if (!deudas || deudas.length === 0) {
    return (
      <div className={styles.sinDeudas}>
        <CheckCircle size={24} weight="fill" className={styles.sinDeudasIcono} />
        <p>Esta unidad no tiene deudas pendientes.</p>
      </div>
    );
  }

  const totalDeuda = deudas.reduce((sum, d) => sum + d.monto, 0);

  return (
    <div className={styles.seccionDeudas}>
      <div className={styles.totalDeuda}>
        <span className={styles.totalDeudaLabel}>Total deuda:</span>
        <span className={styles.totalDeudaMonto}>{formatCLP(totalDeuda)}</span>
      </div>
      <div className={styles.listaDeudas}>
        {deudas.map((d, i) => (
          <div key={i} className={`${styles.itemDeuda} ${styles[`mora--${d.estado}`]}`}>
            <div className={styles.itemDeudaHeader}>
              <span className={styles.itemPeriodo}>{d.periodo}</span>
              <span className={styles.diasMora}>{d.dias_mora} días en mora</span>
            </div>
            <div className={styles.itemDeudaMonto}>
              <span>{formatCLP(d.monto)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Tarjeta de Contacto
// ---------------------------------------------------------------------------
function TarjetaContacto({ titular }) {
  return (
    <div className={styles.tarjetaContacto}>
      <div className={styles.contactoAvatar}>
        {titular.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
      <div className={styles.contactoInfo}>
        <p className={styles.contactoNombre}>{titular.nombre}</p>
        <p className={styles.contactoTipo}>{titular.tipo.charAt(0).toUpperCase() + titular.tipo.slice(1)}</p>
        <div className={styles.contactoDetalles}>
          {titular.email && (
            <a href={`mailto:${titular.email}`} className={styles.contactoItem}>
              <EnvelopeSimple size={14} weight="fill" />
              {titular.email}
            </a>
          )}
          {titular.telefono && (
            <a href={`tel:${titular.telefono}`} className={styles.contactoItem}>
              <Phone size={14} weight="fill" />
              {titular.telefono}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página Principal
// ---------------------------------------------------------------------------
export default function PaginaDetalleUnidad() {
  const router = useRouter();
  const { id: unidadId } = useParams();

  const {
    cargando,
    error,
    obtenerDetalleStandalone,
    actualizar,
    agregarTitular,
  } = useUnidades();

  const [unidad, setUnidad] = useState(null);
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('propietario');
  const [terceroForm, setTerceroForm] = useState({ nombre: '', rut: '', email: '', telefono: '' });
  const [mensajeLocal, setMensajeLocal] = useState(null);
  const [guardandoResponsable, setGuardandoResponsable] = useState(false);

  const cargar = useCallback(async () => {
    const datos = await obtenerDetalleStandalone(unidadId);
    if (datos) {
      setUnidad(datos);
      setResponsableSeleccionado(datos.responsable_pago || 'propietario');
      const tercero = datos.titulares?.find((t) => t.tipo === 'tercero');
      if (tercero) {
        setTerceroForm({
          nombre: tercero.nombre || '',
          rut: tercero.rut || '',
          email: tercero.email || '',
          telefono: tercero.telefono || '',
        });
      } else {
        setTerceroForm({ nombre: '', rut: '', email: '', telefono: '' });
      }
    }
  }, [unidadId, obtenerDetalleStandalone]);

  const handleGuardarResponsable = async () => {
    setGuardandoResponsable(true);
    setMensajeLocal(null);
    try {
      if (responsableSeleccionado === 'tercero') {
        if (!terceroForm.nombre.trim()) {
          setMensajeLocal({ tipo: 'error', texto: 'El nombre del tercero es obligatorio.' });
          setGuardandoResponsable(false);
          return;
        }

        await agregarTitular(unidad.condominio_id, unidad.id, {
          tipo: 'tercero',
          nombre: terceroForm.nombre.trim(),
          rut: terceroForm.rut.trim() || null,
          email: terceroForm.email.trim() || null,
          telefono: terceroForm.telefono.trim() || null,
        });
      }

      if (responsableSeleccionado === 'arrendatario') {
        const tieneArrendatario = unidad.titulares?.some((t) => t.tipo === 'arrendatario');
        if (!tieneArrendatario) {
          setMensajeLocal({ tipo: 'error', texto: 'No se puede designar al arrendatario porque no hay un arrendatario registrado.' });
          setGuardandoResponsable(false);
          return;
        }
      }

      await actualizar(unidad.id, {
        responsable_pago: responsableSeleccionado,
      });

      setMensajeLocal({ tipo: 'exito', texto: 'Responsable del pago actualizado con éxito.' });
      await cargar();
    } catch (err) {
      setMensajeLocal({ tipo: 'error', texto: err.message || 'Error al actualizar el responsable del pago.' });
    } finally {
      setGuardandoResponsable(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando && !unidad) {
    return <div className={styles.cargando}>Cargando ficha de unidad...</div>;
  }

  if (error && !unidad) {
    return (
      <div className={styles.pagina}>
        <div className={styles.error}>{error}</div>
        <Boton variante="fantasma" onClick={() => router.back()}>Volver</Boton>
      </div>
    );
  }

  if (!unidad) return null;

  const titulares = unidad.titulares || [];
  const vehiculos = unidad.vehiculos || [];
  const mascotas = unidad.mascotas || [];
  const historialPagos = unidad.historial_pagos || [];
  const deudasPendientes = unidad.deudas_pendientes || [];
  const propietario = titulares.find((t) => t.tipo === 'propietario');
  const arrendatario = titulares.find((t) => t.tipo === 'arrendatario');
  const tercero = titulares.find((t) => t.tipo === 'tercero');

  return (
    <div className={`${styles.pagina} animar-entrada`}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div>
          <Boton variante="fantasma" onClick={() => router.push('/dashboard/unidades')}>
            <><ArrowLeft size={16} weight="bold" /> Volver a unidades</>
          </Boton>
          <h1 className={styles.titulo}>
            Unidad {unidad.numero}
            {unidad.bloque_edificio && (
              <span className={styles.bloque}> — {unidad.bloque_edificio}</span>
            )}
          </h1>
          <p className={styles.subtitulo}>
            {unidad.condominio_nombre || 'Condominio'} · Alícuota: {(unidad.alicuota * 100).toFixed(2)}%
          </p>
        </div>
        <Boton
          variante="primario"
          onClick={() => router.push(`/dashboard/condominios/${unidad.condominio_id}/unidades/${unidad.id}`)}
        >
          Editar Ficha Completa
        </Boton>
      </div>

      {/* Sección 1: Datos Base */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Datos Base</h2>
        <div className={styles.mosaico}>
          <div className={`${styles.tarjetaDato} ${styles.tarjetaActiva}`}>
            <span className={styles.datoIcono}><Car size={24} weight="fill" /></span>
            <div>
              <span className={styles.datoEtiqueta}>Estacionamiento</span>
              <span className={styles.datoValor}>
                {unidad.tiene_estacionamiento ? (unidad.numero_estacionamiento || 'Asignado') : 'No tiene'}
              </span>
            </div>
          </div>
          <div className={`${styles.tarjetaDato} ${styles.tarjetaActiva}`}>
            <span className={styles.datoIcono}><Package size={24} weight="fill" /></span>
            <div>
              <span className={styles.datoEtiqueta}>Bodega</span>
              <span className={styles.datoValor}>
                {unidad.tiene_bodega ? (unidad.numero_bodega || 'Asignada') : 'No tiene'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 2: Contactos y Residentes */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Residentes y Contactos</h2>
        <div className={styles.gridContactos}>
          {propietario && <TarjetaContacto titular={propietario} />}
          {arrendatario && <TarjetaContacto titular={arrendatario} />}
          {tercero && <TarjetaContacto titular={tercero} />}
        </div>
      </section>

      {/* Sección 3: Responsable del Pago */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Responsable del Pago</h2>
        <div className={styles.tarjeta}>
          <p className={styles.descripcionSeccion}>
            Selecciona el titular o tercero encargado de recibir los cobros de gastos comunes.
          </p>

          {mensajeLocal && (
            <div className={mensajeLocal.tipo === 'exito' ? styles.exitoMsg : styles.errorMsg}>
              {mensajeLocal.texto}
            </div>
          )}

          <div className={styles.selectorResponsable}>
            <label className={`${styles.opcionResponsable} ${responsableSeleccionado === 'propietario' ? styles.opcionActiva : ''}`}>
              <input
                type="radio"
                name="responsable_pago"
                value="propietario"
                checked={responsableSeleccionado === 'propietario'}
                onChange={() => {
                  setResponsableSeleccionado('propietario');
                  setMensajeLocal(null);
                }}
                className={styles.radioOculto}
              />
              <span className={styles.radioLabel}>Propietario</span>
              {propietario ? (
                <span className={styles.radioSubLabel}>{propietario.nombre}</span>
              ) : (
                <span className={styles.radioSubLabelError}>Sin registrar</span>
              )}
            </label>

            <label className={`${styles.opcionResponsable} ${responsableSeleccionado === 'arrendatario' ? styles.opcionActiva : ''} ${!arrendatario ? styles.opcionDeshabilitada : ''}`}>
              <input
                type="radio"
                name="responsable_pago"
                value="arrendatario"
                checked={responsableSeleccionado === 'arrendatario'}
                disabled={!arrendatario}
                onChange={() => {
                  setResponsableSeleccionado('arrendatario');
                  setMensajeLocal(null);
                }}
                className={styles.radioOculto}
              />
              <span className={styles.radioLabel}>Arrendatario</span>
              {arrendatario ? (
                <span className={styles.radioSubLabel}>{arrendatario.nombre}</span>
              ) : (
                <span className={styles.radioSubLabelInfo}>No registrado en titulares</span>
              )}
            </label>

            <label className={`${styles.opcionResponsable} ${responsableSeleccionado === 'tercero' ? styles.opcionActiva : ''}`}>
              <input
                type="radio"
                name="responsable_pago"
                value="tercero"
                checked={responsableSeleccionado === 'tercero'}
                onChange={() => {
                  setResponsableSeleccionado('tercero');
                  setMensajeLocal(null);
                }}
                className={styles.radioOculto}
              />
              <span className={styles.radioLabel}>Tercero</span>
              {terceroForm.nombre ? (
                <span className={styles.radioSubLabel}>{terceroForm.nombre}</span>
              ) : (
                <span className={styles.radioSubLabelInfo}>Asignar datos...</span>
              )}
            </label>
          </div>

          {responsableSeleccionado === 'tercero' && (
            <div className={styles.formTercero}>
              <h3 className={styles.formTerceroTitulo}>Datos del Tercero</h3>
              <div className={styles.gridForm}>
                <Input
                  nombre="tercero_nombre"
                  etiqueta="Nombre completo"
                  placeholder="Ej: Juan Pérez (Familiar)"
                  valor={terceroForm.nombre}
                  onChange={(e) => setTerceroForm({ ...terceroForm, nombre: e.target.value })}
                  requerido
                />
                <Input
                  nombre="tercero_rut"
                  etiqueta="RUT"
                  placeholder="Ej: 12345678-9"
                  valor={terceroForm.rut}
                  onChange={(e) => setTerceroForm({ ...terceroForm, rut: e.target.value })}
                />
                <Input
                  nombre="tercero_email"
                  etiqueta="Email"
                  tipo="email"
                  placeholder="juan.perez@email.com"
                  valor={terceroForm.email}
                  onChange={(e) => setTerceroForm({ ...terceroForm, email: e.target.value })}
                />
                <Input
                  nombre="tercero_telefono"
                  etiqueta="Teléfono"
                  placeholder="Ej: +56912345678"
                  valor={terceroForm.telefono}
                  onChange={(e) => setTerceroForm({ ...terceroForm, telefono: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className={styles.accionesResponsable}>
            <Boton
              variante="primario"
              onClick={handleGuardarResponsable}
              cargando={guardandoResponsable}
            >
              Guardar Responsable del Pago
            </Boton>
          </div>
        </div>
      </section>

      {/* Sección 4: Historial de Pagos */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <CurrencyDollar size={18} weight="fill" aria-hidden="true" />
          Historial de Pagos
        </h2>
        <div className={styles.tarjeta}>
          <SeccionHistorialPagos historial={historialPagos} />
        </div>
      </section>

      {/* Sección 5: Deudas Pendientes */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <Warning size={18} weight="fill" aria-hidden="true" />
          Deudas Pendientes
        </h2>
        <div className={styles.tarjeta}>
          <SeccionDeudas deudas={deudasPendientes} />
        </div>
      </section>

      {/* Sección 6: Vehículos */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Vehículos ({vehiculos.length})</h2>
        <div className={styles.tarjeta}>
          {vehiculos.length === 0 ? (
            <p className={styles.vacio}>Sin vehículos registrados.</p>
          ) : (
            <ul className={styles.lista}>
              {vehiculos.map((v) => (
                <li key={v.id} className={styles.itemLista}>
                  <span className={styles.itemBadge}>{v.tipo_vehiculo}</span>
                  <span className={styles.itemTexto}>{v.patente}</span>
                  {v.modelo && <span className={styles.itemDetalle}>{v.modelo}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Sección 7: Mascotas */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Mascotas ({mascotas.length})</h2>
        <div className={styles.tarjeta}>
          {mascotas.length === 0 ? (
            <p className={styles.vacio}>Sin mascotas registradas.</p>
          ) : (
            <ul className={styles.lista}>
              {mascotas.map((m) => (
                <li key={m.id} className={styles.itemLista}>
                  <span className={styles.itemEmoji}>
                    <PawPrint size={20} weight="fill" />
                  </span>
                  <span className={styles.itemTexto}>{m.nombre}</span>
                  <span className={styles.itemDetalle}>{m.especie}{m.raza ? ` · ${m.raza}` : ''}{m.edad ? ` · ${m.edad}` : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}